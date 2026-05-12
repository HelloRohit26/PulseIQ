import os
import psycopg2
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.cluster import KMeans
from dotenv import load_dotenv

# Auth module
from auth import init_users_table, register_user, login_user, verify_token

load_dotenv(override=True)

# --- 1. INITIALIZE API & AI ---
app = FastAPI(title="PulseIQ AI API", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize users table on startup
@app.on_event("startup")
def startup_event():
    try:
        init_users_table()
        print("✅ Users table initialized!")
    except Exception as e:
        print(f"⚠️ Could not initialize users table (DB may not be ready): {e}")

# Setup AI — ALL langchain imports are inside try/except so the API
# can still start even if langchain packages are missing or incompatible.
rag_chain = None
vector_store = None
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_chroma import Chroma
    from langchain_core.prompts import ChatPromptTemplate
    import chromadb

    # LangChain v1.0+ moved chains to langchain-classic package
    try:
        from langchain_classic.chains.combine_documents import create_stuff_documents_chain
        from langchain_classic.chains import create_retrieval_chain
        print("📦 Using langchain-classic for chains")
    except ImportError:
        from langchain.chains.combine_documents import create_stuff_documents_chain
        from langchain.chains import create_retrieval_chain
        print("📦 Using langchain for chains")

    # Get API key - check both env var names
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("No GOOGLE_API_KEY or GEMINI_API_KEY found in environment!")
    print(f"🔑 API key found (starts with: {api_key[:8]}...)")

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    chroma_client = chromadb.PersistentClient(path="./chroma_data")
    vector_store = Chroma(client=chroma_client, collection_name="pulseiq_news", embedding_function=embeddings)
    llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.3, google_api_key=api_key)

    system_prompt = (
        "You are PulseIQ, an advanced real-time financial news AI. "
        "Use the following retrieved news context to answer the user's question. "
        "Always cite the sources mentioned in the context. "
        "\n\nContext:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{input}")])
    retriever = vector_store.as_retriever(search_kwargs={"k": 5}) 
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    print("✅ AI RAG chain initialized successfully!")
except Exception as e:
    print(f"⚠️ AI initialization failed (API will still serve basic endpoints): {e}")
    import traceback
    traceback.print_exc()
    rag_chain = None



# --- 2. DATABASE HELPER ---
def get_db_connection():
    return psycopg2.connect(host="postgres", port="5432", database="pulseiq_db", user="pulseiq_user", password="mysecretpassword")

# --- 3. API ENDPOINTS ---

@app.get("/api/")
def read_root():
    return {"message": "Welcome to the PulseIQ API Backend!"}

@app.get("/api/health")
def health_check():
    """Health check endpoint for Docker/monitoring."""
    return {"status": "healthy", "rag_chain": rag_chain is not None}

@app.get("/api/articles")
def get_recent_articles(limit: int = 10):
    """Fetches the most recent articles from PostgreSQL."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT title, source, sentiment, sentiment_score FROM articles ORDER BY published_at DESC LIMIT %s;", (limit,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        articles = [{"title": r[0], "source": r[1], "sentiment": r[2], "score": r[3]} for r in rows]
        return {"articles": articles}
    except Exception as e:
        print(f"⚠️ Database error in get_articles: {e}")
        return {"articles": []}


# --- AUTH MODELS ---
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenRequest(BaseModel):
    token: str

class QueryRequest(BaseModel):
    question: str

@app.post("/api/query")
def ask_pulseiq(request: QueryRequest):
    """Hits the Gemini + ChromaDB RAG pipeline."""
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="AI engine is not available. Check server logs for initialization errors.")
    try:
        response = rag_chain.invoke({"input": request.question})
        return {"question": request.question, "answer": response["answer"]}
    except Exception as e:
        import traceback
        print(f"ERROR in ask_pulseiq: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI query failed: {str(e)}")

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/register")
def api_register(request: RegisterRequest):
    """Register a new user."""
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if len(request.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    
    result = register_user(request.username, request.email, request.password, request.full_name)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/auth/login")
def api_login(request: LoginRequest):
    """Authenticate a user."""
    result = login_user(request.username, request.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@app.post("/api/auth/verify")
def api_verify(request: TokenRequest):
    """Verify a JWT token."""
    payload = verify_token(request.token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"valid": True, "user": payload}

@app.post("/api/cluster")
def cluster_articles():
    """Runs K-Means Clustering to group similar articles into topics."""
    conn = get_db_connection()
    # Fetch articles that don't have a topic cluster yet
    df = pd.read_sql("SELECT id, content FROM articles WHERE topic_cluster IS NULL AND content != '';", conn)
    
    if len(df) < 5:
        return {"message": "Not enough new articles to run clustering."}
    
    # We ask ChromaDB for the vector numbers for these exact articles
    docs = vector_store.get(ids=[str(id) for id in df['id'].tolist()], include=["embeddings"])
    
    if not docs['embeddings']:
        return {"message": "No embeddings found to cluster."}

    # --- K-MEANS ML ALGORITHM ---
    # We tell it to find 3 main topics hidden in the data
    num_clusters = min(3, len(docs['embeddings'])) 
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(docs['embeddings'])
    
    # Save the new topic clusters back to PostgreSQL
    cur = conn.cursor()
    for doc_id, cluster_id in zip(docs['ids'], clusters):
        cur.execute("UPDATE articles SET topic_cluster = %s WHERE id = %s", (f"Topic_{cluster_id}", int(doc_id)))
    conn.commit()
    cur.close()
    conn.close()
    
    return {"message": f"Successfully clustered {len(docs['ids'])} articles into {num_clusters} topics!"}

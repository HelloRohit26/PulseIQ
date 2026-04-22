import os
import psycopg2
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.cluster import KMeans
from dotenv import load_dotenv

# Import your RAG chain from the script you just built!
# (We need to slightly modify query.py later to make it importable, 
# but for now, we will rebuild a lightweight version of the query here)
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
import chromadb

load_dotenv()

# --- 1. INITIALIZE API & AI ---
app = FastAPI(title="PulseIQ AI API", version="1.0")

# Setup AI (Just like in Step 9)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path="./chroma_data")
vector_store = Chroma(client=chroma_client, collection_name="pulseiq_news", embedding_function=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

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

# --- 2. DATABASE HELPER ---
def get_db_connection():
    return psycopg2.connect(host="postgres", port="5432", database="pulseiq_db", user="pulseiq_user", password="mysecretpassword")

# --- 3. API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the PulseIQ API Backend!"}

@app.get("/articles")
def get_recent_articles(limit: int = 10):
    """Fetches the most recent articles from PostgreSQL."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT title, source, sentiment, sentiment_score FROM articles ORDER BY published_at DESC LIMIT %s;", (limit,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    articles = [{"title": r[0], "source": r[1], "sentiment": r[2], "score": r[3]} for r in rows]
    return {"articles": articles}

class QueryRequest(BaseModel):
    question: str

@app.post("/query")
def ask_pulseiq(request: QueryRequest):
    """Hits the Gemini + ChromaDB RAG pipeline."""
    try:
        response = rag_chain.invoke({"input": request.question})
        return {"question": request.question, "answer": response["answer"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster")
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
import os
import chromadb
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# Load secrets
load_dotenv(override=True)
if "GOOGLE_API_KEY" not in os.environ:
    print("ERROR: Please add GOOGLE_API_KEY to your .env file!")
    exit()

print("--- WAKING UP PULSEIQ AI BRAIN ---")
print("⏳ Connecting to Vector Database and Gemini...")

# --- 1. SETUP EMBEDDINGS ---
# This MUST match the model ChromaDB used in the consumer script
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# --- 2. CONNECT TO CHROMADB ---
chroma_client = chromadb.PersistentClient(path="./chroma_data")
vector_store = Chroma(
    client=chroma_client,
    collection_name="pulseiq_news",
    embedding_function=embeddings
)

# --- 3. INITIALIZE GEMINI ---
llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.3)

# --- 4. BUILD THE RAG PROMPT ---
from datetime import datetime, timezone
current_utc = datetime.now(timezone.utc).strftime("%A, %B %d, %Y at %H:%M UTC")
system_prompt = (
    f"You are PulseIQ, an advanced institutional real-time financial news AI terminal. "
    f"Today's exact live date and time is {current_utc}. "
    "Use the following pieces of retrieved news context to answer the user's question. "
    "If the answer is not in the context, synthesize the macro implications or clearly state recent limits. "
    "Always cite the sources (e.g., Reuters, Bloomberg) mentioned in the context. "
    "If asked about today's date or the current year, always state today's date based on the live timestamp provided above.\n\n"
    "Context:\n{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# --- 5. ASSEMBLE THE PIPELINE ---
# We tell the retriever to fetch the top 5 most relevant articles
retriever = vector_store.as_retriever(search_kwargs={"k": 5}) 
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("✅ AI Brain Ready!")
print("-" * 50)

# --- 6. THE CHAT INTERFACE ---
while True:
    user_query = input("\nAsk PulseIQ (or type 'exit'): ")
    if user_query.lower() == 'exit':
        break
        
    print("🔍 Searching live news and analyzing...")
    
    # Run the query through the RAG pipeline
    response = rag_chain.invoke({"input": user_query})
    
    print("\n🤖 PulseIQ:")
    print(response["answer"])
    print("-" * 50)
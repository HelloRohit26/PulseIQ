import json
import psycopg2
from kafka import KafkaConsumer
from transformers import pipeline
import chromadb

print("--- STARTING AI & VECTOR CONSUMER (Port 5433) ---")
print("⏳ Loading Models (Sentiment & Embeddings)...")

# --- 1. LOAD AI MODELS ---
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# --- NEW: INITIALIZE CHROMADB ---
# This creates a local folder called 'chroma_data' to store our vectors
chroma_client = chromadb.PersistentClient(path="./chroma_data")
# Create a collection (like a table in SQL)
collection = chroma_client.get_or_create_collection(name="pulseiq_news")

print("✅ AI Models & Vector Database Ready!")

# --- 2. CONNECT TO POSTGRESQL ---
def get_db_connection():
    return psycopg2.connect(
        host="postgres",
        port="5432",        
        database="pulseiq_db",
        user="pulseiq_user",
        password="mysecretpassword"
    )

def create_table_if_not_exists():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title TEXT,
            content TEXT,
            source VARCHAR(255),
            published_at TIMESTAMP,
            sentiment VARCHAR(50),
            sentiment_score FLOAT,
            topic_cluster VARCHAR(100),
            processed BOOLEAN DEFAULT FALSE
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()

# --- 3. INITIALIZE KAFKA CONSUMER WITH RETRY ---
import time

def create_consumer(retries=10, delay=5):
    for attempt in range(1, retries + 1):
        try:
            c = KafkaConsumer(
                'news_articles',
                bootstrap_servers=['kafka:9092'],
                api_version=(2, 5, 0),
                auto_offset_reset='earliest', 
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            print("✅ Connected to Kafka!")
            return c
        except Exception as e:
            print(f"⏳ Kafka not ready (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)
    raise Exception("❌ Could not connect to Kafka after multiple retries.")

consumer = create_consumer()

def consume_and_store():
    create_table_if_not_exists()
    print("🎧 Listening to Kafka stream... Waiting for articles...")
    
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        for message in consumer:
            article = message.value
            
            title = article.get('title', '')
            content = article.get('content', '')
            source = article.get('source', {}).get('name', 'Unknown')
            published_at = article.get('publishedAt', 'Unknown')

            text_to_analyze = content if content else title
            if not text_to_analyze: continue

            # --- AI SENTIMENT ---
            result = sentiment_analyzer(text_to_analyze[:512])[0] 
            sentiment_label = result['label']
            sentiment_score = float(result['score'])

            if sentiment_score < 0.5: continue

            # --- SAVE TO POSTGRESQL ---
            # Notice the 'RETURNING id' at the end. We need this ID to link ChromaDB to Postgres!
            cur.execute("""
                INSERT INTO articles (title, content, source, published_at, sentiment, sentiment_score)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (title, content, source, published_at, sentiment_label, sentiment_score))
            
            postgres_id = cur.fetchone()[0] # Grab the new ID
            conn.commit()

            # --- NEW: SAVE TO CHROMADB ---
            # We store the text, the ID, and the exact metadata your PDF specified
            collection.add(
                documents=[text_to_analyze],
                metadatas=[{
                    "id": postgres_id,
                    "source": source,
                    "date": str(published_at),
                    "sentiment": sentiment_label
                }],
                ids=[str(postgres_id)] # Chroma requires string IDs
            )

            print(f"💾 SAVED TO DB & VECTORIZED: {title[:40]}...")

    except KeyboardInterrupt:
        print("\nStopping consumer...")
    except Exception as e:
        print(f"Database Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    consume_and_store()
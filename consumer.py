import os
import json
import re
import psycopg2
import time
from kafka import KafkaConsumer
from transformers import pipeline
import chromadb

print("--- STARTING AI & VECTOR CONSUMER ---")
print("⏳ Loading Models (Financial Sentiment & Embeddings)...")

# --- 1. LOAD AI MODELS ---
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    truncation=True,
    max_length=512
)

# --- INITIALIZE CHROMADB ---
chroma_client = chromadb.PersistentClient(path="./chroma_data")
collection = chroma_client.get_or_create_collection(name="pulseiq_news")

print("✅ AI Models & Vector Database Ready!")

# --- 2. CONNECT TO POSTGRESQL ---
def get_db_connection():
    host = os.getenv("POSTGRES_HOST", "postgres")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "pulseiq_db")
    user = os.getenv("POSTGRES_USER", "pulseiq_user")
    password = os.getenv("POSTGRES_PASSWORD", "mysecretpassword")
    
    try:
        return psycopg2.connect(host=host, port=port, database=db, user=user, password=password, connect_timeout=3)
    except Exception:
        return psycopg2.connect(host="localhost", port=port, database=db, user=user, password=password, connect_timeout=3)

def create_table_if_not_exists():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title TEXT UNIQUE,
            content TEXT,
            source VARCHAR(255),
            published_at TIMESTAMP,
            sentiment VARCHAR(50),
            sentiment_score FLOAT,
            topic_cluster VARCHAR(100),
            entities JSONB DEFAULT '[]',
            processed BOOLEAN DEFAULT FALSE
        );
        CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published_at DESC);
        CREATE INDEX IF NOT EXISTS idx_articles_sentiment ON articles (sentiment);
    ''')
    conn.commit()
    cur.close()
    conn.close()

# --- 3. INITIALIZE KAFKA CONSUMER WITH RETRY ---
def create_consumer(retries=10, delay=5):
    bootstrap_server = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')
    fallback_server = 'localhost:9092'

    for attempt in range(1, retries + 1):
        for srv in [bootstrap_server, fallback_server]:
            try:
                c = KafkaConsumer(
                    'news_articles',
                    bootstrap_servers=[srv],
                    api_version=(2, 5, 0),
                    auto_offset_reset='earliest',
                    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
                )
                print(f"✅ Connected to Kafka on {srv}!")
                return c
            except Exception as e:
                pass
        print(f"⏳ Kafka not ready (attempt {attempt}/{retries}). Retrying in {delay}s...")
        time.sleep(delay)
    raise Exception("❌ Could not connect to Kafka after multiple retries.")

# --- FEATURE 3: FINANCIAL LEXICON & TICKER / ENTITY EXTRACTION ---
FINANCIAL_TICKERS = {
    'nvda': '$NVDA', 'nvidia': '$NVDA', 'apple': '$AAPL', 'aapl': '$AAPL',
    'microsoft': '$MSFT', 'msft': '$MSFT', 'google': '$GOOGL', 'alphabet': '$GOOGL',
    'amazon': '$AMZN', 'amzn': '$AMZN', 'tesla': '$TSLA', 'tsla': '$TSLA',
    'bitcoin': '$BTC', 'btc': '$BTC', 'ethereum': '$ETH', 'eth': '$ETH',
    'fed': 'Federal Reserve', 'fomc': 'FOMC', 'treasury': 'US Treasury',
    'oil': 'Brent Crude', 'brent': 'Brent Crude', 'gold': 'Gold'
}

def extract_financial_entities(text):
    """Detects tickers, central banks, and market entities."""
    found = set()
    text_lower = text.lower()
    for kw, entity in FINANCIAL_TICKERS.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
            found.add(entity)
    return list(found)

def adjust_financial_sentiment(text, base_label, base_score):
    """Refines sentiment using institutional financial terminology."""
    bull_terms = ['rally', 'surge', 'all-time high', 'outperform', 'upgrade', 'beat earnings', 'profit jump', 'accelerates']
    bear_terms = ['plunge', 'slump', 'downgrade', 'misses', 'recession', 'contraction', 'inflation spikes', 'default', 'sell-off']
    
    text_l = text.lower()
    bull_hits = sum(1 for w in bull_terms if w in text_l)
    bear_hits = sum(1 for w in bear_terms if w in text_l)
    
    if bull_hits > bear_hits and base_label == 'NEGATIVE':
        return 'POSITIVE', round(min(0.85, base_score + 0.2), 2)
    elif bear_hits > bull_hits and base_label == 'POSITIVE':
        return 'NEGATIVE', round(min(0.85, base_score + 0.2), 2)
    
    return base_label, base_score

def consume_and_store():
    create_table_if_not_exists()
    consumer = create_consumer()
    print("🎧 Listening to Kafka stream... Waiting for articles...")
    
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        for message in consumer:
            article = message.value
            
            title = article.get('title', '').strip()
            content = article.get('content', '') or article.get('description', '') or ''
            source = article.get('source', {}).get('name', 'Unknown')
            published_at = article.get('publishedAt', 'Unknown')

            text_to_analyze = (title + ". " + content).strip()
            if not text_to_analyze or not title: 
                continue

            # --- DEDUPLICATION CHECK ---
            cur.execute("SELECT id FROM articles WHERE title = %s LIMIT 1;", (title,))
            if cur.fetchone():
                continue # Skip already processed article

            # --- FINANCIAL SENTIMENT INFERENCE ---
            # Tokenizer handles truncation automatically up to 512 tokens
            result = sentiment_analyzer(text_to_analyze[:1200])[0] 
            raw_label = result['label']
            raw_score = float(result['score'])

            # Refine sentiment with financial domain heuristics
            sentiment_label, sentiment_score = adjust_financial_sentiment(text_to_analyze, raw_label, raw_score)

            if sentiment_score < 0.5: 
                sentiment_label = "NEUTRAL"

            # --- EXTRACT ENTITIES ---
            entities = extract_financial_entities(text_to_analyze)

            # --- SAVE TO POSTGRESQL ---
            cur.execute("""
                INSERT INTO articles (title, content, source, published_at, sentiment, sentiment_score, entities)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (title) DO NOTHING
                RETURNING id;
            """, (title, content, source, published_at, sentiment_label, sentiment_score, json.dumps(entities)))
            
            row = cur.fetchone()
            if not row:
                continue
            postgres_id = row[0]
            conn.commit()

            # --- SAVE TO CHROMADB VECTOR STORE ---
            collection.add(
                documents=[text_to_analyze],
                metadatas=[{
                    "id": postgres_id,
                    "source": source,
                    "date": str(published_at),
                    "sentiment": sentiment_label,
                    "entities": ",".join(entities)
                }],
                ids=[str(postgres_id)]
            )

            print(f"💾 STORED & VECTORIZED ({sentiment_label} {sentiment_score}): {title[:50]}... [{len(entities)} entities]")

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
import os
import json
import time
import requests
from dotenv import load_dotenv
from kafka import KafkaProducer

# Load secrets from .env file
load_dotenv()
API_KEY = os.getenv('NEWS_API_KEY')

# --- INITIALIZE KAFKA PRODUCER WITH RETRY ---
def create_producer(retries=10, delay=5):
    for attempt in range(1, retries + 1):
        try:
            p = KafkaProducer(
                bootstrap_servers=['kafka:9092'],
                api_version=(2, 5, 0),
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            print("✅ Connected to Kafka!")
            return p
        except Exception as e:
            print(f"⏳ Kafka not ready (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)
    raise Exception("❌ Could not connect to Kafka after multiple retries.")

producer = create_producer()

# --- EXPANDED LAYER 1 FILTER ---
# Added major US financial news sources to the list!
TRUSTED_SOURCES = [
    'Reuters', 'BBC News', 'TechCrunch', 'The Economic Times', 
    'Moneycontrol', 'The Hindu', 'NDTV', 'Wired', 'The Verge', 
    'Forbes', 'Business Insider', 'Financial Times',
    'Bloomberg', 'CNBC', 'The Wall Street Journal', 'CNN', 
    'Fox Business', 'Yahoo Finance', 'Associated Press', 'MarketWatch'
]

def is_valid_article(article):
    source_name = article.get('source', {}).get('name', '')
    if source_name not in TRUSTED_SOURCES: 
        return False, f"Untrusted Source: {source_name}"
    
    title = article.get('title', '') or ''
    content = article.get('content', '') or ''

    if not content or content == 'None': return False, "No Content"
    if '[Removed]' in content or '[Deleted]' in content: return False, "Deleted Content"
    if title.isupper(): return False, "ALL CAPS Title"
    if title.count('!') >= 3: return False, "Exclamation Spam"
    
    return True, "Passed"



def fetch_and_stream_news():
    # A list of specific high-volume sectors
    keywords = [
        "Stock Market", "Cryptocurrency", "Artificial Intelligence", 
        "Electric Vehicles", "Central Banks", "Global Trade", 
        "Tech Mergers", "Energy Crisis", "Cybersecurity", "Fintech"
    ]
    
    total_saved = 0
    print(f"🚀 Starting Deep Scan across {len(keywords)} sectors...")

    for query in keywords:
        print(f"\n🔍 Scanning: {query}...")
        
        # We fetch 100 articles for EACH keyword in the loop
        url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&pageSize=100&apiKey={API_KEY}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                articles = response.json().get('articles', [])
                
                for article in articles:
                    is_valid, reason = is_valid_article(article)
                    if is_valid:
                        producer.send('news_articles', value=article)
                        total_saved += 1
                        # Short sleep to prevent hitting Kafka too hard
                        time.sleep(0.1) 
                
                print(f"📊 Progress: {total_saved} articles total sent to Kafka.")
            else:
                print(f"⚠️ API Limit or Error for {query}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error during scan: {e}")
            
        # Small delay between keywords to stay within NewsAPI rate limits
        time.sleep(1) 

    producer.flush()
    print(f"\n✅ Deep Scan Complete. {total_saved} high-quality articles are now in the pipeline.")

if __name__ == "__main__":
    while True:
        fetch_and_stream_news()
        print("Sleeping for 4 hours...")
        time.sleep(14400) # Sleeps for 4 hours before fetching again!
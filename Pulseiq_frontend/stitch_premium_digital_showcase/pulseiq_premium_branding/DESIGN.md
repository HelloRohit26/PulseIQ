---
name: PulseIQ Premium Branding
colors:
  surface: '#161B22'
  surface-dim: '#0d1516'
  surface-bright: '#333a3c'
  surface-container-lowest: '#080f11'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#242b2d'
  surface-container-highest: '#2e3638'
  on-surface: '#dce4e5'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dce4e5'
  inverse-on-surface: '#2a3233'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#d1bcff'
  on-secondary: '#3c0090'
  secondary-container: '#7000ff'
  on-secondary-container: '#ddcdff'
  tertiary: '#ffeac0'
  on-tertiary: '#3e2e00'
  tertiary-container: '#fec931'
  on-tertiary-container: '#6f5500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d1bcff'
  on-secondary-fixed: '#23005b'
  on-secondary-fixed-variant: '#5700c9'
  tertiary-fixed: '#ffdf96'
  tertiary-fixed-dim: '#f3bf26'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#0B0E14'
  on-background: '#dce4e5'
  surface-variant: '#2e3638'
  sentiment-positive: '#22C55E'
  sentiment-negative: '#EF4444'
  sentiment-neutral: '#94A3B8'
  border-subtle: '#30363D'
  accent-electric: '#00E5FF'
typography:
  ticker-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  chat-bubble:
    fontFamily: Work Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
---

# PulseIQ ⚡

**Real-Time AI News Intelligence Platform**

PulseIQ is a powerful, real-time data streaming pipeline and AI intelligence dashboard that automatically ingests, analyzes, and visualizes news articles. It leverages Natural Language Processing to score the sentiment of financial/tech news and uses Vector Search (ChromaDB + Gemini AI) to allow users to chat with the live news feed.

## 🧠 Technologies Used
- **Apache Kafka** & **Zookeeper**: High-throughput message streaming.
- **Python / FastAPI**: High-performance backend API.
- **HuggingFace Transformers**: AI Sentiment Analysis (DistilBERT).
- **ChromaDB**: Vector database for semantic search and Retrieval-Augmented Generation (RAG).
- **Google Gemini AI**: Intelligent chatbot answering questions based on live vectors.
- **PostgreSQL**: Relational database for persistent article storage.
- **Streamlit**: Interactive, real-time data visualization dashboard.
- **Docker & Docker Compose**: Full containerization for guaranteed reproducibility.

---

## 🚀 How to Run the Project

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Build and Start the Cluster
Open your terminal in the project directory and run:

```bash
docker-compose up -d --build
```
*Note: The first time you run this, it may take a few minutes to download the AI models and Docker images.*

### 2. Access the Applications

Once the containers are healthy, you can access the platform:
- **Main Dashboard**: [http://localhost:8501](http://localhost:8501)
- **Backend API (FastAPI Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)

*(Note: The dashboard is equipped with a retry-mechanism. It will gracefully wait and show a loading spinner until the FastAPI backend and ML models are fully initialized).*

### 3. Stop the Cluster
When you are done, securely shut down the containers and free up ports:
```bash
docker-compose down
```

---

## 🏗️ Architecture Overview

1. **Producer (`producer.py`)**: Fetches live news (via APIs or scraping) and streams raw article data into the Kafka `news_articles` topic.
2. **Consumer (`consumer.py`)**: Listens to Kafka. Upon receiving an article, it runs NLP sentiment analysis, saves the structured data to PostgreSQL, and embeds the text into ChromaDB vectors.
3. **API (`api.py`)**: Serves the analyzed data and provides a `/query` endpoint for the Gemini AI chatbot to perform RAG over ChromaDB.
4. **Dashboard (`dashboard.py`)**: The Streamlit user interface, fetching data from the API to render live Bloomberg-style tickers, KPI metrics, charts, and the AI chat interface.

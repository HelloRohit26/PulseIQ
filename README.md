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

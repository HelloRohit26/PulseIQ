const API_BASE = '/api';

// Track backend connectivity
let backendOnline = null;

async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE}/`, { signal: AbortSignal.timeout(3000) });
    backendOnline = res.ok;
    return backendOnline;
  } catch {
    backendOnline = false;
    return false;
  }
}

export function isBackendOnline() {
  return backendOnline;
}

export async function fetchArticles(limit = 20) {
  try {
    const res = await fetch(`${API_BASE}/articles?limit=${limit}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    backendOnline = true;
    return data.articles || [];
  } catch (err) {
    console.warn('API unavailable, using demo data:', err.message);
    backendOnline = false;
    return getDemoArticles();
  }
}

export async function queryPulseIQ(question) {
  try {
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    backendOnline = true;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Query API unavailable:', err.message);
    backendOnline = false;
    return {
      question,
      answer: `**PulseIQ Analysis (Demo Mode)**\n\nI'm currently running in demo mode as the backend is offline. When connected to the live Kafka pipeline, I would analyze real-time news data to answer: "${question}"\n\nIn production, I use Gemini AI with ChromaDB vector search to provide intelligent, source-cited answers from live financial news streams.\n\n**To connect the backend:**\n1. Open Docker Desktop\n2. Run \`docker-compose up -d --build\` in the project root\n3. Wait for all services to become healthy\n4. The frontend will auto-connect via the Vite proxy`,
    };
  }
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function registerUser(username, email, password, full_name) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, full_name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function runClustering() {
  const res = await fetch(`${API_BASE}/cluster`, { method: 'POST' });
  return res.json();
}

// Initialize backend check
checkBackend();
// Re-check every 15s
setInterval(checkBackend, 15000);

// Demo data for offline mode
function getDemoArticles() {
  const now = Date.now();
  return [
    { title: 'NVIDIA Blackwell Architecture Specs Leak Ahead of Keynote', source: 'Reuters Finance', sentiment: 'positive', score: 0.94, published_at: new Date(now - 120000).toISOString() },
    { title: 'Fed Maintains Current Rate Trajectory After Economic Review', source: 'Central Bank Wire', sentiment: 'neutral', score: 0.51, published_at: new Date(now - 300000).toISOString() },
    { title: 'Global Energy Sector Faces Supply Chain Disruptions', source: 'Energy Monitor', sentiment: 'negative', score: 0.18, published_at: new Date(now - 480000).toISOString() },
    { title: 'Cloud Infrastructure Spending Exceeds Q3 Projections', source: 'Enterprise IT Quarterly', sentiment: 'positive', score: 0.89, published_at: new Date(now - 660000).toISOString() },
    { title: 'Regulatory Headwinds Emerge for European Tech Markets', source: 'Global Policy Watch', sentiment: 'negative', score: 0.22, published_at: new Date(now - 900000).toISOString() },
    { title: 'Semiconductor CapEx Expansion Plans Announced by Major Foundries', source: 'TechInsights Data', sentiment: 'positive', score: 0.87, published_at: new Date(now - 1200000).toISOString() },
    { title: 'M&A Rumors Propel Biotech Index to Monthly Highs', source: 'Market Insider', sentiment: 'positive', score: 0.82, published_at: new Date(now - 1500000).toISOString() },
    { title: 'Crypto Regulatory Hearing Concludes with Mixed Signals', source: 'Digital Asset News', sentiment: 'neutral', score: 0.48, published_at: new Date(now - 1800000).toISOString() },
    { title: 'Apple Vision Pro Sales Exceed Initial Forecasts', source: 'Bloomberg Terminal', sentiment: 'positive', score: 0.91, published_at: new Date(now - 2100000).toISOString() },
    { title: 'Tesla Production Numbers Miss Analyst Expectations', source: 'Auto Intelligence', sentiment: 'negative', score: 0.15, published_at: new Date(now - 2400000).toISOString() },
    { title: 'JPMorgan Upgrades Healthcare Sector Outlook', source: 'Goldman Sachs Research', sentiment: 'positive', score: 0.85, published_at: new Date(now - 2700000).toISOString() },
    { title: 'Oil Prices Surge on Middle East Geopolitical Tensions', source: 'Energy Monitor', sentiment: 'negative', score: 0.28, published_at: new Date(now - 3000000).toISOString() },
    { title: 'Microsoft Azure Revenue Beats Street Estimates', source: 'Bloomberg Terminal', sentiment: 'positive', score: 0.92, published_at: new Date(now - 3300000).toISOString() },
    { title: 'China Manufacturing PMI Signals Contraction', source: 'Macro Data Wire', sentiment: 'negative', score: 0.19, published_at: new Date(now - 3600000).toISOString() },
    { title: 'AI Infrastructure Investment Fund Raises $2B in Series D', source: 'Venture Capital Daily', sentiment: 'positive', score: 0.88, published_at: new Date(now - 3900000).toISOString() },
    { title: 'European Central Bank Holds Rates Steady Amid Uncertainty', source: 'Central Bank Wire', sentiment: 'neutral', score: 0.52, published_at: new Date(now - 4200000).toISOString() },
    { title: 'Amazon AWS Announces Next-Gen Custom Silicon', source: 'TechInsights Data', sentiment: 'positive', score: 0.86, published_at: new Date(now - 4500000).toISOString() },
    { title: 'Consumer Confidence Index Drops to 6-Month Low', source: 'Economic Indicators', sentiment: 'negative', score: 0.24, published_at: new Date(now - 4800000).toISOString() },
    { title: 'Quantum Computing Startup Achieves Error Correction Milestone', source: 'Science & Tech Review', sentiment: 'positive', score: 0.79, published_at: new Date(now - 5100000).toISOString() },
    { title: 'US Dollar Strengthens Against Major Currency Pairs', source: 'Forex Intelligence', sentiment: 'neutral', score: 0.55, published_at: new Date(now - 5400000).toISOString() },
  ];
}

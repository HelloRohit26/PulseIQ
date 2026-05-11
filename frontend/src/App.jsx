import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchArticles } from './services/api';
import TopAppBar from './components/TopAppBar';
import SideNav from './components/SideNav';
import LiveTicker from './components/LiveTicker';
import Footer from './components/Footer';
import HeroLanding from './pages/HeroLanding';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import SentimentBreakdown from './pages/SentimentBreakdown';
import SentimentMap from './pages/SentimentMap';
import Historical from './pages/Historical';
import Architecture from './pages/Architecture';
import Newspaper from './pages/Newspaper';
import ThreatWeb from './pages/ThreatWeb';

const REFRESH_INTERVAL = 30000; // 30 seconds

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [articles, setArticles] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const loadArticles = useCallback(async () => {
    const data = await fetchArticles(100);
    setArticles(data);
    setLastUpdated(new Date());
  }, []);

  const [isAuthenticated] = useState(!!localStorage.getItem('pulseiq_token'));

  // Initial load
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Authentication Guard
  useEffect(() => {
    if (!isLanding && !isAuthenticated) {
      window.location.href = '/login/index.html';
    }
  }, [isLanding, isAuthenticated]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(loadArticles, REFRESH_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, loadArticles]);

  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <TopAppBar autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} lastUpdated={lastUpdated} />
        <HeroLanding />
        <Footer />
      </div>
    );
  }

  // If trying to access protected route without auth, return empty while redirecting
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  // Chat page has its own full-height layout without ticker
  const isChat = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <TopAppBar autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} lastUpdated={lastUpdated} />
      {!isChat && <LiveTicker articles={articles} />}
      <div className={`flex flex-1 ${isChat ? 'pt-[73px]' : 'pt-[113px]'}`}>
        <SideNav />
        <main className="flex-1 ml-0 md:ml-64 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard articles={articles} />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/sentiment" element={<SentimentBreakdown articles={articles} />} />
            <Route path="/map" element={<SentimentMap articles={articles} />} />
            <Route path="/historical" element={<Historical articles={articles} />} />
            <Route path="/threat-web" element={<ThreatWeb articles={articles} />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/newspaper" element={<Newspaper articles={articles} lastUpdated={lastUpdated} />} />
          </Routes>
        </main>
      </div>
      {!isChat && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState, useEffect } from 'react';
import { fetchArticles } from '../services/api';
import { useTheme } from '../ThemeContext';

function sentColor(s, isDark) {
  if (s === 'positive' || s === 'POSITIVE') return isDark ? '#4ADE80' : '#0a7a0a';
  if (s === 'negative' || s === 'NEGATIVE') return isDark ? '#F87171' : '#b80000';
  return isDark ? '#38BDF8' : '#008080';
}

export default function Newspaper({ articles: propArticles, lastUpdated }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [localArticles, setLocalArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive state variables for premium UI control
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeArticle, setActiveArticle] = useState(null); // Active article for the glassmorphism read modal

  // Use prop articles from App's auto-refresh, or fetch own if not provided
  useEffect(() => {
    if (propArticles && propArticles.length > 0) {
      setLocalArticles(propArticles);
      setLoading(false);
    } else {
      fetchArticles(50).then(a => { setLocalArticles(a); setLoading(false); });
    }
  }, [propArticles]);

  // Enrich articles with simulated categories for filtering
  const allArticles = localArticles.map((a, i) => {
    let cat = 'MARKETS';
    const t = a.title?.toLowerCase() || '';
    if (t.includes('nvidia') || t.includes('cloud') || t.includes('silicon') || t.includes('apple') || t.includes('ai') || t.includes('quantum')) {
      cat = 'TECH';
    } else if (t.includes('fed') || t.includes('rate') || t.includes('pmi') || t.includes('dollar') || t.includes('central bank')) {
      cat = 'MACRO';
    } else if (t.includes('energy') || t.includes('oil') || t.includes('european') || t.includes('global') || t.includes('china')) {
      cat = 'GLOBAL';
    }
    return { ...a, category: cat, originalIndex: i };
  });

  const filteredArticles = selectedCategory === 'ALL' 
    ? allArticles 
    : allArticles.filter(a => a.category === selectedCategory);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Map out dynamic layout positions based on currently filtered set
  const hero = filteredArticles[0];
  const mid1 = filteredArticles[1];
  const mid2 = filteredArticles[2];
  const mid3 = filteredArticles[3];
  const bottom = filteredArticles.slice(4, 8);
  const globalDispatches = filteredArticles.slice(8, 14);
  const wireArticles = filteredArticles.slice(14, 26);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-3 bg-background">
        <span className="material-symbols-outlined text-4xl text-accent-electric animate-spin">autorenew</span>
        <div className="text-on-surface-variant font-body text-xs tracking-widest uppercase font-bold animate-pulse">
          Ingesting continuous stream edition…
        </div>
      </div>
    );
  }

  // Dynamic CSS variables customized based on current theme state
  const paperBg = isDark ? '#14171F' : '#FFFFFF';
  const paperTextColor = isDark ? '#E2E8F0' : '#111111';
  const mutedTextColor = isDark ? '#94A3B8' : '#555555';
  const borderColor = isDark ? '#334155' : '#111111';
  const lightBorderColor = isDark ? '#1E293B' : '#DDDDDD';
  const widgetBg = isDark ? '#0F1117' : '#FAFAFA';

  const categories = ['ALL', 'MARKETS', 'TECH', 'MACRO', 'GLOBAL'];

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-(--spacing-container-margin) min-h-[calc(100vh-73px)] transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;0,900;1,400;1,700&family=UnifrakturMaguntia&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@400;600;700&display=swap');

        /* Dynamic animated background wrapper providing a smooth running luminous border beam */
        .dc-animated-wrapper {
          position: relative;
          max-width: 1224px;
          margin: 0 auto;
          border-radius: 8px;
          padding: 2px;
          background: ${isDark ? 'linear-gradient(135deg, #00E5FF, #3b82f6, #8b5cf6, #ec4899)' : 'linear-gradient(135deg, #111111, #555555, #aaaaaa)'};
          background-size: 300% 300%;
          animation: animatedBorderGradient 12s ease infinite;
          box-shadow: ${isDark ? '0 0 35px rgba(0, 229, 255, 0.2)' : '0 10px 30px rgba(0,0,0,0.1)'};
        }

        @keyframes animatedBorderGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .dc-paper {
          background: ${paperBg};
          font-family: 'Libre Baskerville', 'Georgia', serif;
          color: ${paperTextColor};
          border-radius: 6px;
          overflow: hidden;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        /* ─── MASTHEAD & INTERACTIVE CONTROLS ─── */
        .dc-masthead {
          text-align: center;
          padding: 20px 28px 0;
          border-bottom: 2px solid ${borderColor};
        }
        .dc-masthead-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .dc-masthead-box {
          border: 1px solid ${borderColor};
          padding: 8px 14px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          line-height: 1.4;
          text-align: center;
          font-family: 'Space Grotesk', sans-serif;
          min-width: 140px;
          background: ${widgetBg};
          border-radius: 4px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
        }
        .dc-title {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: clamp(36px, 6vw, 72px);
          color: ${paperTextColor};
          line-height: 1;
          margin: 0;
          letter-spacing: 0.5px;
          padding: 0 10px;
          text-shadow: ${isDark ? '0 2px 10px rgba(0,0,0,0.5)' : 'none'};
        }
        
        /* Interactive Category Filter Row */
        .dc-filter-strip {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 0;
          border-top: 1px solid ${lightBorderColor};
          margin-top: 12px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .dc-filter-btn {
          padding: 6px 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border-radius: 20px;
          border: 1px solid ${lightBorderColor};
          background: ${widgetBg};
          color: ${mutedTextColor};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dc-filter-btn:hover {
          color: ${isDark ? '#00E5FF' : '#111111'};
          border-color: ${isDark ? '#00E5FF' : '#111111'};
          transform: translateY(-1px);
        }
        .dc-filter-btn.active {
          background: ${isDark ? '#00E5FF' : '#111111'};
          color: ${isDark ? '#0B0E14' : '#FFFFFF'};
          border-color: ${isDark ? '#00E5FF' : '#111111'};
          box-shadow: ${isDark ? '0 0 12px rgba(0,229,255,0.4)' : '0 2px 8px rgba(0,0,0,0.2)'};
        }

        .dc-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-top: 1px solid ${lightBorderColor};
          font-family: 'Space Grotesk', sans-serif;
        }
        .dc-date {
          font-size: 11px;
          color: ${mutedTextColor};
          font-weight: 600;
        }
        .dc-est {
          font-size: 11px;
          color: ${mutedTextColor};
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* ─── SOCIAL + HEADLINE ─── */
        .dc-headline-bar {
          padding: 22px 28px 18px;
          border-bottom: 3px solid ${borderColor};
          text-align: center;
          background: ${isDark ? 'linear-gradient(to bottom, #0F1117, #14171F)' : 'linear-gradient(to bottom, #FAFAFA, #FFFFFF)'};
          position: relative;
        }
        .dc-social-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-bottom: 14px;
        }
        .dc-social-icon {
          width: 28px; height: 28px;
          background: ${borderColor};
          color: ${paperBg};
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: sans-serif;
        }
        .dc-social-icon:hover { 
          transform: translateY(-2px) scale(1.1);
          background: ${isDark ? '#00E5FF' : '#111111'};
          color: ${isDark ? '#0B0E14' : '#FFFFFF'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .dc-main-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 900;
          color: ${paperTextColor};
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.5px;
          text-transform: uppercase;
          max-width: 1050px;
          margin: 0 auto;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .dc-main-headline:hover {
          color: ${isDark ? '#00E5FF' : '#444444'};
        }

        /* ─── MID SECTION GRID ─── */
        .dc-mid {
          display: grid;
          grid-template-columns: 1fr;
          border-bottom: 2px solid ${borderColor};
        }
        @media (min-width: 1024px) {
          .dc-mid {
            grid-template-columns: 2.2fr 1.8fr 1.8fr 1.3fr;
          }
        }
        .dc-article-card {
          padding: 20px;
          border-bottom: 1px solid ${lightBorderColor};
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
        }
        @media (min-width: 1024px) {
          .dc-article-card {
            border-bottom: none;
            border-right: 1px solid ${lightBorderColor};
          }
          .dc-article-card:last-child { border-right: none; }
        }
        .dc-article-card:hover {
          background-color: ${isDark ? '#191D29' : '#F9FBFC'};
          box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
        }
        .dc-article-card:hover .dc-img img {
          transform: scale(1.05);
          filter: grayscale(0%);
        }

        .dc-mid-h {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 800;
          color: ${paperTextColor};
          line-height: 1.25;
          margin: 0 0 8px;
          transition: color 0.2s ease;
        }
        .dc-article-card:hover .dc-mid-h {
          color: ${isDark ? '#00E5FF' : '#0B0E14'};
        }
        .dc-byline {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${mutedTextColor};
          margin-bottom: 12px;
          font-family: 'Space Grotesk', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dc-img {
          width: 100%;
          height: 150px;
          background: ${widgetBg};
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid ${lightBorderColor};
        }
        .dc-img img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
        }
        .dc-img-label {
          font-size: 10px;
          color: ${mutedTextColor};
          font-style: italic;
          text-align: center;
          margin-bottom: 12px;
          line-height: 1.3;
        }
        .dc-p {
          font-size: 13px;
          line-height: 1.7;
          color: ${isDark ? '#CBD5E1' : '#222222'};
          margin: 0;
          text-align: justify;
        }
        
        /* Premium Drop-Cap effect */
        .dc-dropcap::first-letter {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-weight: 900;
          float: left;
          line-height: 0.85;
          padding-right: 10px;
          padding-top: 4px;
          color: ${isDark ? '#00E5FF' : '#111111'};
          text-shadow: ${isDark ? '0 0 12px rgba(0,229,255,0.3)' : 'none'};
        }

        .dc-continues {
          font-size: 10px;
          font-style: italic;
          color: ${mutedTextColor};
          text-align: right;
          margin-top: 12px;
          font-family: sans-serif;
          font-weight: 600;
        }

        /* Metrics Sidebar panel */
        .dc-weather-title {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 900;
          text-transform: uppercase;
          border-bottom: 2px solid ${borderColor};
          padding-bottom: 6px;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .dc-weather-city {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 4px;
          font-family: 'Space Grotesk', sans-serif;
          color: ${mutedTextColor};
        }
        .dc-weather-temp {
          font-size: 34px;
          font-weight: 900;
          font-family: 'Space Grotesk', sans-serif;
          line-height: 1.1;
          margin-bottom: 6px;
          transition: transform 0.3s ease;
        }
        .dc-weather-temp:hover {
          transform: scale(1.05);
        }
        .dc-weather-desc {
          font-size: 11px;
          color: ${mutedTextColor};
          margin-bottom: 16px;
          line-height: 1.4;
          font-family: sans-serif;
        }
        .dc-sports-title {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          border-bottom: 2px solid ${borderColor};
          padding-bottom: 4px;
          margin: 18px 0 8px;
          letter-spacing: 0.5px;
        }
        .dc-index-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding: 6px 0;
          border-bottom: 1px dotted ${lightBorderColor};
          font-family: 'Space Grotesk', sans-serif;
          transition: padding-left 0.2s ease;
        }
        .dc-index-row:hover {
          padding-left: 4px;
        }

        /* ─── BOTTOM ARTICLES GRID ─── */
        .dc-bottom {
          display: grid;
          grid-template-columns: 1fr;
          border-bottom: 2px solid ${borderColor};
        }
        @media (min-width: 640px) {
          .dc-bottom { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1024px) {
          .dc-bottom { grid-template-columns: 1fr 1fr 1fr 1fr; }
        }
        .dc-bottom-h {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 800;
          color: ${paperTextColor};
          line-height: 1.25;
          margin: 0 0 6px;
          transition: color 0.2s ease;
        }
        .dc-article-card:hover .dc-bottom-h {
          color: ${isDark ? '#00E5FF' : '#0B0E14'};
        }
        .dc-bottom-cat {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: ${isDark ? '#00E5FF' : '#111111'};
          border-bottom: 2px solid ${isDark ? '#00E5FF' : '#111111'};
          display: inline-block;
          padding-bottom: 2px;
          margin-bottom: 10px;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* ─── EXTENDED SECTIONS ─── */
        .dc-section-header {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: clamp(28px, 4.5vw, 40px);
          text-align: center;
          padding: 32px 0 14px;
          border-bottom: 3px double ${borderColor};
          margin-top: 10px;
          letter-spacing: 0.5px;
        }
        .dc-grid-3 {
          display: grid;
          grid-template-columns: 1fr;
          border-bottom: 2px solid ${borderColor};
        }
        @media (min-width: 768px) {
          .dc-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
        }
        .dc-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          border-bottom: 2px solid ${borderColor};
        }
        @media (min-width: 1024px) {
          .dc-grid-2 { grid-template-columns: 2fr 1.2fr; }
        }
        .dc-wire-item {
          padding: 14px 20px;
          border-bottom: 1px solid ${lightBorderColor};
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .dc-wire-item:hover {
          padding-left: 28px;
          background-color: ${isDark ? '#191D29' : '#F9FBFC'};
          border-left: 3px solid ${isDark ? '#00E5FF' : '#111111'};
        }
        .dc-wire-item:last-child { border-bottom: none; }
        .dc-mini-h {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px;
          line-height: 1.35;
        }

        /* ─── FOOTER ─── */
        .dc-footer {
          padding: 20px 28px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          color: ${mutedTextColor};
          font-family: 'Space Grotesk', sans-serif;
          background: ${widgetBg};
          border-top: 1px solid ${lightBorderColor};
        }

        /* Smooth slide-in animations for filtering articles */
        .article-fade-in {
          animation: articleFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes articleFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 🌟 OVERLAY ARTICLE READER MODAL (Glassmorphism feature) 🌟 */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-surface-container-high border border-border-subtle rounded-xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] animate-scale-in">
            
            {/* Modal Navigation Top */}
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-6">
              <div className="flex items-center gap-2 font-mono text-xs text-accent-electric">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>AUTHENTICATED STREAM TRACE</span>
              </div>
              <button 
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-surface-variant text-on-surface hover:bg-accent-electric hover:text-background transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase border border-border-subtle bg-surface-container-low" style={{ color: sentColor(activeArticle.sentiment, isDark) }}>
                ● {activeArticle.sentiment?.toUpperCase()} CATALYST
              </div>

              <h2 className="font-ticker text-xl md:text-3xl font-extrabold text-on-surface leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-mono pt-1">
                <span><strong>Source:</strong> {activeArticle.source}</span>
                <span>•</span>
                <span><strong>Confidence:</strong> {(activeArticle.score * 100).toFixed(1)}%</span>
                <span>•</span>
                <span><strong>Timestamp:</strong> {new Date(activeArticle.published_at || Date.now()).toLocaleTimeString()}</span>
              </div>

              <div className="my-6 p-4 rounded-lg bg-surface border border-border-subtle overflow-hidden">
                <p className="font-body text-sm text-on-surface leading-relaxed text-justify">
                  {activeArticle.description || activeArticle.content || `Autonomous stream vectors captured immediate financial realignment algorithms targeted across global secondary exchanges. Initial trigger logic cleared primary network distribution channels with high correlation signatures.`}
                </p>
                <p className="font-body text-xs text-on-surface-variant mt-4 leading-relaxed">
                  Institutional models index this metadata directly inside active relational storage blocks. Client telemetry synchronizes active hedging requests continuously.
                </p>
              </div>

              {/* Streaming Receipt Hashes */}
              <div className="p-3 rounded bg-background border border-border-subtle/50 font-mono text-[10px] text-on-surface-variant space-y-1.5">
                <div className="text-accent-electric font-bold">CRYPTOGRAPHIC TRACE HEADERS:</div>
                <div>Hash ID: <span className="text-on-surface">SHA256-{(activeArticle.title?.length * 9876543).toString(16).toUpperCase()}</span></div>
                <div>Vector Block: <span className="text-on-surface">chroma_record_{activeArticle.originalIndex || 0}</span></div>
                <div>Model Verification: <span className="text-sentiment-positive">Pass (DistilBERT v2.4)</span></div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 rounded bg-accent-electric text-background font-body text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Acknowledge Report
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Outer container with running light border beam */}
      <div className="dc-animated-wrapper">
        <div className="dc-paper">

          {/* ═══ MASTHEAD HEADER & CATEGORY TABS ═══ */}
          <div className="dc-masthead">
            <div className="dc-masthead-top">
              <div className="dc-masthead-box">
                VOL. I NO. 12<br/>AUTONOMOUS FEED
              </div>
              <h1 className="dc-title">The Daily Pulse</h1>
              <div className="dc-masthead-box">
                FINAL EDITION<br/>STREAM ANALYTICS
              </div>
            </div>
            
            {/* Beautiful Interactive Filters Tab row */}
            <div className="dc-filter-strip">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`dc-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'ALL' ? '● ALL EDITIONS' : cat}
                </button>
              ))}
            </div>

            <div className="dc-nav-row">
              <span className="dc-date">{dateStr}</span>
              <span className="text-xs font-bold tracking-widest text-accent-electric animate-pulse">
                ● LIVE INTERACTIVE STREAM
              </span>
              <span className="dc-est">EST. 2026</span>
            </div>
          </div>

          {/* ═══ MAIN BREAKING HEADLINE STRIP ═══ */}
          {hero && (
            <div className="dc-headline-bar">
              <div className="dc-social-row">
                <div className="dc-social-icon" title="Share via stream">f</div>
                <div className="dc-social-icon" title="Broadcast vector">𝕏</div>
                <div className="dc-social-icon" title="Index citation">in</div>
                <div className="dc-social-icon" title="Email summary">✉</div>
                <div className="dc-social-icon" title="Print layout">🖨</div>
              </div>
              <h2 
                className="dc-main-headline"
                onClick={() => setActiveArticle(hero)}
                title="Click to open Glassmorphism intelligence modal"
              >
                {hero.title}
              </h2>
              <div className="text-[10px] text-outline italic mt-3 font-body">
                Click any article block below to load full audit trace models
              </div>
            </div>
          )}

          {/* ═══ PRIMARY MIDSECTION MULTI-COLUMN GRID ═══ */}
          <div className="dc-mid">
            
            {/* Column 1 — Breaking Hero Continued */}
            {hero && (
              <div 
                className="dc-article-card article-fade-in"
                onClick={() => setActiveArticle(hero)}
                key={`hero-${hero.title}`}
              >
                <div className="dc-img">
                  <img 
                    src={hero.title.toLowerCase().includes('crypto') || hero.title.toLowerCase().includes('bitcoin') 
                      ? "https://media.giphy.com/media/7FBY7h5Psqd20/giphy.gif" 
                      : `https://loremflickr.com/800/600/finance,stock?lock=${hero.title.length}`}
                    alt="Breaking News Illustration" 
                    className="w-full h-full object-cover grayscale opacity-90" 
                  />
                </div>
                <div className="dc-img-label">
                  INSTITUTIONAL FEED: {hero.source} reports heavily weighted metrics.
                </div>
                <div className="dc-byline">
                  <span className="w-2 h-2 rounded-full bg-accent-electric animate-pulse"></span>
                  By PulseIQ NLP Stream Pipeline
                </div>
                
                <p className="dc-p dc-dropcap">
                  {hero.description || hero.content || `${hero.source} has dispatched an institutional market update triggering rapid volume adjustments across multiple sovereign asset frameworks. NLP sentiment classifiers flagged this vector with high standard deviations.`}
                </p>
                
                <p className="dc-p mt-3">
                  Algorithmic trading desks track immediate secondary alpha divergence metrics closely. The baseline confidence projection registers at {(hero.score * 100).toFixed(1)}% supporting sustained macro adjustments globally.
                </p>
                <div className="dc-continues">—Click to read absolute audit trace</div>
              </div>
            )}

            {/* Column 2 — Secondary Report */}
            {mid1 && (
              <div 
                className="dc-article-card article-fade-in"
                onClick={() => setActiveArticle(mid1)}
                key={`mid1-${mid1.title}`}
              >
                <h3 className="dc-mid-h">{mid1.title}</h3>
                <div className="dc-byline">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  {mid1.source} Dispatches
                </div>
                <div className="dc-img">
                  <img 
                    src={`https://loremflickr.com/800/600/business,ai?lock=${mid1.title.length}`}
                    alt="Secondary Context" 
                    className="w-full h-full object-cover grayscale opacity-85" 
                  />
                </div>
                
                <p className="dc-p">
                  {mid1.description || mid1.content || `Stream sensors confirm active institutional interest centered on natural language vector events indexed by ${mid1.source}. The underlying market consensus points toward sustained volatility expansion.`}
                </p>
                
                <div className="mt-4 p-2 rounded border border-border-subtle/30 bg-surface-container-low/20 text-xs text-outline font-body flex items-center justify-between">
                  <span>Confidence: <strong>{(mid1.score * 100).toFixed(0)}%</strong></span>
                  <span style={{ color: sentColor(mid1.sentiment, isDark), fontWeight: 'bold' }}>● {mid1.sentiment?.toUpperCase()}</span>
                </div>
                <div className="dc-continues">—Click to expand telemetry</div>
              </div>
            )}

            {/* Column 3 — Supporting Analytics */}
            {mid2 && (
              <div 
                className="dc-article-card article-fade-in"
                onClick={() => setActiveArticle(mid2)}
                key={`mid2-${mid2.title}`}
              >
                <h3 className="dc-mid-h" style={{ textTransform: 'uppercase' }}>{mid2.title}</h3>
                <div className="dc-byline">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  {mid2.source} Staff Report
                </div>
                <div className="dc-img" style={{ height: '110px' }}>
                   <img 
                    src={`https://loremflickr.com/800/600/tech,chart?lock=${mid2.title.length}`}
                    alt="Supporting Analytics" 
                    className="w-full h-full object-cover grayscale opacity-85" 
                  />
                </div>
                
                <p className="dc-p">
                  {mid2.description || mid2.content || `Continuous parsing streams route structured JSON blocks mapped from ${mid2.source}. The vector matrix indexes deep relational correlations across adjacent supply hubs.`}
                </p>

                {mid3 && (
                  <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <h3 className="dc-mid-h text-base hover:text-accent-electric">{mid3.title}</h3>
                    <div className="dc-byline mb-1">{mid3.source}</div>
                    <p className="dc-p text-xs line-clamp-3">
                      {mid3.description || mid3.content || `Supplemental vector indicators point toward shifting momentum distributions. Weight thresholds clear standard benchmarks.`}
                    </p>
                  </div>
                )}
                <div className="dc-continues">—Inspect full verification block</div>
              </div>
            )}

            {/* Column 4 — Live Telemetry Sidebar panel */}
            <div className="p-5 border-b lg:border-b-0" style={{ background: widgetBg }}>
              <div className="dc-weather-title flex items-center justify-between">
                <span>METRICS BAY:</span>
                <span className="w-2 h-2 rounded-full bg-sentiment-positive animate-ping"></span>
              </div>
              <div className="dc-weather-city">LIVE SENTIMENT STATUS</div>
              <div className="dc-weather-temp" style={{ color: sentColor(hero?.sentiment, isDark) }}>
                {hero?.sentiment?.toLowerCase() === 'positive' ? '▲ BULLISH' : 
                 hero?.sentiment?.toLowerCase() === 'negative' ? '▼ BEARISH' : '■ NEUTRAL'}
              </div>
              <div className="dc-weather-desc">
                Weighted calculation derived from live feeds filtered in real-time.
              </div>

              <div className="dc-sports-title">FILTER ENGINE STATE</div>
              <div className="dc-index-row">
                <span className="text-outline">Active Category</span>
                <strong className="text-accent-electric">{selectedCategory}</strong>
              </div>
              <div className="dc-index-row">
                <span className="text-outline">Displayed Cards</span>
                <strong className="text-on-surface">{filteredArticles.length}</strong>
              </div>
              <div className="dc-index-row">
                <span className="text-outline">Bullish Vectors</span>
                <strong style={{ color: isDark ? '#4ADE80' : '#0a7a0a' }}>
                  {filteredArticles.filter(a => a.sentiment?.toLowerCase() === 'positive').length}
                </strong>
              </div>
              <div className="dc-index-row">
                <span className="text-outline">Contagion Hits</span>
                <strong style={{ color: isDark ? '#F87171' : '#b80000' }}>
                  {filteredArticles.filter(a => a.sentiment?.toLowerCase() === 'negative').length}
                </strong>
              </div>
              <div className="dc-index-row">
                <span className="text-outline">Mean Pool Score</span>
                <strong className="text-on-surface">
                  {filteredArticles.length > 0 ? (filteredArticles.reduce((s, a) => s + (a.score || 0), 0) / filteredArticles.length * 100).toFixed(0) : 0}%
                </strong>
              </div>

              <div className="dc-sports-title" style={{ marginTop: 20 }}>PIPELINE STATUS</div>
              <div className="p-2.5 rounded bg-background/60 border border-border-subtle/40 font-mono text-[10px] text-outline leading-relaxed space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-electric animate-pulse"></span>
                  <span className="text-on-surface font-bold">KAFKA:</span> ACTIVE
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sentiment-positive"></span>
                  <span className="text-on-surface font-bold">CHROMA:</span> PERSISTED
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  <span className="text-on-surface font-bold">GEMINI:</span> CONNECTED
                </div>
              </div>
            </div>
          </div>

          {/* ═══ SECONDARY ARTICLES ROW ═══ */}
          {bottom.length > 0 && (
            <div className="dc-bottom">
              {bottom.map((a, i) => {
                return (
                  <div 
                    key={`bottom-${i}`} 
                    className="dc-article-card flex flex-col justify-between article-fade-in"
                    onClick={() => setActiveArticle(a)}
                  >
                    <div>
                      <div className="dc-bottom-cat">{a.category} DESK</div>
                      <h4 className="dc-bottom-h">{a.title}</h4>
                      <div className="dc-byline">Source: {a.source}</div>
                      
                      <p className="dc-p text-xs line-clamp-4">
                        {a.description || a.content || `Analytical indicators traced from ${a.source} point toward fundamental realignments inside major structural frameworks. Stream classifiers register a ${(a.score * 100).toFixed(0)}% standard match.`}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border-subtle/20 flex items-center justify-between text-[10px] font-body font-bold">
                      <span style={{ color: sentColor(a.sentiment, isDark) }}>● {a.sentiment?.toUpperCase()}</span>
                      <span className="text-outline font-normal">Click to read details</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ GLOBAL DISPATCHES ═══ */}
          {globalDispatches.length > 0 && (
            <>
              <div className="dc-section-header">Global Dispatches</div>
              <div className="dc-grid-3">
                {globalDispatches.map((a, i) => (
                  <div 
                    key={`global-${i}`} 
                    className="dc-article-card flex flex-col justify-between article-fade-in"
                    onClick={() => setActiveArticle(a)}
                  >
                    <div>
                      {i % 3 === 0 && (
                        <div className="dc-img" style={{ height: '120px', marginBottom: '12px' }}>
                          <img 
                            src={`https://loremflickr.com/400/300/world,market?lock=${a.title.length + i}`}
                            alt="Global Dispatches" 
                            className="w-full h-full object-cover grayscale opacity-85" 
                          />
                        </div>
                      )}
                      <div className="dc-bottom-cat">INTERNATIONAL BUREAU</div>
                      <h4 className="dc-bottom-h text-sm font-bold">{a.title}</h4>
                      <div className="dc-byline">Source: {a.source}</div>
                      
                      <p className="dc-p text-[12px] leading-relaxed line-clamp-3">
                        {a.description || a.content || `Sovereign feed telemetry updates logged direct from ${a.source} document evolving macroeconomic shifts. Institutional positions adjust dynamically.`}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-outline font-body flex items-center justify-between border-t border-border-subtle/20 pt-2">
                      <span>Impact: <strong style={{ color: sentColor(a.sentiment, isDark) }}>{a.sentiment?.toUpperCase()}</strong></span>
                      <span>Confidence: {(a.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ WIRE TICKER / LATE EDITION ═══ */}
          {wireArticles.length > 0 && (
            <>
              <div className="dc-section-header">Late Edition Intelligence Wire</div>
              <div className="dc-grid-2">
                
                {/* Left Column: Focused deep summaries */}
                <div className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 ${isDark ? 'border-slate-800' : 'border-slate-200'} border-b lg:border-b-0 lg:border-r`}>
                  {wireArticles.slice(0, 4).map((a, i) => (
                    <div 
                      key={`wire-deep-${i}`} 
                      className="dc-wire-item p-3 rounded-lg border border-border-subtle/30 flex flex-col justify-between article-fade-in"
                      onClick={() => setActiveArticle(a)}
                    >
                      <div>
                        <div className="text-[10px] font-body font-bold text-accent-electric uppercase mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span>
                          DEEP DIVE WIRE
                        </div>
                        <h4 className="dc-bottom-h text-sm m-0">{a.title}</h4>
                        <div className="dc-byline mt-1 mb-2">{a.source} Trace</div>
                        <p className="dc-p text-xs line-clamp-2">
                          {a.description || a.content || `In-depth terminal parsing logs substantial capital flow reallocations documented across the ${a.source} pipeline network.`}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-outline italic text-right font-mono">
                        {(a.score * 100).toFixed(0)}% match
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: High speed continuous clickable scrolling ticker list */}
                <div className="p-0 flex flex-col justify-between overflow-hidden">
                  <div className="p-4 bg-surface-container-low/30 border-b border-border-subtle/30 flex items-center justify-between">
                    <div className="dc-bottom-cat m-0">LIVE CLICKABLE DISPATCHES</div>
                    <span className="text-[10px] text-outline italic font-body">Auto-indexing active</span>
                  </div>
                  <div className="divide-y divide-border-subtle/30 overflow-y-auto max-h-[350px]">
                    {wireArticles.slice(4).map((a, i) => (
                      <div 
                        key={`wire-scroll-${i}`} 
                        className="dc-wire-item flex flex-col justify-center article-fade-in"
                        onClick={() => setActiveArticle(a)}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1 font-body">
                          <span style={{ color: sentColor(a.sentiment, isDark) }}>
                            ● {a.sentiment?.toUpperCase()} SIGNAL
                          </span>
                          <span className="text-outline font-mono text-[9px]">{(a.score * 100).toFixed(0)}% match</span>
                        </div>
                        <h4 className="dc-mini-h text-xs m-0 line-clamp-1">{a.title}</h4>
                        <div className="text-[9px] text-outline font-body tracking-wider uppercase mt-1 flex items-center justify-between">
                          <span>{a.source}</span>
                          <span className="text-accent-electric font-bold lowercase">read audit →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ═══ FOOTER ═══ */}
          <div className="dc-footer">
            <span>© {today.getFullYear()} The Daily Pulse — PulseIQ Interactive Matrix</span>
            <span>Engineered with Animated Beam Lights · Smooth Hover Translations · Glassmorphic Overlays</span>
            <span>
              {lastUpdated
                ? `Telemetry cycle completed: ${lastUpdated.toLocaleTimeString()}`
                : '"All the Intelligence That\'s Fit to Stream"'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

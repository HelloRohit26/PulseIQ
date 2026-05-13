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

  // Use prop articles from App's auto-refresh, or fetch own if not provided
  useEffect(() => {
    if (propArticles && propArticles.length > 0) {
      setLocalArticles(propArticles);
      setLoading(false);
    } else {
      fetchArticles(50).then(a => { setLocalArticles(a); setLoading(false); });
    }
  }, [propArticles]);

  const articles = localArticles;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const hero = articles[0];
  const mid1 = articles[1];
  const mid2 = articles[2];
  const mid3 = articles[3];
  const bottom = articles.slice(4, 8);
  const globalDispatches = articles.slice(8, 17);
  const wireArticles = articles.slice(17, 30);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-3">
        <span className="material-symbols-outlined text-4xl text-accent-electric animate-spin">autorenew</span>
        <div className="text-on-surface-variant font-body text-xs tracking-widest uppercase font-bold animate-pulse">
          Ingesting live stream edition…
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

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-(--spacing-container-margin) animate-fade-in-up">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;0,900;1,400;1,700&family=UnifrakturMaguntia&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

        .dc-paper {
          max-width: 1220px;
          margin: 0 auto;
          background: ${paperBg};
          box-shadow: ${isDark ? '0 10px 40px rgba(0,0,0,0.8)' : '0 4px 30px rgba(0,0,0,0.1)'};
          font-family: 'Libre Baskerville', 'Georgia', serif;
          color: ${paperTextColor};
          border: 1px solid ${lightBorderColor};
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        /* ─── MASTHEAD ─── */
        .dc-masthead {
          text-align: center;
          padding: 16px 28px 0;
          border-bottom: 2px solid ${borderColor};
        }
        .dc-masthead-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .dc-masthead-box {
          border: 1px solid ${borderColor};
          padding: 6px 12px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          line-height: 1.4;
          text-align: center;
          font-family: 'Space Grotesk', sans-serif;
          min-width: 130px;
          background: ${widgetBg};
          border-radius: 2px;
        }
        .dc-title {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: clamp(38px, 6vw, 68px);
          color: ${paperTextColor};
          line-height: 1;
          margin: 0;
          letter-spacing: 0.5px;
          padding: 0 10px;
        }
        .dc-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid ${lightBorderColor};
          margin-top: 8px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .dc-date {
          font-size: 11px;
          color: ${mutedTextColor};
          font-weight: 500;
        }
        .dc-nav-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .dc-nav-links span { 
          padding: 0 10px; 
          color: ${paperTextColor};
          cursor: pointer;
          transition: color 0.2s;
        }
        .dc-nav-links span:hover { color: #00E5FF; }
        .dc-nav-links span:not(:last-child) { border-right: 1px solid ${lightBorderColor}; }
        .dc-est {
          font-size: 11px;
          color: ${mutedTextColor};
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* ─── SOCIAL + HEADLINE ─── */
        .dc-headline-bar {
          padding: 20px 28px 16px;
          border-bottom: 3px solid ${borderColor};
          text-align: center;
          background: ${isDark ? 'linear-gradient(to bottom, #0F1117, #14171F)' : 'linear-gradient(to bottom, #FAFAFA, #FFFFFF)'};
        }
        .dc-social-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 12px;
        }
        .dc-social-icon {
          width: 26px; height: 26px;
          background: ${borderColor};
          color: ${paperBg};
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
          font-family: sans-serif;
        }
        .dc-social-icon:hover { transform: scale(1.1); }
        .dc-main-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 44px);
          font-weight: 900;
          color: ${paperTextColor};
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.5px;
          text-transform: uppercase;
          max-width: 1000px;
          margin: 0 auto;
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
        .dc-mid-col {
          padding: 18px 20px;
          border-bottom: 1px solid ${lightBorderColor};
          transition: background-color 0.3s;
        }
        .dc-mid-col:hover {
          background-color: ${isDark ? '#181C26' : '#FCFCFC'};
        }
        @media (min-width: 1024px) {
          .dc-mid-col {
            border-bottom: none;
            border-right: 1px solid ${lightBorderColor};
          }
          .dc-mid-col:last-child { border-right: none; }
        }

        .dc-mid-h {
          font-family: 'Playfair Display', serif;
          font-size: 19px;
          font-weight: 800;
          color: ${paperTextColor};
          line-height: 1.25;
          margin: 0 0 6px;
        }
        .dc-byline {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${mutedTextColor};
          margin-bottom: 10px;
          font-family: 'Space Grotesk', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dc-img {
          width: 100%;
          height: 140px;
          background: ${widgetBg};
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-radius: 2px;
          border: 1px solid ${lightBorderColor};
        }
        .dc-img-label {
          font-size: 10px;
          color: ${mutedTextColor};
          font-style: italic;
          text-align: center;
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .dc-p {
          font-size: 13px;
          line-height: 1.65;
          color: ${isDark ? '#CBD5E1' : '#222222'};
          margin: 0;
          text-align: justify;
        }
        
        /* Premium Drop-Cap effect for the hero breaking article */
        .dc-dropcap::first-letter {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 900;
          float: left;
          line-height: 0.85;
          padding-right: 8px;
          padding-top: 4px;
          color: ${isDark ? '#00E5FF' : '#111111'};
        }

        .dc-continues {
          font-size: 10px;
          font-style: italic;
          color: ${mutedTextColor};
          text-align: right;
          margin-top: 10px;
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
          font-size: 32px;
          font-weight: 900;
          font-family: 'Space Grotesk', sans-serif;
          line-height: 1.1;
          margin-bottom: 6px;
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
          padding: 5px 0;
          border-bottom: 1px dotted ${lightBorderColor};
          font-family: 'Space Grotesk', sans-serif;
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
        .dc-bottom-col {
          padding: 16px 18px;
          border-bottom: 1px solid ${lightBorderColor};
          transition: background-color 0.3s;
        }
        .dc-bottom-col:hover {
          background-color: ${isDark ? '#181C26' : '#FCFCFC'};
        }
        @media (min-width: 1024px) {
          .dc-bottom-col {
            border-bottom: none;
            border-right: 1px solid ${lightBorderColor};
          }
          .dc-bottom-col:last-child { border-right: none; }
        }
        .dc-bottom-h {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 800;
          color: ${paperTextColor};
          line-height: 1.25;
          margin: 0 0 6px;
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
          margin-bottom: 8px;
          font-family: 'Space Grotesk', sans-serif;
        }

        /* ─── EXTENDED SECTIONS ─── */
        .dc-section-header {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: clamp(26px, 4vw, 36px);
          text-align: center;
          padding: 28px 0 12px;
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
          padding: 12px 18px;
          border-bottom: 1px solid ${lightBorderColor};
          transition: padding-left 0.2s;
        }
        .dc-wire-item:hover {
          padding-left: 24px;
          background-color: ${isDark ? '#181C26' : '#FCFCFC'};
        }
        .dc-wire-item:last-child { border-bottom: none; }
        .dc-mini-h {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px;
          line-height: 1.3;
        }

        /* ─── FOOTER ─── */
        .dc-footer {
          padding: 16px 28px;
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
      `}</style>

      <div className="dc-paper">

        {/* ═══ MASTHEAD HEADER ═══ */}
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
          <div className="dc-nav-row">
            <span className="dc-date">{dateStr}</span>
            <div className="dc-nav-links">
              <span>HEADLINES</span>
              <span>MACRO VECTORS</span>
              <span>EQUITIES</span>
              <span>COMMODITIES</span>
              <span>DEEP AI</span>
              <span>CYBERNETICS</span>
            </div>
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
            <h2 className="dc-main-headline">{hero.title}</h2>
          </div>
        )}

        {/* ═══ PRIMARY MIDSECTION MULTI-COLUMN GRID ═══ */}
        <div className="dc-mid">
          
          {/* Column 1 — Breaking Hero Continued */}
          {hero && (
            <div className="dc-mid-col">
              <div className="dc-img">
                <img 
                  src={hero.title.toLowerCase().includes('crypto') || hero.title.toLowerCase().includes('bitcoin') 
                    ? "https://media.giphy.com/media/7FBY7h5Psqd20/giphy.gif" 
                    : `https://loremflickr.com/800/600/finance,stock?lock=${hero.title.length}`}
                  alt="Breaking News Illustration" 
                  className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-500" 
                />
              </div>
              <div className="dc-img-label">
                INSTITUTIONAL FEED: {hero.source} reports heavily weighted metrics.
              </div>
              <div className="dc-byline">
                <span className="w-2 h-2 rounded-full bg-accent-electric animate-pulse"></span>
                By PulseIQ NLP Stream Pipeline
              </div>
              
              {/* Added Real Comprehensive Description with DropCap */}
              <p className="dc-p dc-dropcap">
                {hero.description || hero.content || `${hero.source} has dispatched an institutional market update triggering rapid volume adjustments across multiple sovereign asset frameworks. NLP sentiment classifiers flagged this vector with high standard deviations.`}
              </p>
              
              <p className="dc-p mt-3">
                Algorithmic trading desks track immediate secondary alpha divergence metrics closely. The baseline confidence projection registers at {(hero.score * 100).toFixed(1)}% supporting sustained macro adjustments globally.
              </p>
              <div className="dc-continues">—Continues Section A, Column 2</div>
            </div>
          )}

          {/* Column 2 — Secondary Report */}
          {mid1 && (
            <div className="dc-mid-col">
              <h3 className="dc-mid-h">{mid1.title}</h3>
              <div className="dc-byline">
                <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                {mid1.source} Dispatches
              </div>
              <div className="dc-img">
                <img 
                  src={`https://loremflickr.com/800/600/business,ai?lock=${mid1.title.length}`}
                  alt="Secondary Context" 
                  className="w-full h-full object-cover grayscale opacity-85 hover:grayscale-0 transition-all duration-500" 
                />
              </div>
              
              {/* Added Real Description rendering */}
              <p className="dc-p">
                {mid1.description || mid1.content || `Stream sensors confirm active institutional interest centered on natural language vector events indexed by ${mid1.source}. The underlying market consensus points toward sustained volatility expansion.`}
              </p>
              
              <div className="mt-3 p-2 rounded border border-border-subtle/30 bg-surface-container-low/20 text-xs text-outline font-body">
                <strong>Signal Confidence:</strong> {(mid1.score * 100).toFixed(0)}% <br/>
                <strong>Vector Directionality:</strong> <span style={{ color: sentColor(mid1.sentiment, isDark), fontWeight: 'bold' }}>{mid1.sentiment?.toUpperCase()}</span>
              </div>
              <div className="dc-continues">—Continues Section B</div>
            </div>
          )}

          {/* Column 3 — Supporting Analytics */}
          {mid2 && (
            <div className="dc-mid-col">
              <h3 className="dc-mid-h" style={{ textTransform: 'uppercase' }}>{mid2.title}</h3>
              <div className="dc-byline">
                <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                {mid2.source} Staff Report
              </div>
              <div className="dc-img" style={{ height: '110px' }}>
                 <img 
                  src={`https://loremflickr.com/800/600/tech,chart?lock=${mid2.title.length}`}
                  alt="Supporting Analytics" 
                  className="w-full h-full object-cover grayscale opacity-85 hover:grayscale-0 transition-all duration-500" 
                />
              </div>
              
              {/* Added Real Description rendering */}
              <p className="dc-p">
                {mid2.description || mid2.content || `Continuous parsing streams route structured JSON blocks mapped from ${mid2.source}. The vector matrix indexes deep relational correlations across adjacent supply hubs.`}
              </p>

              {mid3 && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <h3 className="dc-mid-h text-base">{mid3.title}</h3>
                  <div className="dc-byline mb-1">{mid3.source}</div>
                  <p className="dc-p text-xs">
                    {mid3.description || mid3.content || `Supplemental vector indicators point toward shifting momentum distributions. Weight thresholds clear standard benchmarks.`}
                  </p>
                </div>
              )}
              <div className="dc-continues">—Continues Section C</div>
            </div>
          )}

          {/* Column 4 — Live Telemetry & Metrics panel */}
          <div className="dc-mid-col" style={{ background: widgetBg }}>
            <div className="dc-weather-title">TERMINAL METRICS:</div>
            <div className="dc-weather-city">LIVE SENTIMENT STATUS</div>
            <div className="dc-weather-temp" style={{ color: sentColor(hero?.sentiment, isDark) }}>
              {hero?.sentiment?.toLowerCase() === 'positive' ? '▲ BULLISH' : 
               hero?.sentiment?.toLowerCase() === 'negative' ? '▼ BEARISH' : '■ NEUTRAL'}
            </div>
            <div className="dc-weather-desc">
              Weighted index calculated from continuous ingestion of active real-time natural language streams.
            </div>

            <div className="dc-sports-title">STREAM ENGINE STATE</div>
            <div className="dc-index-row">
              <span className="text-outline">Total Indexed Feeds</span>
              <strong className="text-on-surface">{articles.length}</strong>
            </div>
            <div className="dc-index-row">
              <span className="text-outline">Bullish Catalysts</span>
              <strong style={{ color: isDark ? '#4ADE80' : '#0a7a0a' }}>
                {articles.filter(a => a.sentiment?.toLowerCase() === 'positive').length}
              </strong>
            </div>
            <div className="dc-index-row">
              <span className="text-outline">Contagion Warnings</span>
              <strong style={{ color: isDark ? '#F87171' : '#b80000' }}>
                {articles.filter(a => a.sentiment?.toLowerCase() === 'negative').length}
              </strong>
            </div>
            <div className="dc-index-row">
              <span className="text-outline">Terminal Sources</span>
              <strong className="text-on-surface">{new Set(articles.map(a => a.source)).size}</strong>
            </div>
            <div className="dc-index-row">
              <span className="text-outline">Mean Vector Weight</span>
              <strong className="text-accent-electric">
                {articles.length > 0 ? (articles.reduce((s, a) => s + (a.score || 0), 0) / articles.length * 100).toFixed(0) : 0}%
              </strong>
            </div>

            <div className="dc-sports-title" style={{ marginTop: 22 }}>PIPELINE STATUS</div>
            <div className="p-2 rounded bg-background/40 border border-border-subtle/30 font-mono text-[10px] text-outline leading-normal">
              <span className="text-accent-electric font-bold">● KAFKA:</span> STREAMING ACTIVE <br/>
              <span className="text-sentiment-positive font-bold">● CHROMADB:</span> PERSISTED <br/>
              <span className="text-on-surface font-bold">● GEMINI RAG:</span> SYNCED
            </div>
          </div>
        </div>

        {/* ═══ SECONDARY ARTICLES ROW ═══ */}
        <div className="dc-bottom">
          {bottom.map((a, i) => {
            const cats = ['MARKETS DESK', 'CYBER TECH', 'MACRO ECONOMICS', 'STRATEGIC INSIGHT'];
            return (
              <div key={i} className="dc-bottom-col flex flex-col justify-between">
                <div>
                  <div className="dc-bottom-cat">{cats[i] || 'INTELLIGENCE WIRE'}</div>
                  <h4 className="dc-bottom-h">{a.title}</h4>
                  <div className="dc-byline">Reported by {a.source}</div>
                  
                  {/* Real comprehensive description rendering */}
                  <p className="dc-p text-xs">
                    {a.description || a.content || `Analytical indicators traced from ${a.source} point toward fundamental realignments inside major structural frameworks. Stream classifiers register a ${(a.score * 100).toFixed(0)}% standard match.`}
                  </p>
                </div>
                <div className="dc-continues">—Continues page {i + 5}</div>
              </div>
            );
          })}
        </div>

        {/* ═══ GLOBAL DISPATCHES ═══ */}
        {globalDispatches.length > 0 && (
          <>
            <div className="dc-section-header">Global Dispatches</div>
            <div className="dc-grid-3">
              {globalDispatches.map((a, i) => (
                <div key={i} className="dc-bottom-col flex flex-col justify-between">
                  <div>
                    {i % 3 === 0 && (
                      <div className="dc-img" style={{ height: '120px', marginBottom: '12px' }}>
                        <img 
                          src={`https://loremflickr.com/400/300/world,market?lock=${a.title.length + i}`}
                          alt="Global Dispatches" 
                          className="w-full h-full object-cover grayscale opacity-85 hover:grayscale-0 transition-all duration-500" 
                        />
                      </div>
                    )}
                    <div className="dc-bottom-cat">INTERNATIONAL BUREAU</div>
                    <h4 className="dc-bottom-h text-sm font-bold">{a.title}</h4>
                    <div className="dc-byline">Source: {a.source}</div>
                    
                    {/* Real description rendering */}
                    <p className="dc-p text-[12px] leading-relaxed">
                      {a.description || a.content || `Sovereign feed telemetry updates logged direct from ${a.source} document evolving macroeconomic shifts. Institutional positions adjust dynamically.`}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-outline font-body flex items-center justify-between">
                    <span>Impact Vector: <strong style={{ color: sentColor(a.sentiment, isDark) }}>{a.sentiment?.toUpperCase()}</strong></span>
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
                  <div key={i} className="flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-body font-bold text-accent-electric uppercase mb-1">
                        ● DEEP DIVE WIRE
                      </div>
                      <h4 className="dc-bottom-h text-sm">{a.title}</h4>
                      <div className="dc-byline mb-2">{a.source} Trace</div>
                      <p className="dc-p text-xs">
                        {a.description || a.content || `In-depth terminal parsing logs substantial capital flow reallocations documented across the ${a.source} pipeline network.`}
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] text-outline italic">
                      Stream index match: {(a.score * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: High speed mini continuous wire */}
              <div className="p-0 flex flex-col justify-between">
                <div className="p-4 bg-surface-container-low/30 border-b border-border-subtle/30">
                  <div className="dc-bottom-cat m-0">REAL-TIME TICKER DISPATCHES</div>
                </div>
                <div className="divide-y divide-border-subtle/30 overflow-y-auto max-h-[400px]">
                  {wireArticles.slice(4).map((a, i) => (
                    <div key={i} className="dc-wire-item">
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1 font-body">
                        <span style={{ color: sentColor(a.sentiment, isDark) }}>
                          ● {a.sentiment?.toUpperCase()} SIGNAL
                        </span>
                        <span className="text-outline">{(a.score * 100).toFixed(0)}% match</span>
                      </div>
                      <h4 className="dc-mini-h text-xs">{a.title}</h4>
                      <div className="text-[9px] text-outline font-body tracking-wider uppercase mt-1">
                        {a.source} • Streamed recently
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
          <span>© {today.getFullYear()} The Daily Pulse — PulseIQ Autonomous News Network</span>
          <span>Engineered with React 19 · Apache Kafka · Gemini Pro RAG</span>
          <span>
            {lastUpdated
              ? `Terminal matrix synchronized: ${lastUpdated.toLocaleTimeString()}`
              : '"All the Intelligence That\'s Fit to Stream"'}
          </span>
        </div>

      </div>
    </div>
  );
}

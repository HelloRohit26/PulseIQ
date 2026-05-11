import { useState, useEffect } from 'react';
import { fetchArticles } from '../services/api';

function sentColor(s) {
  if (s === 'positive' || s === 'POSITIVE') return '#0a7a0a';
  if (s === 'negative' || s === 'NEGATIVE') return '#b80000';
  return '#444';
}

export default function Newspaper({ articles: propArticles, lastUpdated }) {
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
  const ticker = articles.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-on-surface-variant font-body text-sm animate-pulse">Loading edition…</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=UnifrakturMaguntia&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

        .dc-page {
          min-height: 100vh;
          background: #e8e8e8;
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        .dc-paper {
          max-width: 1160px;
          width: 100%;
          background: #ffffff;
          box-shadow: 0 2px 20px rgba(0,0,0,0.15);
          font-family: 'Libre Baskerville', 'Georgia', serif;
          color: #111;
        }

        /* ─── MASTHEAD ─── */
        .dc-masthead {
          text-align: center;
          padding: 12px 24px 0;
          border-bottom: 2px solid #111;
        }
        .dc-masthead-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }
        .dc-masthead-box {
          border: 1px solid #111;
          padding: 4px 10px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          line-height: 1.3;
          text-align: center;
          max-width: 120px;
        }
        .dc-title {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: 64px;
          color: #111;
          line-height: 1;
          margin: 0;
          letter-spacing: 1px;
        }
        .dc-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-top: 1px solid #ccc;
          margin-top: 6px;
        }
        .dc-date {
          font-size: 11px;
          color: #333;
        }
        .dc-nav-links {
          display: flex;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #111;
        }
        .dc-nav-links span { padding: 0 8px; }
        .dc-nav-links span:not(:last-child) { border-right: 1px solid #999; }
        .dc-est {
          font-size: 11px;
          color: #333;
          font-weight: 600;
        }

        /* ─── SOCIAL + HEADLINE ─── */
        .dc-headline-bar {
          padding: 14px 24px 10px;
          border-bottom: 3px solid #111;
        }
        .dc-social-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 10px;
        }
        .dc-social-icon {
          width: 26px; height: 26px;
          background: #111;
          color: #fff;
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          font-family: Arial, sans-serif;
        }
        .dc-main-headline {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 900;
          color: #111;
          line-height: 1.05;
          margin: 0;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        /* ─── MID SECTION (3 articles + weather) ─── */
        .dc-mid {
          display: grid;
          grid-template-columns: 2fr 2fr 2fr 1.2fr;
          border-bottom: 2px solid #111;
        }
        .dc-mid-col {
          padding: 14px 16px;
          border-right: 1px solid #ddd;
        }
        .dc-mid-col:last-child { border-right: none; }

        .dc-mid-h {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
          margin: 0 0 4px;
        }
        .dc-byline {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #555;
          margin-bottom: 6px;
        }
        .dc-img {
          width: 100%;
          height: 120px;
          background: #d5d5d5;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .dc-img-label {
          font-size: 9px;
          color: #888;
          font-style: italic;
          text-align: center;
          margin-bottom: 6px;
        }
        .dc-p {
          font-size: 12px;
          line-height: 1.6;
          color: #222;
          margin: 0;
          text-align: justify;
        }
        .dc-continues {
          font-size: 10px;
          font-style: italic;
          color: #666;
          text-align: right;
          margin-top: 6px;
        }

        /* Weather widget */
        .dc-weather-title {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          border-bottom: 2px solid #111;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        .dc-weather-city {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .dc-weather-temp {
          font-size: 36px;
          font-weight: 300;
          font-family: 'Playfair Display', serif;
          line-height: 1;
          margin-bottom: 4px;
        }
        .dc-weather-desc {
          font-size: 11px;
          color: #555;
          margin-bottom: 10px;
        }
        .dc-sports-title {
          font-family: 'Playfair Display', serif;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          border-bottom: 2px solid #111;
          padding-bottom: 3px;
          margin: 12px 0 6px;
        }
        .dc-index-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 2px 0;
          border-bottom: 1px dotted #ccc;
        }

        /* ─── BOTTOM ARTICLES ─── */
        .dc-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          border-bottom: 2px solid #111;
        }
        .dc-bottom-col {
          padding: 12px 14px;
          border-right: 1px solid #ddd;
        }
        .dc-bottom-col:last-child { border-right: none; }
        .dc-bottom-h {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
          margin: 0 0 4px;
          text-transform: uppercase;
        }
        .dc-bottom-cat {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #111;
          border-bottom: 2px solid #111;
          display: inline-block;
          padding-bottom: 2px;
          margin-bottom: 6px;
        }

        /* ─── EXTENDED SECTIONS ─── */
        .dc-section-header {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: 32px;
          text-align: center;
          padding: 20px 0 10px;
          border-bottom: 3px double #111;
          margin-top: 10px;
        }
        .dc-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 2px solid #111;
        }
        .dc-grid-2 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          border-bottom: 2px solid #111;
        }
        .dc-wire-item {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
        }
        .dc-wire-item:last-child { border-bottom: none; }
        .dc-mini-h {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        /* ─── FOOTER ─── */
        .dc-footer {
          padding: 10px 24px;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #888;
        }
      `}</style>

      <div className="dc-page">
        <div className="dc-paper">

          {/* ═══ MASTHEAD ═══ */}
          <div className="dc-masthead">
            <div className="dc-masthead-top">
              <div className="dc-masthead-box">
                FERS DOWSION<br/>CHINIGA CAOADО
              </div>
              <h1 className="dc-title">The Daily Pulse</h1>
              <div className="dc-masthead-box">
                REAL-TIME<br/>AI INTELLIGENCE
              </div>
            </div>
            <div className="dc-nav-row">
              <span className="dc-date">{dateStr}</span>
              <div className="dc-nav-links">
                <span>HOME</span><span>MARKETS</span><span>BUSINESS</span>
                <span>TECH</span><span>AI</span><span>OPINION</span>
              </div>
              <span className="dc-est">EST. 2026</span>
            </div>
          </div>

          {/* ═══ MAIN HEADLINE ═══ */}
          {hero && (
            <div className="dc-headline-bar">
              <div className="dc-social-row">
                <div className="dc-social-icon">f</div>
                <div className="dc-social-icon">𝕏</div>
                <div className="dc-social-icon">in</div>
                <div className="dc-social-icon">✉</div>
                <div className="dc-social-icon">🖨</div>
              </div>
              <h2 className="dc-main-headline">{hero.title}</h2>
            </div>
          )}

          {/* ═══ MID SECTION ═══ */}
          <div className="dc-mid">
            {/* Col 1 — Hero continued */}
            {hero && (
              <div className="dc-mid-col">
                <div className="dc-img">
                  <img 
                    src={hero.title.toLowerCase().includes('crypto') || hero.title.toLowerCase().includes('bitcoin') 
                      ? "https://media.giphy.com/media/7FBY7h5Psqd20/giphy.gif" 
                      : `https://loremflickr.com/800/600/news,market?lock=${hero.title.length}`}
                    alt="Hero" 
                    className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-500" 
                  />
                </div>
                <div className="dc-img-label">
                  BREAKING: {hero.source} reports on major market developments.
                </div>
                <div className="dc-byline">By PulseIQ Wire Service</div>
                <p className="dc-p">
                  {hero.source} has published a significant report that is shaping market sentiment globally.
                  PulseIQ's AI analysis engine classified this development as {hero.sentiment?.toLowerCase()} with
                  a confidence score of {(hero.score * 100).toFixed(1)}%.
                  Analysts across Wall Street and international markets are closely monitoring the fallout.
                </p>
                <div className="dc-continues">—Continues page 2</div>
              </div>
            )}

            {/* Col 2 — Article 2 */}
            {mid1 && (
              <div className="dc-mid-col">
                <h3 className="dc-mid-h">{mid1.title}</h3>
                <div className="dc-byline">By {mid1.source} Correspondent</div>
                <div className="dc-img">
                  <img 
                    src={`https://loremflickr.com/800/600/technology,business?lock=${mid1.title.length}`}
                    alt="Article 2" 
                    className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-500" 
                  />
                </div>
                <p className="dc-p">
                  This report from {mid1.source} has been processed through PulseIQ's sentiment pipeline
                  and received a {(mid1.score * 100).toFixed(0)}% confidence rating. Market watchers say the
                  implications could extend well into the next quarter as traders reassess their positions.
                </p>
                <div className="dc-continues">—Continues page 3</div>
              </div>
            )}

            {/* Col 3 — Article 3 */}
            {mid2 && (
              <div className="dc-mid-col">
                <h3 className="dc-mid-h" style={{ textTransform: 'uppercase' }}>{mid2.title}</h3>
                <div className="dc-byline">By {mid2.source} Staff</div>
                <div className="dc-img" style={{ height: '90px' }}>
                   <img 
                    src={`https://loremflickr.com/800/600/finance,chart?lock=${mid2.title.length}`}
                    alt="Article 3" 
                    className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-500" 
                  />
                </div>
                <p className="dc-p">
                  {mid2.source} reports a developing story that has caught the attention of both retail and
                  institutional investors. The PulseIQ real-time Kafka pipeline ingested this article and the
                  ChromaDB vector store has indexed it for AI-powered retrieval. Sentiment analysis
                  shows {(mid2.score * 100).toFixed(0)}% confidence in a {mid2.sentiment?.toLowerCase()} classification.
                </p>
                {mid3 && (
                  <>
                    <div style={{ borderTop: '1px solid #ddd', marginTop: 10, paddingTop: 10 }}>
                      <h3 className="dc-mid-h">{mid3.title}</h3>
                      <div className="dc-byline">By {mid3.source}</div>
                      <p className="dc-p">
                        Further developments from {mid3.source} indicate shifting dynamics in this sector.
                        Confidence score: {(mid3.score * 100).toFixed(0)}%.
                      </p>
                    </div>
                  </>
                )}
                <div className="dc-continues">—Continues page 4</div>
              </div>
            )}

            {/* Col 4 — Weather + Index */}
            <div className="dc-mid-col" style={{ background: '#fafafa' }}>
              <div className="dc-weather-title">WEATHER:</div>
              <div className="dc-weather-city">LIVE MARKET WATCH</div>
              <div className="dc-weather-temp" style={{ fontSize: 28, color: sentColor(hero?.sentiment) }}>
                {hero?.sentiment === 'POSITIVE' || hero?.sentiment === 'positive' ? '▲ Bullish' : '▼ Bearish'}
              </div>
              <div className="dc-weather-desc">
                Overall market sentiment based on {articles.length} articles processed by PulseIQ AI.
              </div>

              <div className="dc-sports-title">PULSE INDEX</div>
              <div className="dc-index-row">
                <span>Articles Processed</span>
                <strong>{articles.length}</strong>
              </div>
              <div className="dc-index-row">
                <span>Positive Signals</span>
                <strong style={{ color: '#0a7a0a' }}>
                  {articles.filter(a => a.sentiment === 'POSITIVE' || a.sentiment === 'positive').length}
                </strong>
              </div>
              <div className="dc-index-row">
                <span>Negative Signals</span>
                <strong style={{ color: '#b80000' }}>
                  {articles.filter(a => a.sentiment === 'NEGATIVE' || a.sentiment === 'negative').length}
                </strong>
              </div>
              <div className="dc-index-row">
                <span>Sources</span>
                <strong>{new Set(articles.map(a => a.source)).size}</strong>
              </div>
              <div className="dc-index-row">
                <span>Avg Confidence</span>
                <strong>
                  {articles.length > 0 ? (articles.reduce((s, a) => s + (a.score || 0), 0) / articles.length * 100).toFixed(0) : 0}%
                </strong>
              </div>

              <div className="dc-sports-title" style={{ marginTop: 14 }}>DATA PIPELINE</div>
              <div className="dc-p" style={{ fontSize: 10, lineHeight: 1.5 }}>
                Kafka streaming active. ChromaDB vectors indexed. Gemini RAG online.
              </div>
            </div>
          </div>

          {/* ═══ BOTTOM ARTICLES ═══ */}
          <div className="dc-bottom">
            {bottom.map((a, i) => {
              const cats = ['MARKETS', 'TECHNOLOGY', 'GLOBAL', 'ANALYSIS'];
              return (
                <div key={i} className="dc-bottom-col">
                  <div className="dc-bottom-cat">{cats[i] || 'NEWS'}</div>
                  <h4 className="dc-bottom-h">{a.title}</h4>
                  <div className="dc-byline">By {a.source}</div>
                  <p className="dc-p">
                    {a.source} reports on this developing story. PulseIQ sentiment: {a.sentiment?.toLowerCase()},
                    confidence {(a.score * 100).toFixed(0)}%. This article was streamed via Kafka and processed
                    by the AI consumer in real-time.
                  </p>
                  <div className="dc-continues">—Continues page {i + 5}</div>
                </div>
              );
            })}
          </div>

          {/* ═══ GLOBAL DISPATCHES (Articles 8-16) ═══ */}
          {articles.length > 8 && (
            <>
              <div className="dc-section-header">Global Dispatches</div>
              <div className="dc-grid-3">
                {articles.slice(8, 17).map((a, i) => (
                  <div key={i} className="dc-bottom-col">
                    {i % 3 === 0 && (
                      <div className="dc-img" style={{ height: '100px', marginBottom: '8px' }}>
                        <img 
                          src={`https://loremflickr.com/400/300/world,news?lock=${a.title.length + i}`}
                          alt="World News" 
                          className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-500" 
                        />
                      </div>
                    )}
                    <div className="dc-bottom-cat">INTERNATIONAL DESK</div>
                    <h4 className="dc-bottom-h" style={{ fontSize: '13px' }}>{a.title}</h4>
                    <div className="dc-byline">Reported by {a.source}</div>
                    <p className="dc-p" style={{ fontSize: '11px' }}>
                      As global markets react, {a.source} provides critical context. 
                      Sentiment remains {a.sentiment?.toLowerCase()} regarding these developments.
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ MARKETS IN-DEPTH & WIRE (Articles 17-35) ═══ */}
          {articles.length > 17 && (
            <>
              <div className="dc-section-header">Markets & Innovation</div>
              <div className="dc-grid-2">
                {/* Left Column: Larger deep-dives */}
                <div className="dc-mid-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderRight: '1px solid #ddd' }}>
                  {articles.slice(17, 23).map((a, i) => (
                    <div key={i}>
                      <h4 className="dc-bottom-h">{a.title}</h4>
                      <div className="dc-byline">{a.source} Analysis</div>
                      <p className="dc-p">
                        An in-depth look at how {a.source} views the current market trajectory. The AI pipeline
                        flagged this as a high-priority read with a confidence of {(a.score * 100).toFixed(0)}%.
                      </p>
                    </div>
                  ))}
                </div>
                {/* Right Column: Fast Wire */}
                <div className="dc-mid-col" style={{ padding: 0 }}>
                  <div className="dc-bottom-cat" style={{ margin: '16px 16px 8px' }}>THE LATE EDITION WIRE</div>
                  {articles.slice(23, 35).map((a, i) => (
                    <div key={i} className="dc-wire-item">
                      <div className="dc-date" style={{ color: sentColor(a.sentiment), fontWeight: 'bold' }}>
                        {a.sentiment?.toUpperCase()} SIGNAL
                      </div>
                      <h4 className="dc-mini-h">{a.title}</h4>
                      <div className="dc-byline" style={{ margin: 0 }}>{a.source} • {Math.floor(Math.random() * 59) + 1}m ago</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ FOOTER ═══ */}
          <div className="dc-footer">
            <span>© {today.getFullYear()} The Daily Pulse — A PulseIQ Publication</span>
            <span>Powered by Apache Kafka · Google Gemini AI · ChromaDB</span>
            <span>
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                : '"All the Intelligence That\'s Fit to Stream"'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

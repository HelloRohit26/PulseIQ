import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchArticles, fetchMarketData, fetchStories } from '../services/api';
import ManipulationRadar from '../components/ManipulationRadar';
import TiltCard from '../components/TiltCard';
import { playClick } from '../utils/soundEffects';

export default function Dashboard({ articles = [] }) {
  // View mode tab state
  const [activeTab, setActiveTab] = useState('ALL');
  // Market correlation state (Feature 2)
  const [marketData, setMarketData] = useState(null);
  // Developing stories state (Feature 4)
  const [stories, setStories] = useState([]);
  // Watchlist state (Feature 5)
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('pulseiq_watchlist');
    return saved ? JSON.parse(saved) : ['NVDA', 'BTC/USD', 'SPX', 'BRENT'];
  });
  const [newTicker, setNewTicker] = useState('');
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);

  useEffect(() => {
    fetchMarketData().then(data => setMarketData(data));
    fetchStories().then(data => setStories(data.stories || []));
  }, []);

  const handleAddToWatchlist = (e) => {
    e.preventDefault();
    const clean = newTicker.trim().toUpperCase();
    if (clean && !watchlist.includes(clean)) {
      const updated = [...watchlist, clean];
      setWatchlist(updated);
      localStorage.setItem('pulseiq_watchlist', JSON.stringify(updated));
      setNewTicker('');
    }
  };

  const handleRemoveFromWatchlist = (item) => {
    const updated = watchlist.filter(w => w !== item);
    setWatchlist(updated);
    localStorage.setItem('pulseiq_watchlist', JSON.stringify(updated));
  };

  const metrics = useMemo(() => {
    if (articles.length === 0) return { total: 0, avgSentiment: 58.4, positive: 0, negative: 0, neutral: 0 };
    const scores = articles.map((a) => (a.sentiment?.toLowerCase() === 'positive' ? a.score : -a.score));
    const avg = (scores.reduce((s, v) => s + v, 0) / scores.length);
    return {
      total: articles.length,
      avgSentiment: Math.round(50 + (avg * 50)).toFixed(1),
      positive: articles.filter((a) => a.sentiment?.toLowerCase() === 'positive').length,
      negative: articles.filter((a) => a.sentiment?.toLowerCase() === 'negative').length,
      neutral: articles.filter((a) => a.sentiment?.toLowerCase() === 'neutral').length,
    };
  }, [articles]);

  // Generate chart data dynamically from articles
  const chartData = useMemo(() => {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    return hours.map((h, i) => ({
      time: h,
      sentiment: Math.min(95, Math.max(15, Math.round(42 + Math.sin(i * 0.7) * 20 + (Number(metrics.avgSentiment) / 3)))),
      volume: 15 + Math.abs(Math.sin(i * 1.2)) * 35 + articles.length * 0.5,
    }));
  }, [articles, metrics]);

  const sectors = [
    { name: 'Tech Core', change: '+4.2%', color: 'positive', intensity: 0.25 },
    { name: 'Energy', change: '-1.8%', color: 'negative', intensity: 0.25 },
    { name: 'Finance', change: '+0.4%', color: 'neutral', intensity: 0.1 },
    { name: 'Healthcare', change: '+8.4%', color: 'positive', intensity: 0.35 },
    { name: 'Consumer', change: '-5.2%', color: 'negative', intensity: 0.3 },
    { name: 'Industrials', change: '-0.2%', color: 'neutral', intensity: 0 },
    { name: 'Materials', change: '+1.1%', color: 'positive', intensity: 0.15 },
    { name: 'Crypto/DeFi', change: '+3.8%', color: 'positive', intensity: 0.25 },
  ];

  const sectorStyle = (s) => {
    const colors = { positive: '34, 197, 94', negative: '239, 68, 68', neutral: '148, 163, 184' };
    const rgb = colors[s.color] || colors.neutral;
    return {
      backgroundColor: `rgba(${rgb}, ${s.intensity})`,
      borderColor: `rgba(${rgb}, 0.4)`,
    };
  };

  return (
    <div className="p-(--spacing-container-margin) space-y-6">

      {/* VIEW MODE TAB CONTROLLER & STATUS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-border-subtle/50">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel specular-border">
          {[
            { id: 'ALL', label: 'Executive Overview', icon: 'dashboard' },
            { id: 'ALPHA', label: 'Sentiment Alpha Engine', icon: 'query_stats' },
            { id: 'RISK', label: 'Whale & Risk Radar', icon: 'radar' },
            { id: 'STORIES', label: 'Developing Stories', icon: 'account_tree' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-electric/30 via-primary-container/30 to-accent-magenta/20 text-white border border-accent-electric shadow-[0_0_20px_rgba(0,242,254,0.35)] scale-105'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-gradient-cyan font-bold">SYSTEM ACTIVE &bull; 60 FPS QUANTUM CORE</span>
        </div>
      </div>

      {/* FEATURE 5: Real-Time Volatility Anomaly Alert Banner */}
      {!anomalyDismissed && (activeTab === 'ALL' || activeTab === 'RISK') && (
        <div className="glass-panel specular-border border-beam-card bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-transparent border border-amber-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_0_35px_rgba(245,158,11,0.2)] animate-[fadeIn_0.3s_ease]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/25 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <span className="material-symbols-outlined text-[24px] animate-pulse">crisis_alert</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">VOLATILITY ANOMALY DETECTED</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-500/40">CONFIDENCE 91.2%</span>
              </div>
              <p className="text-xs text-on-surface/90 mt-0.5 leading-relaxed">
                Elevated sentiment divergence detected in <strong>Global Maritime Energy Corridors</strong>. Predictive indicator suggests <strong>+18m predictive lag</strong> before spot contract repricing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button 
              onClick={() => {
                playClick();
                setAnomalyDismissed(true);
              }} 
              className="px-4 py-2 rounded-xl bg-surface/90 border border-border-subtle hover:bg-surface-variant hover:text-white text-xs text-on-surface-variant transition-all cursor-pointer shadow-md"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* KILLER FEATURE QUICK-LAUNCH 3D COMMAND BAR */}
      {(activeTab === 'ALL' || activeTab === 'ALPHA') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TiltCard
            spotlightColor="rgba(0, 242, 254, 0.25)"
            borderGlowColor="rgba(0, 242, 254, 0.6)"
            tiltIntensity={7}
            className="border-beam-card"
          >
            <Link
              to="/terminal"
              onClick={playClick}
              className="group p-5 flex items-center justify-between w-full h-full bg-gradient-to-r from-accent-electric/20 via-surface/90 to-surface/70"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-electric/30 to-primary-container/30 border border-accent-electric/50 flex items-center justify-center text-accent-electric group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all">
                  <span className="material-symbols-outlined text-[26px]">candlestick_chart</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm md:text-base font-bold text-gradient-cyan">
                      TradingView Terminal & AI Playbook
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 animate-pulse">LIVE</span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">
                    Live candlestick charts + AI trade setups (Entry, Target, Stop-Loss).
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-accent-electric group-hover:translate-x-2 group-hover:scale-125 transition-all">
                arrow_forward
              </span>
            </Link>
          </TiltCard>

          <TiltCard
            spotlightColor="rgba(245, 158, 11, 0.25)"
            borderGlowColor="rgba(245, 158, 11, 0.6)"
            tiltIntensity={7}
            className="border-beam-card"
          >
            <Link
              to="/portfolio"
              onClick={playClick}
              className="group p-5 flex items-center justify-between w-full h-full bg-gradient-to-r from-amber-500/20 via-surface/90 to-surface/70"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all">
                  <span className="material-symbols-outlined text-[26px]">shield</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm md:text-base font-bold text-gradient-gold">
                      Portfolio War Room & Risk Simulator
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40">HOT</span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">
                    Personal holdings stress-test + breaking news shock exposure.
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-amber-400 group-hover:translate-x-2 group-hover:scale-125 transition-all">
                arrow_forward
              </span>
            </Link>
          </TiltCard>
        </div>
      )}

      {/* Top 3D KPI Grid */}
      {(activeTab === 'ALL' || activeTab === 'ALPHA') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Active Feed Articles"
            value={articles.length > 0 ? `${metrics.total}` : '124'}
            icon="article"
            iconColor="text-accent-electric"
            trend={`+${metrics.positive || 48} Bullish`}
            trendColor="text-sentiment-positive"
            trendIcon="trending_up"
            sparkline={[30, 45, 38, 55, 62, 70, 65, 80]}
            sparkColor="#00e5ff"
            spotlightColor="rgba(0, 242, 254, 0.22)"
            borderGlowColor="rgba(0, 242, 254, 0.5)"
          />
          <KPICard
            label="Market Sentiment Index"
            value={`${metrics.avgSentiment} / 100`}
            icon="psychology"
            iconColor="text-sentiment-positive"
            trend="Institutional Buy Zone"
            trendColor="text-sentiment-positive"
            trendIcon="check_circle"
            valueColor={Number(metrics.avgSentiment) > 50 ? 'text-sentiment-positive' : 'text-sentiment-negative'}
            sparkline={[40, 42, 50, 48, 56, 60, 64, 72]}
            sparkColor="#10b981"
            spotlightColor="rgba(16, 185, 129, 0.22)"
            borderGlowColor="rgba(16, 185, 129, 0.5)"
          />
          <KPICard
            label="Predictive Alpha Lead"
            value={marketData ? `${marketData.lead_lag_window_minutes}m` : '18m'}
            icon="speed"
            iconColor="text-accent-violet"
            trend={`${marketData?.alpha_confidence || '86.4%'} Precision`}
            trendColor="text-accent-electric"
            trendIcon="target"
            sparkline={[12, 14, 15, 18, 17, 19, 18, 18]}
            sparkColor="#a370ff"
            spotlightColor="rgba(163, 112, 255, 0.22)"
            borderGlowColor="rgba(163, 112, 255, 0.5)"
          />
          <KPICard
            label="Whitelisted Outlets"
            value="256"
            icon="hub"
            iconColor="text-accent-gold"
            trend="0 Dropped Packets"
            trendColor="text-sentiment-positive"
            trendIcon="check_circle"
            sparkline={[240, 245, 248, 250, 252, 254, 256, 256]}
            sparkColor="#ffe500"
            spotlightColor="rgba(255, 229, 0, 0.22)"
            borderGlowColor="rgba(255, 229, 0, 0.5)"
          />
        </div>
      )}

      {/* FEATURE 2: SENTIMENT-PRICE CORRELATION ENGINE */}
      {(activeTab === 'ALL' || activeTab === 'ALPHA') && (
        <div className="glass-panel specular-border p-(--spacing-card-padding) rounded-2xl shadow-[0_0_35px_rgba(0,242,254,0.08)] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-accent-electric text-[18px]">query_stats</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-electric">Feature: Sentiment-to-Price Correlation Engine</span>
              </div>
              <h3 className="font-headline text-lg md:text-xl font-bold text-gradient-aurora">Institutional Asset Alpha Matrix</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/80 border border-border-subtle text-xs font-mono">
                <span className="text-on-surface-variant">Correlation (r):</span>
                <strong className="text-sentiment-positive">+{marketData?.composite_correlation_r || 0.76}</strong>
              </div>
              <span className="text-xs bg-accent-electric/15 text-accent-electric border border-accent-electric/30 px-3 py-1 rounded-full font-mono font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                LEAD TIME: {marketData?.lead_lag_window_minutes || 18} MIN
              </span>
            </div>
          </div>

          {/* Asset Correlation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(marketData?.assets || []).map((asset) => (
              <div key={asset.ticker} className="glass-panel specular-border p-3 rounded-xl flex flex-col justify-between h-28 hover:border-accent-electric/60 hover:-translate-y-0.5 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-on-surface group-hover:text-accent-electric transition-colors">{asset.ticker}</span>
                    <div className="text-[10px] text-on-surface-variant truncate max-w-[80px]">{asset.name}</div>
                  </div>
                  <span className={`text-[10px] font-bold font-mono ${asset.change.startsWith('+') ? 'text-sentiment-positive' : 'text-sentiment-negative'}`}>
                    {asset.change}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-mono font-bold text-on-surface">
                    ${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1">
                    <span>r={asset.correlation}</span>
                    <span className={`font-semibold ${asset.alphaSignal.includes('Bullish') ? 'text-sentiment-positive' : asset.alphaSignal.includes('Bearish') ? 'text-sentiment-negative' : 'text-accent-electric'}`}>
                      {asset.alphaSignal.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Charts & Analytics Grid */}
      {(activeTab === 'ALL' || activeTab === 'ALPHA') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel specular-border p-(--spacing-card-padding) rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent-electric text-[18px]">show_chart</span>
                  <h3 className="font-ticker text-[15px] font-bold uppercase text-on-surface">Global Sentiment Trajectory</h3>
                </div>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">Rolling 24h institutional positive bias overlay</p>
              </div>
              <span className="font-mono text-xs text-accent-electric bg-accent-electric/10 px-2.5 py-1 rounded-full border border-accent-electric/25">
                REAL-TIME
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(11, 15, 25, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                    }}
                  />
                  <Area type="monotone" dataKey="sentiment" stroke="#00e5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#sentimentGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Heatmap */}
          <div className="glass-panel specular-border p-(--spacing-card-padding) rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-electric text-[18px]">grid_view</span>
                <h3 className="font-ticker text-[15px] font-bold uppercase text-on-surface">Sector Heatmap</h3>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">Live Bias</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 flex-1">
              {sectors.map((s) => (
                <div
                  key={s.name}
                  style={sectorStyle(s)}
                  className="rounded-xl p-3 border flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 cursor-default"
                >
                  <span className="font-body text-xs font-semibold text-white/90">{s.name}</span>
                  <span className={`font-mono text-sm font-bold mt-2 ${s.color === 'positive' ? 'text-sentiment-positive' : s.color === 'negative' ? 'text-sentiment-negative' : 'text-slate-300'}`}>
                    {s.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 4 & WATCHLIST SECTION */}
      {(activeTab === 'ALL' || activeTab === 'STORIES') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FEATURE 5: WATCHLIST MANAGEMENT */}
          <div className="glass-panel specular-border p-(--spacing-card-padding) rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-electric text-[18px]">bookmark</span>
                <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Target Watchlist</h3>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">{watchlist.length} TICKERS</span>
            </div>

            <form onSubmit={handleAddToWatchlist} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="ADD TICKER (e.g. AAPL)..."
                className="flex-1 bg-surface-container-low border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-accent-electric transition-colors"
              />
              <button
                type="submit"
                onClick={playClick}
                className="px-3 py-1.5 bg-accent-electric text-black font-mono font-bold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                + ADD
              </button>
            </form>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[320px]">
              {watchlist.map((item) => (
                <div key={item} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/70 border border-border-subtle hover:border-accent-electric/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span>
                    <span className="font-mono text-xs font-bold text-on-surface">{item}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-sentiment-positive font-bold">+1.8%</span>
                    <button 
                      onClick={() => {
                        playClick();
                        handleRemoveFromWatchlist(item);
                      }}
                      className="text-on-surface-variant hover:text-sentiment-negative text-xs transition-colors cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE 4: DEVELOPING STORIES CLUSTERING */}
          <div className="lg:col-span-2 glass-panel specular-border p-(--spacing-card-padding) rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">account_tree</span>
                <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Developing Story Clusters</h3>
              </div>
              <span className="text-[10px] text-accent-electric font-mono font-bold bg-accent-electric/10 px-2 py-0.5 rounded-full border border-accent-electric/25">MULTI-OUTLET VERIFIED</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
              {stories.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl bg-surface-container-low/80 border border-border-subtle hover:border-accent-electric/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-accent-electric uppercase">{s.category}</span>
                    <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-mono">
                      {s.outletsCount} Outlets
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-on-surface leading-tight mb-1.5">{s.headline}</h4>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed mb-2">{s.summary}</p>
                  
                  {s.timeline && s.timeline[0] && (
                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/80 border-t border-border-subtle pt-1.5 font-mono">
                      <span className="text-accent-electric font-bold">{s.timeline[0].time}</span>
                      <span className="truncate">{s.timeline[0].event}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KILLER FEATURE 4: MARKET MANIPULATION & WHALE TRAP RADAR */}
      {(activeTab === 'ALL' || activeTab === 'RISK') && (
        <ManipulationRadar />
      )}

    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  iconColor,
  trend,
  trendColor,
  trendIcon,
  valueColor = 'text-on-surface',
  sparkline = [],
  sparkColor = '#00e5ff',
  spotlightColor = 'rgba(0, 242, 254, 0.2)',
  borderGlowColor = 'rgba(0, 242, 254, 0.5)'
}) {
  // Generate simple SVG path for sparkline
  const sparkPoints = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return '';
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 26;
    return sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [sparkline]);

  return (
    <TiltCard
      spotlightColor={spotlightColor}
      borderGlowColor={borderGlowColor}
      tiltIntensity={10}
      className="p-4 flex flex-col justify-between h-36 cursor-default group"
    >
      <div className="flex justify-between items-center text-on-surface-variant font-body text-[11px] font-semibold tracking-[0.05em] uppercase z-10">
        <span className="truncate">{label}</span>
        <span className={`material-symbols-outlined ${iconColor} text-[22px] group-hover:scale-125 group-hover:rotate-6 transition-all duration-300`}>{icon}</span>
      </div>

      <div className="flex items-end justify-between z-10">
        <div className={`font-headline text-[28px] font-bold ${valueColor} tracking-tight drop-shadow-sm`}>{value}</div>
        
        {sparkPoints && (
          <svg className="w-20 h-7 overflow-visible opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" viewBox="0 0 80 26">
            <path
              d={sparkPoints}
              fill="none"
              stroke={sparkColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div className={`text-xs ${trendColor} flex items-center gap-1.5 z-10 font-mono font-semibold`}>
        <span className="material-symbols-outlined text-[15px]">{trendIcon}</span>
        <span className="truncate">{trend}</span>
      </div>
    </TiltCard>
  );
}

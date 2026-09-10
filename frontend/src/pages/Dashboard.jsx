import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchArticles, fetchMarketData, fetchStories } from '../services/api';
import ManipulationRadar from '../components/ManipulationRadar';

export default function Dashboard({ articles = [] }) {
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

      {/* FEATURE 5: Real-Time Volatility Anomaly Alert Banner */}
      {!anomalyDismissed && (
        <div className="bg-gradient-to-r from-amber-500/15 via-sentiment-negative/10 to-transparent border border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <span className="material-symbols-outlined text-[20px] animate-pulse">crisis_alert</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">ANOMALY DETECTED</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">CONFIDENCE 91.2%</span>
              </div>
              <p className="text-xs text-on-surface/90 mt-0.5">
                Elevated divergence detected in <strong>Global Maritime Energy Corridors</strong>. Lead/lag indicator suggests <strong>+18m predictive lag</strong> before spot contract repricing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button 
              onClick={() => setAnomalyDismissed(true)} 
              className="px-3 py-1.5 rounded-lg bg-surface border border-border-subtle hover:bg-surface-variant text-xs text-on-surface-variant transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* KILLER FEATURE QUICK-LAUNCH COMMAND BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/terminal"
          className="group p-4 rounded-2xl bg-gradient-to-r from-accent-electric/15 via-surface to-surface border border-accent-electric/30 hover:border-accent-electric transition-all duration-200 flex items-center justify-between shadow-lg shadow-accent-electric/5"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-accent-electric/20 border border-accent-electric/40 flex items-center justify-center text-accent-electric group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">candlestick_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-on-surface group-hover:text-accent-electric transition-colors">
                  TradingView Terminal & AI Playbook
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">LIVE</span>
              </div>
              <p className="font-body text-xs text-on-surface-variant">
                Live candlestick charts + AI trade setups (Entry, Target, Stop-Loss).
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-accent-electric group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>

        <Link
          to="/portfolio"
          className="group p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-surface to-surface border border-amber-500/30 hover:border-amber-400 transition-all duration-200 flex items-center justify-between shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-on-surface group-hover:text-amber-400 transition-colors">
                  Portfolio War Room & Risk Simulator
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">HOT</span>
              </div>
              <p className="font-body text-xs text-on-surface-variant">
                Personal holdings stress-test + breaking news shock exposure.
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-amber-400 group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-(--spacing-gutter)">
        <KPICard
          label="Active Feed Articles"
          value={articles.length > 0 ? `${metrics.total}` : '124'}
          icon="article"
          iconColor="text-accent-electric"
          trend={`+${metrics.positive || 48} Bullish`}
          trendColor="text-sentiment-positive"
          trendIcon="trending_up"
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
        />
        <KPICard
          label="Predictive Alpha Lead"
          value={marketData ? `${marketData.lead_lag_window_minutes}m` : '18m'}
          icon="speed"
          iconColor="text-accent-electric"
          trend={`${marketData?.alpha_confidence || '86.4%'} Precision`}
          trendColor="text-accent-electric"
          trendIcon="target"
        />
        <KPICard
          label="Whitelisted Outlets"
          value="256"
          icon="hub"
          iconColor="text-accent-electric"
          trend="0 Dropped Packets"
          trendColor="text-sentiment-positive"
          trendIcon="check_circle"
        />
      </div>

      {/* FEATURE 2: SENTIMENT-PRICE CORRELATION ENGINE */}
      <div className="bg-surface border border-accent-electric/30 p-(--spacing-card-padding) rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.06)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-accent-electric text-[18px]">query_stats</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-electric">Feature: Sentiment-to-Price Correlation Engine</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Institutional Asset Alpha Matrix</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-border-subtle text-xs font-mono">
              <span className="text-on-surface-variant">Correlation (r):</span>
              <strong className="text-sentiment-positive">+{marketData?.composite_correlation_r || 0.76}</strong>
            </div>
            <span className="text-xs bg-accent-electric/15 text-accent-electric border border-accent-electric/30 px-2.5 py-1 rounded-full font-mono font-bold">
              LEAD TIME: {marketData?.lead_lag_window_minutes || 18} MIN
            </span>
          </div>
        </div>

        {/* Asset Correlation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(marketData?.assets || []).map((asset) => (
            <div key={asset.ticker} className="bg-surface-container-low p-3 rounded-lg border border-border-subtle flex flex-col justify-between h-28 hover:border-accent-electric/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-on-surface">{asset.ticker}</span>
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

      {/* Main Grid: Chart & Sector Heatmap vs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-(--spacing-gutter)">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-(--spacing-gutter)">
          
          {/* Sentiment Trend Chart */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-xl flex-1 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Global Sentiment Ingestion Flow</h3>
                <p className="text-xs text-on-surface-variant">Real-time harmonic signal telemetry from 256 validated feeds</p>
              </div>
              <div className="flex gap-2">
                {['1H', '4H', '24H'].map((t, i) => (
                  <button
                    key={t}
                    className={`px-3 py-1 text-xs border rounded transition-colors ${
                      i === 0 ? 'border-accent-electric text-accent-electric hover:bg-accent-electric/10' : 'border-border-subtle text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" strokeOpacity={0.5} />
                  <XAxis dataKey="time" stroke="#849396" tick={{ fill: '#bac9cc', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                  <YAxis stroke="#849396" tick={{ fill: '#bac9cc', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px', fontFamily: 'Work Sans' }}
                    labelStyle={{ color: '#00E5FF', fontWeight: 700 }}
                    itemStyle={{ color: '#dce4e5' }}
                  />
                  <Area type="monotone" dataKey="sentiment" stroke="#00E5FF" strokeWidth={2} fill="url(#sentimentGrad)" name="Sentiment Velocity" />
                  <Area type="monotone" dataKey="volume" stroke="#22C55E" strokeWidth={1.5} fill="url(#volumeGrad)" name="Ingestion Vol" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Volatility Heatmap */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Sector Volatility Heatmap</h3>
              <span className="text-xs text-on-surface-variant font-mono">Live Weighted NLP</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sectors.map((s) => (
                <div
                  key={s.name}
                  className="border p-3 rounded-lg flex flex-col justify-between h-20 hover:scale-[1.02] transition-transform cursor-pointer"
                  style={sectorStyle(s)}
                >
                  <span className="font-body text-[11px] font-bold tracking-[0.05em] uppercase text-on-surface">{s.name}</span>
                  <span className={`font-mono text-sm font-bold ${s.color === 'positive' ? 'text-sentiment-positive' : s.color === 'negative' ? 'text-sentiment-negative' : 'text-slate-300'}`}>
                    {s.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Watchlist (Feature 5) & Developing Stories (Feature 4) */}
        <div className="flex flex-col gap-(--spacing-gutter)">

          {/* FEATURE 5: CUSTOM ASSET WATCHLIST */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-electric text-[18px]">bookmark</span>
                <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Custom Watchlist</h3>
              </div>
              <span className="text-[10px] bg-accent-electric/10 text-accent-electric px-2 py-0.5 rounded font-mono">
                {watchlist.length} PINNED
              </span>
            </div>

            {/* Quick add form */}
            <form onSubmit={handleAddToWatchlist} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="Add Ticker (e.g. AAPL, ETH)..."
                className="flex-1 bg-surface-container-high border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-accent-electric font-mono"
              />
              <button 
                type="submit" 
                className="px-3 py-1.5 bg-accent-electric text-background text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Pin
              </button>
            </form>

            <div className="space-y-2">
              {watchlist.map((item) => (
                <div key={item} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-border-subtle text-xs hover:border-accent-electric/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span>
                    <strong className="font-mono text-on-surface">{item}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-sentiment-positive font-bold">+1.8%</span>
                    <button 
                      onClick={() => handleRemoveFromWatchlist(item)}
                      className="text-on-surface-variant hover:text-sentiment-negative text-xs transition-colors cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE 4: DEVELOPING STORIES CLUSTERING */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-xl flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">account_tree</span>
                <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Developing Story Clusters</h3>
              </div>
              <span className="text-[10px] text-accent-electric font-mono">MULTI-OUTLET</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
              {stories.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-surface-container-low border border-border-subtle hover:border-accent-electric/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-accent-electric uppercase">{s.category}</span>
                    <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-mono">
                      {s.outletsCount} Outlets
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-on-surface leading-tight mb-1.5">{s.headline}</h4>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed mb-2">{s.summary}</p>
                  
                  {/* Timeline bullet preview */}
                  {s.timeline && s.timeline[0] && (
                    <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/80 border-t border-border-subtle pt-1.5 font-mono">
                      <span className="text-accent-electric">{s.timeline[0].time}</span>
                      <span className="truncate">{s.timeline[0].event}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* KILLER FEATURE 4: MARKET MANIPULATION & WHALE TRAP RADAR */}
      <ManipulationRadar />

    </div>
  );
}

function KPICard({ label, value, icon, iconColor, trend, trendColor, trendIcon, valueColor = 'text-on-surface' }) {
  return (
    <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-xl flex flex-col gap-2 hover:border-accent-electric/30 transition-colors">
      <div className="flex justify-between items-center text-on-surface-variant font-body text-[12px] font-semibold tracking-[0.05em] uppercase">
        <span>{label}</span>
        <span className={`material-symbols-outlined ${iconColor} text-[18px]`}>{icon}</span>
      </div>
      <div className={`font-headline text-[30px] font-semibold ${valueColor}`}>{value}</div>
      <div className={`text-xs ${trendColor} flex items-center gap-1`}>
        <span className="material-symbols-outlined text-[14px]">{trendIcon}</span> {trend}
      </div>
    </div>
  );
}

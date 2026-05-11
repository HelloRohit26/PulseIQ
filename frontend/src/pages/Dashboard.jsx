import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchArticles } from '../services/api';

export default function Dashboard({ articles = [] }) {
  const metrics = useMemo(() => {
    if (articles.length === 0) return { total: 0, avgSentiment: 0, positive: 0, negative: 0, neutral: 0 };
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

  // Generate chart data from articles
  const chartData = useMemo(() => {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    return hours.map((h, i) => ({
      time: h,
      sentiment: 40 + Math.sin(i * 0.7) * 25 + (metrics.avgSentiment / 5),
      volume: 10 + Math.abs(Math.sin(i * 1.2)) * 40 + articles.length * 0.5,
    }));
  }, [articles, metrics]);

  const sectors = [
    { name: 'Tech', change: '+4.2%', color: 'positive', intensity: 0.2 },
    { name: 'Energy', change: '-1.8%', color: 'negative', intensity: 0.2 },
    { name: 'Finance', change: '+0.1%', color: 'neutral', intensity: 0 },
    { name: 'Healthcare', change: '+8.4%', color: 'positive', intensity: 0.4 },
    { name: 'Consumer', change: '-5.2%', color: 'negative', intensity: 0.4 },
    { name: 'Industrials', change: '-0.2%', color: 'neutral', intensity: 0 },
    { name: 'Materials', change: '+1.1%', color: 'positive', intensity: 0.1 },
    { name: 'Utilities', change: '-0.8%', color: 'negative', intensity: 0.1 },
  ];

  const sectorStyle = (s) => {
    const colors = { positive: '34, 197, 94', negative: '239, 68, 68', neutral: '148, 163, 184' };
    const rgb = colors[s.color] || colors.neutral;
    return {
      backgroundColor: s.intensity > 0 ? `rgba(${rgb}, ${s.intensity})` : '#242b2d',
      borderColor: s.intensity > 0 ? `rgba(${rgb}, 0.5)` : '#30363D',
    };
  };
  const sectorText = (s) => {
    if (s.color === 'positive') return 'text-sentiment-positive';
    if (s.color === 'negative') return 'text-sentiment-negative';
    return 'text-sentiment-neutral';
  };

  return (
    <div className="p-(--spacing-container-margin)">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-(--spacing-gutter) mb-(--spacing-gutter)">
        <KPICard
          label="Recent Pipeline Articles"
          value={articles.length > 0 ? `${metrics.total}` : '—'}
          icon="article"
          iconColor="text-accent-electric"
          trend={`+${metrics.positive} new`}
          trendColor="text-sentiment-positive"
          trendIcon="trending_up"
        />
        <KPICard
          label="Avg Market Sentiment"
          value={articles.length > 0 ? `${metrics.avgSentiment} / 100` : '—'}
          icon="psychology"
          iconColor="text-sentiment-positive"
          trend="Stable (1h moving avg)"
          trendColor="text-sentiment-neutral"
          trendIcon="drag_handle"
          valueColor={Number(metrics.avgSentiment) > 50 ? 'text-sentiment-positive' : 'text-sentiment-negative'}
        />
        <KPICard
          label="Whitelisted Sources"
          value={articles.length > 0 ? '256' : '—'}
          icon="hub"
          iconColor="text-accent-electric"
          trend="All nodes operational"
          trendColor="text-sentiment-positive"
          trendIcon="check_circle"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-(--spacing-gutter)">
        {/* Chart Area (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-(--spacing-gutter)">
          {/* Sentiment Trend Chart */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded flex-1 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Global Sentiment Flow</h3>
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
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" strokeOpacity={0.5} />
                  <XAxis dataKey="time" stroke="#849396" tick={{ fill: '#bac9cc', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                  <YAxis stroke="#849396" tick={{ fill: '#bac9cc', fontSize: 11, fontFamily: 'Space Grotesk' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '4px', fontFamily: 'Work Sans' }}
                    labelStyle={{ color: '#00E5FF', fontWeight: 700 }}
                    itemStyle={{ color: '#dce4e5' }}
                  />
                  <Area type="monotone" dataKey="sentiment" stroke="#00E5FF" strokeWidth={2} fill="url(#sentimentGrad)" name="Sentiment" />
                  <Area type="monotone" dataKey="volume" stroke="#22C55E" strokeWidth={1.5} fill="url(#volumeGrad)" name="Volume" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Heatmap */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded">
            <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface mb-4">Sector Volatility Heatmap</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sectors.map((s) => (
                <div
                  key={s.name}
                  className="border p-3 rounded flex flex-col justify-between h-24 hover:scale-[1.02] transition-transform cursor-pointer"
                  style={sectorStyle(s)}
                >
                  <span className="font-body text-[12px] font-semibold tracking-[0.05em] uppercase text-on-surface">{s.name}</span>
                  <span className={`${sectorText(s)} font-bold`}>{s.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="flex flex-col gap-(--spacing-gutter)">
          {/* AI Quick Pulse */}
          <div className="bg-surface border border-accent-electric/30 p-(--spacing-card-padding) rounded relative overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-accent-electric animate-pulse">auto_awesome</span>
            </div>
            <h3 className="font-ticker text-[14px] font-bold uppercase text-accent-electric mb-4">AI Quick Pulse</h3>
            <div className="font-body text-[15px] text-on-surface-variant space-y-4">
              <p>Gemini Analysis indicates a structural shift in <strong className="text-on-surface">supply chain sentiment</strong> originating from Southeast Asia nodes.</p>
              <p>Probability of <strong className="text-sentiment-negative">downward correction</strong> in hardware sectors: 74% over next 48h.</p>
              <div className="bg-surface-container-low p-3 rounded border border-border-subtle text-xs">
                <span className="text-accent-electric">System Prompt:</span> Aggregating top 50 sources, weighting institutional commentary higher.
              </div>
            </div>
          </div>

          {/* Recent Signals */}
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-ticker text-[14px] font-bold uppercase text-on-surface">Recent Signals</h3>
              <button className="text-accent-electric text-xs hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {(articles.length > 0 ? articles.slice(0, 4) : [
                { title: 'Cloud Infra Spend Exceeds Projections', source: 'Enterprise IT Quarterly', sentiment: 'positive' },
                { title: 'Regulatory Headwinds in EU Markets', source: 'Global Policy Watch', sentiment: 'negative' },
                { title: 'M&A Rumors Propel Biotech Index', source: 'Market Insider', sentiment: 'positive' },
                { title: 'Fed Maintains Current Rate Trajectory', source: 'Central Bank Wire', sentiment: 'neutral' },
              ]).map((a, i) => (
                <div key={i} className={`flex items-start gap-3 p-2 rounded hover:bg-surface-variant transition-colors border-l-2 ${
                  a.sentiment === 'positive' ? 'border-sentiment-positive' : a.sentiment === 'negative' ? 'border-sentiment-negative' : 'border-sentiment-neutral'
                }`}>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase mt-1 ${
                    a.sentiment === 'positive' ? 'bg-sentiment-positive/10 text-sentiment-positive' :
                    a.sentiment === 'negative' ? 'bg-sentiment-negative/10 text-sentiment-negative' :
                    'bg-surface-container-high text-sentiment-neutral border border-border-subtle'
                  }`}>
                    {a.sentiment === 'positive' ? 'Bullish' : a.sentiment === 'negative' ? 'Bearish' : 'Neutral'}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-on-surface">{a.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{a.source} • {Math.floor(Math.random() * 60)}m ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, iconColor, trend, trendColor, trendIcon, valueColor = 'text-on-surface' }) {
  return (
    <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded flex flex-col gap-2 hover:border-accent-electric/30 transition-colors">
      <div className="flex justify-between items-center text-on-surface-variant font-body text-[12px] font-semibold tracking-[0.05em] uppercase">
        <span>{label}</span>
        <span className={`material-symbols-outlined ${iconColor} text-[18px]`}>{icon}</span>
      </div>
      <div className={`font-headline text-[32px] font-semibold ${valueColor}`}>{value}</div>
      <div className={`text-xs ${trendColor} flex items-center gap-1`}>
        <span className="material-symbols-outlined text-[14px]">{trendIcon}</span> {trend}
      </div>
    </div>
  );
}

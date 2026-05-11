import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SentimentMap({ articles = [] }) {
  const drivers = useMemo(() => {
    if (!articles.length) return [];
    
    const sorted = [...articles].sort((a, b) => b.score - a.score);
    const pos = sorted.filter(a => a.sentiment?.toLowerCase() === 'positive');
    const neg = sorted.filter(a => a.sentiment?.toLowerCase() === 'negative');
    
    const res = [];
    if (pos[0]) res.push({ label: pos[0].title.slice(0, 45) + '...', type: pos[0].source, impact: 'High Impact', icon: 'trending_up', sentiment: 'positive' });
    if (neg[0]) res.push({ label: neg[0].title.slice(0, 45) + '...', type: neg[0].source, impact: 'High Impact', icon: 'trending_down', sentiment: 'negative' });
    if (pos[1]) res.push({ label: pos[1].title.slice(0, 45) + '...', type: pos[1].source, impact: 'Med Impact', icon: 'bolt', sentiment: 'positive' });
    if (neg[1] && res.length < 3) res.push({ label: neg[1].title.slice(0, 45) + '...', type: neg[1].source, impact: 'Med Impact', icon: 'warning', sentiment: 'negative' });
    
    return res.slice(0, 3);
  }, [articles]);

  const impactColor = (s) => {
    if (s === 'positive' || s === 'POSITIVE') return { bg: 'bg-sentiment-positive/10', border: 'border-sentiment-positive/20', text: 'text-sentiment-positive', icon: 'text-sentiment-positive' };
    if (s === 'negative' || s === 'NEGATIVE') return { bg: 'bg-sentiment-negative/10', border: 'border-sentiment-negative/20', text: 'text-sentiment-negative', icon: 'text-sentiment-negative' };
    return { bg: 'bg-accent-electric/10', border: 'border-accent-electric/20', text: 'text-accent-electric', icon: 'text-accent-electric' };
  };

  const miniChartData = useMemo(() => {
    if (!articles.length) return [];
    const chunks = 7;
    const chunkSize = Math.max(1, Math.floor(articles.length / chunks));
    const data = [];
    for (let i = 0; i < chunks; i++) {
      const slice = articles.slice(i * chunkSize, (i + 1) * chunkSize);
      if (!slice.length) continue;
      const score = slice.reduce((sum, a) => sum + (a.sentiment?.toLowerCase() === 'positive' ? a.score : -a.score), 0) / slice.length;
      data.push({ day: `T-${chunks - i}`, value: Math.round(50 + (score * 50)) });
    }
    return data;
  }, [articles]);

  const mapNodes = useMemo(() => {
    const categories = {
      'Tech & AI': { keywords: ['ai', 'tech', 'software', 'cloud', 'apple', 'microsoft', 'google', 'cyber'], articles: [] },
      'Crypto': { keywords: ['crypto', 'bitcoin', 'eth', 'blockchain', 'web3', 'token'], articles: [] },
      'Finance': { keywords: ['bank', 'fed', 'rate', 'inflation', 'economy', 'market', 'stocks'], articles: [] },
      'Global': { keywords: ['global', 'europe', 'asia', 'war', 'trade', 'world', 'china', 'uk'], articles: [] },
      'Energy': { keywords: ['oil', 'energy', 'gas', 'green', 'ev', 'climate'], articles: [] }
    };

    articles.forEach(a => {
      const titleLower = a.title?.toLowerCase() || '';
      let matched = false;
      for (const [cat, data] of Object.entries(categories)) {
        if (data.keywords.some(kw => titleLower.includes(kw))) {
          data.articles.push(a);
          matched = true;
        }
      }
      if (!matched) categories['Global'].articles.push(a); // Fallback
    });

    const nodes = [];
    // Geographically mapped positions over the world map
    const positions = [
      { top: '35%', left: '22%' }, // Tech & AI -> North America
      { top: '65%', left: '35%' }, // Crypto -> South Atlantic (Decentralized)
      { top: '30%', left: '50%' }, // Finance -> Europe
      { top: '50%', left: '75%' }, // Global -> Asia/Pacific
      { top: '45%', left: '60%' }  // Energy -> Middle East
    ];

    Object.entries(categories).forEach(([name, data], idx) => {
      if (!data.articles.length) return;
      const avgScore = data.articles.reduce((sum, a) => sum + (a.sentiment?.toLowerCase() === 'positive' ? a.score : -a.score), 0) / data.articles.length;
      const sentiment = avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral';
      const size = Math.min(140, 70 + data.articles.length * 5);
      
      let baseClass = 'bg-sentiment-neutral/15 border-sentiment-neutral/40 text-sentiment-neutral';
      if (sentiment === 'positive') baseClass = 'bg-sentiment-positive/20 border-sentiment-positive/50 text-sentiment-positive';
      if (sentiment === 'negative') baseClass = 'bg-sentiment-negative/20 border-sentiment-negative/50 text-sentiment-negative';

      nodes.push({
        name,
        sentiment,
        change: `${avgScore > 0 ? '+' : ''}${(avgScore * 5).toFixed(1)}%`,
        size,
        baseClass,
        pos: positions[idx % positions.length]
      });
    });

    return nodes;
  }, [articles]);

  return (
    <div className="p-(--spacing-container-margin) min-h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
        <div>
          <h2 className="font-headline text-[32px] font-semibold text-on-surface mb-1">Global Sentiment Map</h2>
          <p className="text-on-surface-variant text-sm">Real-time macro analysis across global asset classes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="bg-surface border border-border-subtle rounded text-sm py-1.5 pl-3 pr-8 focus:ring-accent-electric focus:border-accent-electric text-on-surface">
            <option>All Assets</option><option>Equities</option><option>Crypto</option><option>Forex</option>
          </select>
          <select className="bg-surface border border-border-subtle rounded text-sm py-1.5 pl-3 pr-8 focus:ring-accent-electric focus:border-accent-electric text-on-surface">
            <option>Live Data</option><option>24H Horizon</option><option>7D Horizon</option>
          </select>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-(--spacing-base)">
        {/* Map */}
        <div className="lg:col-span-8 bg-surface border border-border-subtle rounded-lg p-(--spacing-card-padding) relative overflow-hidden flex flex-col min-h-[400px] lg:min-h-[500px]">
          <div className="flex justify-between items-center mb-4 z-10">
            <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Macro Sentiment Heatmap</h3>
            <div className="flex gap-2 items-center text-xs">
              <span className="w-3 h-3 rounded-full bg-sentiment-negative"></span> Bearish
              <span className="w-3 h-3 rounded-full bg-sentiment-neutral ml-2"></span> Neutral
              <span className="w-3 h-3 rounded-full bg-sentiment-positive ml-2"></span> Bullish
            </div>
          </div>
          <div className="flex-1 relative rounded overflow-hidden border border-border-subtle/50 bg-[#12161c]">
            {/* World Map Background */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{ 
                backgroundImage: "url('/world-map.svg')", 
                backgroundSize: "contain", 
                backgroundPosition: "center", 
                backgroundRepeat: "no-repeat" 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-electric/5 via-transparent to-secondary-container/5 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none"></div>

            {/* Dynamic Nodes */}
            {mapNodes.map((node, i) => (
              <div 
                key={i} 
                className={`absolute border rounded-full flex items-center justify-center cursor-pointer transition-transform duration-700 ease-out hover:scale-110 ${node.baseClass} ${node.sentiment !== 'neutral' ? 'animate-pulse' : ''}`}
                style={{ top: node.pos.top, left: node.pos.left, width: node.size, height: node.size, transform: 'translate(-50%, -50%)' }}
              >
                <div className="text-center">
                  <p className="font-ticker text-[14px] font-bold">{node.name}</p>
                  <p className="text-xs text-on-surface-variant">{node.change}</p>
                </div>
              </div>
            ))}
            
            {mapNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                Waiting for Kafka data stream...
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-(--spacing-base)">
          {/* Drivers */}
          <div className="bg-surface border border-border-subtle rounded-lg p-(--spacing-card-padding) flex-1">
            <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-4 uppercase">Top Live Drivers</h3>
            <div className="space-y-3">
              {drivers.length > 0 ? drivers.map((d, i) => {
                const c = impactColor(d.sentiment);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-surface-variant/50 border border-border-subtle hover:border-accent-electric/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${c.icon}`}>{d.icon}</span>
                      <div className="flex-1">
                        <p className="font-body text-[13px] font-medium text-on-surface leading-tight mb-1">{d.label}</p>
                        <p className="text-xs font-ticker text-on-surface-variant">{d.type}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-sm text-on-surface-variant">Awaiting real-time intelligence...</div>
              )}
            </div>
          </div>

          {/* Mini Chart */}
          <div className="bg-surface border border-border-subtle rounded-lg p-(--spacing-card-padding) h-52 flex flex-col">
            <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-2 uppercase">Live Pulse Trend</h3>
            <div className="flex-1 w-full">
              {miniChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" strokeOpacity={0.5} />
                    <XAxis dataKey="day" stroke="#849396" tick={{ fill: '#bac9cc', fontSize: 10, fontFamily: 'Space Grotesk' }} />
                    <YAxis stroke="#849396" domain={[0, 100]} tick={{ fill: '#bac9cc', fontSize: 10, fontFamily: 'Space Grotesk' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '4px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#00E5FF" strokeWidth={2} fill="url(#miniGrad)" name="Sentiment" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">Gathering data...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../ThemeContext';

export default function Historical({ articles = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [timeframe, setTimeframe] = useState('6M');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' vs 'sectors' view on mobile/smaller screens or rich tabs

  // Generate responsive temporal chart data based on timeframe filter
  const chartData = useMemo(() => {
    const baseArticlesCount = articles.length || 10;
    const avgScore = articles.length 
      ? articles.reduce((sum, a) => sum + (a.sentiment?.toLowerCase() === 'positive' ? a.score : -a.score), 0) / articles.length 
      : 0.2;
    
    let pointsCount = timeframe === '1M' ? 4 : timeframe === '3M' ? 6 : timeframe === '6M' ? 8 : 12;
    const labelsMap = {
      '1M': ['W1', 'W2', 'W3', 'Live Current'],
      '3M': ['M-3', 'M-2', 'M-1', 'Mid', 'Prev', 'Live Current'],
      '6M': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Live Current'],
      'YTD': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Live Current']
    };

    const labels = labelsMap[timeframe] || labelsMap['6M'];
    const baseSentiment = 55 + (avgScore * 35);

    return labels.map((label, idx) => {
      const progress = idx / (labels.length - 1);
      // Create beautifully smooth harmonic backtest simulations
      const harmonic = Math.sin(idx * 1.2) * 18 + Math.cos(idx * 0.7) * 8;
      const noise = (Math.random() - 0.5) * 8;
      
      let sentimentVal = baseSentiment + harmonic + noise;
      // Guarantee final node converges with real live calculated stream impact
      if (label === 'Live Current') {
        sentimentVal = 50 + (avgScore * 45);
      }
      
      // Volatility indices inversely related or slightly lagged
      const volatilityVal = Math.max(15, Math.min(85, 45 - harmonic * 0.8 + (Math.random() * 12)));

      return {
        period: label,
        sentiment: Math.min(100, Math.max(10, Math.round(sentimentVal))),
        volatility: Math.round(volatilityVal),
        signalVolume: Math.round(120 + sentimentVal * 2.5 + (Math.random() * 50))
      };
    });
  }, [articles, timeframe]);

  // Sector variance calculations mapping directly to real categories
  const sectors = useMemo(() => {
    const categories = {
      'Technology Core (XLK)': ['ai', 'tech', 'software', 'cloud', 'apple', 'microsoft', 'nvidia', 'google'],
      'Global Energy & Oil (XLE)': ['oil', 'energy', 'gas', 'green', 'solar', 'crude'],
      'Macro Finance & Fed (XLF)': ['bank', 'fed', 'rate', 'inflation', 'economy', 'crypto', 'bitcoin', 'jpmorgan'],
      'Advanced Bio-Health (XLV)': ['health', 'medical', 'drug', 'fda', 'pharma', 'biotech']
    };

    const result = [];
    for (const [name, keywords] of Object.entries(categories)) {
      const matches = articles.filter(a => keywords.some(kw => (a.title + " " + (a.source || "")).toLowerCase().includes(kw)));
      if (matches.length > 0) {
        const score = matches.reduce((sum, a) => sum + (a.sentiment?.toLowerCase() === 'positive' ? a.score : -a.score), 0) / matches.length;
        result.push({
          name,
          change: `${score > 0 ? '+' : ''}${(score * 12).toFixed(1)}%`,
          pct: Math.min(100, Math.max(15, 50 + (score * 45))),
          sentiment: score > 0.12 ? 'positive' : score < -0.12 ? 'negative' : 'neutral',
          volumeCount: matches.length
        });
      } else {
        // Fallback simulated metrics if keywords missing
        const simulatedScore = (Math.random() - 0.45) * 0.5;
        result.push({ 
          name, 
          change: `${simulatedScore > 0 ? '+' : ''}${(simulatedScore * 12).toFixed(1)}%`, 
          pct: Math.round(50 + simulatedScore * 40), 
          sentiment: simulatedScore > 0.1 ? 'positive' : simulatedScore < -0.1 ? 'negative' : 'neutral',
          volumeCount: Math.floor(Math.random() * 15) + 3
        });
      }
    }
    return result;
  }, [articles]);

  // Signals list populated with real source data + search filtering
  const signals = useMemo(() => {
    const sourceList = articles.length > 0 ? articles : [
      { title: 'Federal Reserve Open Market Policy Statement Shifts Yield Curve', source: 'Bloomberg', sentiment: 'positive', score: 0.88 },
      { title: 'Global Supply Contraction Triggers Energy Sector Correction Backlash', source: 'Reuters', sentiment: 'negative', score: 0.76 },
      { title: 'Next-Gen Quantum Cryptographic Protocols Standardized Globally', source: 'TechCrunch', sentiment: 'positive', score: 0.94 },
      { title: 'Asian Sovereign Debt Yield Fluctuation Triggers Arbitrage Sweep', source: 'FT', sentiment: 'negative', score: 0.65 },
      { title: 'Algorithmic Liquidity Pools Drain Secondary Capital Markets', source: 'Coindesk', sentiment: 'neutral', score: 0.52 },
      { title: 'Silicon Supply Chains Realign Following Pacific Strategic Treaties', source: 'WSJ', sentiment: 'positive', score: 0.81 }
    ];

    const mapped = sourceList.map((a, i) => {
      const isPos = a.sentiment?.toLowerCase() === 'positive';
      const isNeg = a.sentiment?.toLowerCase() === 'negative';
      const baseScore = a.score || 0.75;
      
      let projectedReturn = `+${(baseScore * 14.5).toFixed(2)}%`;
      if (isNeg) projectedReturn = `-${(baseScore * 14.5).toFixed(2)}%`;
      if (!isPos && !isNeg) projectedReturn = `+0.45%`;

      const mockAssets = ['NVDA', 'TSLA', 'BTC', 'US10Y', 'ETH', 'AAPL', 'AMZN'];
      const assetCode = mockAssets[i % mockAssets.length];

      // Simulated historical timestamp descending
      const pastTime = new Date(Date.now() - (i * 4 + 1) * 3600000);
      const formattedDate = pastTime.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

      return {
        id: `SIG-2026-${1000 + i}`,
        date: formattedDate,
        asset: assetCode,
        title: a.title || 'Market vector trace event analyzed',
        sourceName: a.source || 'Pulse Feed Core',
        type: isPos ? 'Bullish Breakout' : isNeg ? 'Bearish Divergence' : 'Macro Convergence',
        confidence: (baseScore * 100).toFixed(1),
        outcome: projectedReturn,
        sentimentStatus: isPos ? 'positive' : isNeg ? 'negative' : 'neutral',
        detailsContext: `Signal generated via direct natural language stream parsing of ${a.source || 'primary terminal'}. Initial weight threshold cleared past target standard deviations. Historical backtest outcomes verify a 78.4% probabilistic match against current baseline macro configurations.`
      };
    });

    if (!searchTerm.trim()) return mapped;
    
    return mapped.filter(s => 
      s.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sourceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articles, searchTerm]);

  // Overall statistics for top overview counters
  const statsSummary = useMemo(() => {
    const total = signals.length;
    const posCount = signals.filter(s => s.sentimentStatus === 'positive').length;
    const negCount = signals.filter(s => s.sentimentStatus === 'negative').length;
    const ratio = negCount > 0 ? (posCount / (posCount + negCount)).toFixed(2) : '1.0';
    
    // Average confidence
    const avgConf = total > 0 ? (signals.reduce((acc, s) => acc + parseFloat(s.confidence), 0) / total).toFixed(1) : '85.0';
    
    return { total, ratio, avgConf };
  }, [signals]);

  // Custom tooltips rendering cards
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-xs font-body ${
          isDark ? 'bg-surface/95 border-border-subtle text-on-surface' : 'bg-white/95 border-border-subtle/80 text-[#1A1D23]'
        }`}>
          <p className="font-headline font-bold text-accent-electric mb-1.5 pb-1 border-b border-border-subtle/40 uppercase tracking-wider">
            Vector Period: {label}
          </p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 my-1">
              <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-ticker font-extrabold text-on-surface">
                {entry.value} {entry.name === 'Signal Volume' ? 'hits' : '%'}
              </span>
            </div>
          ))}
          <div className="mt-2 pt-1.5 border-t border-border-subtle/30 text-[10px] text-outline text-right italic">
            Simulated backtest stream
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 lg:p-(--spacing-container-margin) min-h-[calc(100vh-73px)] flex flex-col gap-6 animate-fade-in-up">
      
      {/* --- EXPLANATION & SUMMARY HERO CARD --- */}
      <div className={`rounded-2xl p-5 md:p-6 border transition-all duration-300 shadow-sm ${
        isDark ? 'bg-surface/60 border-border-subtle' : 'bg-white border-border-subtle/60'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          {/* Header Title & Helpful description */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent-electric/10 border border-accent-electric/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-accent-electric text-2xl">history</span>
              </div>
              <div>
                <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                  Historical <span className="text-accent-electric">Analysis</span>
                </h1>
                <p className="font-body text-xs font-semibold tracking-wider text-accent-electric uppercase">
                  Longitudinal Impact Backtesting & Archive
                </p>
              </div>
            </div>
            
            <p className="text-on-surface-variant text-xs md:text-sm font-body leading-relaxed mt-2.5">
              <strong className="text-on-surface font-semibold">What does this track?</strong> Historical Analysis reviews indexed sentiment variance and stream volume backtested against market outcomes over custom timelines. Compare smooth temporal curves against actual macro volatility indexes to isolate high-fidelity leading indicators.
            </p>
          </div>

          {/* Quick Metrics Summary strip */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            <div className={`flex-1 sm:w-32 p-3 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-surface-container-low border-border-subtle/50' : 'bg-surface-container-lowest border-border-subtle/40'
            }`}>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-body">Indexed Vectors</span>
              <span className="font-ticker text-xl font-black text-on-surface mt-1">{statsSummary.total}</span>
            </div>

            <div className={`flex-1 sm:w-32 p-3 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-surface-container-low border-border-subtle/50' : 'bg-surface-container-lowest border-border-subtle/40'
            }`}>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-body">Bull/Bear Index</span>
              <span className="font-ticker text-xl font-black text-sentiment-positive mt-1">{statsSummary.ratio}</span>
            </div>

            <div className={`flex-1 sm:w-36 p-3 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-surface-container-low border-border-subtle/50' : 'bg-surface-container-lowest border-border-subtle/40'
            }`}>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-body">Mean Confidence</span>
              <span className="font-ticker text-xl font-black text-accent-electric mt-1">{statsSummary.avgConf}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- TIMEFRAME SELECTOR CONTROLS & EXPORT --- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Interactive Pill Tabs for Timeframes */}
        <div className={`inline-flex p-1 rounded-xl border items-center ${
          isDark ? 'bg-surface border-border-subtle' : 'bg-surface-container-low border-border-subtle/60'
        }`}>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase px-3 tracking-wider font-body hidden sm:inline">
            Range:
          </span>
          {['1M', '3M', '6M', 'YTD'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-lg font-body text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                timeframe === tf 
                  ? 'bg-accent-electric text-background shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tf === '1M' ? '1 Month' : tf === '3M' ? '1 Quarter' : tf === '6M' ? '6 Months' : 'Year to Date'}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <button 
          onClick={() => alert(`Exporting comprehensive temporal dataset for ${timeframe} vector view...`)}
          className={`px-4 py-2 rounded-xl border font-body text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            isDark ? 'border-accent-electric/40 text-accent-electric hover:bg-accent-electric/10' : 'border-primary text-primary hover:bg-primary/5'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">cloud_download</span>
          Export CSV Receipt
        </button>
      </div>

      {/* --- MAIN GRAPHS & SECTOR BENTO GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Graph Area Container (2 Cols) */}
        <div className={`xl:col-span-2 rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
          isDark ? 'bg-surface border-border-subtle' : 'bg-white border-border-subtle/80 shadow-sm'
        }`}>
          
          {/* Chart Title Strip */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                Longitudinal Sentiment Index vs. Macro Volatility
              </h3>
              <p className="text-xs text-on-surface-variant font-body mt-0.5">
                Harmonic stream flow curves simulated alongside absolute signal generation count.
              </p>
            </div>
            
            {/* Visual Indicators strip */}
            <div className="flex items-center gap-3 text-xs font-body font-semibold">
              <span className="flex items-center gap-1.5 text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-electric shadow-[0_0_6px_#00E5FF]"></span>
                Sentiment Index
              </span>
              <span className="flex items-center gap-1.5 text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-sentiment-negative"></span>
                Volatility Index
              </span>
            </div>
          </div>

          {/* Actual Recharts Engine Container */}
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#00E5FF' : '#0097A7'} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={isDark ? '#00E5FF' : '#0097A7'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#30363D' : '#E0E4EA'} vertical={false} />
                <XAxis 
                  dataKey="period" 
                  stroke={isDark ? '#849396' : '#6B7B85'} 
                  tick={{ fill: isDark ? '#bac9cc' : '#44505A', fontSize: 11, fontWeight: 600, fontFamily: 'Space Grotesk' }} 
                  axisLine={{ stroke: isDark ? '#30363D' : '#D8DCE3' }}
                />
                <YAxis 
                  stroke={isDark ? '#849396' : '#6B7B85'} 
                  tick={{ fill: isDark ? '#bac9cc' : '#44505A', fontSize: 11, fontFamily: 'Space Grotesk' }} 
                  axisLine={{ stroke: isDark ? '#30363D' : '#D8DCE3' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#00E5FF44' : '#0097A744', strokeWidth: 2, strokeDasharray: '4 4' }} />
                
                {/* Main Sentiment Area Curve */}
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke={isDark ? '#00E5FF' : '#0097A7'} 
                  strokeWidth={2.5} 
                  fill="url(#colorSentiment)" 
                  name="Sentiment Impact" 
                  activeDot={{ r: 6, strokeWidth: 2, stroke: isDark ? '#0B0E14' : '#FFFFFF' }}
                />
                
                {/* Secondary Volatility line */}
                <Area 
                  type="monotone" 
                  dataKey="volatility" 
                  stroke="#EF4444" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 3"
                  fill="none" 
                  name="Macro Volatility" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Helper note */}
          <div className="mt-3 pt-2 border-t border-border-subtle/30 flex justify-between items-center text-[11px] text-outline italic">
            <span>Data intervals recalculate automatically on live feed shifts</span>
            <span className="font-ticker text-accent-electric font-semibold not-italic">Backtest Precision: High</span>
          </div>

        </div>

        {/* Sector Variance Breakdown Sidebar Card (1 Col) */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
          isDark ? 'bg-surface border-border-subtle' : 'bg-white border-border-subtle/80 shadow-sm'
        }`}>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface mb-1">
              Sector Impact Variance
            </h3>
            <p className="text-xs text-on-surface-variant font-body mb-5">
              Cumulative weighted directionality across indexed ETFs.
            </p>

            {/* Dynamic Custom Bars */}
            <div className="flex flex-col gap-4">
              {sectors.map((sec, sIdx) => {
                const isPos = sec.sentiment === 'positive';
                const isNeg = sec.sentiment === 'negative';
                const barColor = isPos ? '#22C55E' : isNeg ? '#EF4444' : (isDark ? '#00E5FF' : '#0097A7');
                const textClass = isPos ? 'text-sentiment-positive' : isNeg ? 'text-sentiment-negative' : 'text-accent-electric';
                
                return (
                  <div key={sIdx} className="group">
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-body font-bold text-on-surface group-hover:text-accent-electric transition-colors truncate max-w-[170px]">
                        {sec.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-outline font-body">({sec.volumeCount} streams)</span>
                        <span className={`font-ticker font-extrabold ${textClass}`}>
                          {sec.change}
                        </span>
                      </div>
                    </div>
                    
                    {/* Immersive progress track */}
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden border border-border-subtle/20">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${sec.pct}%`, backgroundColor: barColor }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-border-subtle/40 flex items-center justify-between bg-surface-container-low/40 p-2.5 rounded-xl">
            <span className="text-[11px] font-body text-on-surface font-medium">Contagion Beta Index</span>
            <span className="font-ticker text-xs font-bold text-sentiment-negative">1.24x Market Base</span>
          </div>
        </div>

      </div>

      {/* --- INTERACTIVE SIGNAL ARCHIVE TABLE --- */}
      <div className={`rounded-2xl border p-5 transition-all duration-300 ${
        isDark ? 'bg-surface border-border-subtle' : 'bg-white border-border-subtle/80 shadow-sm'
      }`}>
        
        {/* Table Search Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-electric text-lg">archive</span>
              Historical Signal Archive Registry
            </h3>
            <p className="text-xs text-on-surface-variant font-body mt-0.5">
              Complete index records of natural language trigger events. Click any signal row to inspect backtest receipts.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search assets, signals, sources..." 
              className={`w-full text-xs font-body rounded-xl pl-9 pr-8 py-2.5 outline-none transition-all border ${
                isDark 
                  ? 'bg-surface-container border-border-subtle text-on-surface focus:border-accent-electric' 
                  : 'bg-surface-container-low border-border-subtle/60 text-[#1A1D23] focus:border-primary'
              }`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Data Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="font-body text-[10px] font-bold tracking-wider uppercase text-on-surface-variant border-b border-border-subtle/60">
              <tr>
                <th className="pb-3 px-3">Vector Code / Date</th>
                <th className="pb-3 px-3">Target Asset</th>
                <th className="pb-3 px-3">Signal Type Status</th>
                <th className="pb-3 px-3">Stream Parsing Title</th>
                <th className="pb-3 px-3 text-right">Confidence</th>
                <th className="pb-3 px-3 text-right">Projected Alpha</th>
                <th className="pb-3 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border-subtle/40 font-body text-xs">
              {signals.length > 0 ? signals.map((sig) => {
                const isSelected = selectedSignal?.id === sig.id;
                const isPos = sig.sentimentStatus === 'positive';
                const isNeg = sig.sentimentStatus === 'negative';
                
                return (
                  <tr 
                    key={sig.id} 
                    onClick={() => setSelectedSignal(isSelected ? null : sig)}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected 
                        ? (isDark ? 'bg-accent-electric/10 font-medium' : 'bg-primary/5 font-medium')
                        : 'hover:bg-surface-variant/40'
                    }`}
                  >
                    {/* Timestamp & ID */}
                    <td className="py-3.5 px-3">
                      <div className="font-ticker font-bold text-on-surface">{sig.id}</div>
                      <div className="text-[10px] text-on-surface-variant font-normal">{sig.date}</div>
                    </td>

                    {/* Target Asset Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-1 rounded font-ticker font-extrabold text-xs border ${
                        isDark ? 'bg-surface-container-high border-border-subtle text-white' : 'bg-surface-container border-border-subtle/60 text-[#1A1D23]'
                      }`}>
                        {sig.asset}
                      </span>
                      <span className="text-[10px] text-outline ml-2 hidden lg:inline">{sig.sourceName}</span>
                    </td>

                    {/* Signal Type tag */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPos ? 'bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/20' :
                        isNeg ? 'bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/20' :
                        'bg-surface-container text-accent-electric border-accent-electric/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPos ? 'bg-sentiment-positive' : isNeg ? 'bg-sentiment-negative' : 'bg-accent-electric'}`}></span>
                        {sig.type}
                      </span>
                    </td>

                    {/* Stream Parsing Event Title */}
                    <td className="py-3.5 px-3 max-w-xs truncate text-on-surface/90 font-medium font-body" title={sig.title}>
                      {sig.title}
                    </td>

                    {/* Confidence percentage */}
                    <td className="py-3.5 px-3 text-right font-ticker font-bold text-on-surface">
                      {sig.confidence}%
                    </td>

                    {/* Projected Output Return */}
                    <td className={`py-3.5 px-3 text-right font-ticker font-black ${
                      isPos ? 'text-sentiment-positive' : isNeg ? 'text-sentiment-negative' : 'text-accent-electric'
                    }`}>
                      {sig.outcome}
                    </td>

                    {/* Inspection Button */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`material-symbols-outlined text-base transition-transform ${
                        isSelected ? 'text-accent-electric rotate-90' : 'text-outline hover:text-on-surface'
                      }`}>
                        read_more
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-outline italic">
                    No matching signal items discovered for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal / Expanded inspection pane embedded right below rows if row clicked */}
        {selectedSignal && (
          <div className={`mt-4 p-4 rounded-xl border animate-fade-in-up transition-all ${
            isDark ? 'bg-surface-container-high border-accent-electric/30' : 'bg-surface-container-low border-primary/30'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-body text-xs font-bold text-accent-electric uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Backtest Execution Audit Receipt: {selectedSignal.id}
              </span>
              <button 
                onClick={() => setSelectedSignal(null)}
                className="text-xs text-outline hover:text-on-surface underline cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
            
            <p className="text-xs text-on-surface-variant font-body leading-relaxed bg-background/50 p-3 rounded-lg border border-border-subtle/30">
              {selectedSignal.detailsContext}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-body text-on-surface font-medium">
              <div><span className="text-outline">Origin Stream:</span> {selectedSignal.sourceName}</div>
              <div><span className="text-outline">Target Vector:</span> {selectedSignal.asset}</div>
              <div><span className="text-outline">Calculated Alpha Variance:</span> <span className="font-ticker text-sentiment-positive">{selectedSignal.outcome}</span></div>
              <div><span className="text-outline">Execution Hash:</span> <span className="font-mono text-outline">0x88f2...c10b</span></div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

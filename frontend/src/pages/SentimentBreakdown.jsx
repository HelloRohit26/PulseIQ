import { useMemo, useState } from 'react';

const SECTOR_CONFIG = {
  'Technology': { icon: 'memory', keywords: ['ai', 'tech', 'software', 'cloud', 'apple', 'microsoft', 'nvidia', 'chip', 'semiconductor', 'data'], gradient: 'from-cyan-500/20 to-blue-600/20', accent: '#00E5FF', ring: 'ring-cyan-400/30' },
  'Energy': { icon: 'bolt', keywords: ['oil', 'energy', 'gas', 'green', 'solar', 'wind', 'fuel', 'electric', 'ev', 'battery'], gradient: 'from-amber-500/20 to-orange-600/20', accent: '#F59E0B', ring: 'ring-amber-400/30' },
  'Financials': { icon: 'account_balance', keywords: ['bank', 'fed', 'rate', 'inflation', 'economy', 'crypto', 'loan', 'trading', 'stock', 'fund'], gradient: 'from-emerald-500/20 to-green-600/20', accent: '#22C55E', ring: 'ring-emerald-400/30' },
  'Healthcare': { icon: 'health_and_safety', keywords: ['health', 'medical', 'drug', 'fda', 'pharma', 'biotech', 'vaccine', 'hospital'], gradient: 'from-rose-500/20 to-pink-600/20', accent: '#F43F5E', ring: 'ring-rose-400/30' },
  'Geopolitics': { icon: 'public', keywords: ['war', 'trade', 'tariff', 'sanction', 'election', 'government', 'policy', 'china', 'india', 'trump', 'modi'], gradient: 'from-violet-500/20 to-purple-600/20', accent: '#A78BFA', ring: 'ring-violet-400/30' },
  'Consumer': { icon: 'shopping_cart', keywords: ['consumer', 'retail', 'spending', 'sales', 'buy', 'market', 'demand', 'price'], gradient: 'from-sky-500/20 to-indigo-600/20', accent: '#38BDF8', ring: 'ring-sky-400/30' },
};

export default function SentimentBreakdown({ articles = [] }) {
  const [activeSector, setActiveSector] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Categorize articles into sectors
  const sectorData = useMemo(() => {
    const result = {};
    for (const [name, config] of Object.entries(SECTOR_CONFIG)) {
      result[name] = { ...config, name, articles: [], positive: 0, negative: 0, neutral: 0, totalScore: 0 };
    }

    articles.forEach(a => {
      const text = ((a.title || '') + ' ' + (a.content || '')).toLowerCase();
      for (const [name, config] of Object.entries(SECTOR_CONFIG)) {
        if (config.keywords.some(kw => text.includes(kw))) {
          const sent = (a.sentiment || '').toLowerCase();
          result[name].articles.push(a);
          result[name].totalScore += a.score || 0;
          if (sent === 'positive') result[name].positive++;
          else if (sent === 'negative') result[name].negative++;
          else result[name].neutral++;
          break;
        }
      }
    });

    return Object.values(result).sort((a, b) => b.articles.length - a.articles.length);
  }, [articles]);

  const totalArticles = articles.length;
  const selectedSector = activeSector ? sectorData.find(s => s.name === activeSector) : null;

  // Overall stats
  const overallStats = useMemo(() => {
    const pos = articles.filter(a => (a.sentiment || '').toLowerCase() === 'positive').length;
    const neg = articles.filter(a => (a.sentiment || '').toLowerCase() === 'negative').length;
    const neu = articles.length - pos - neg;
    return { pos, neg, neu };
  }, [articles]);

  return (
    <div className="p-(--spacing-container-margin)">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-accent-electric text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>filter_list</span>
            <p className="font-body text-[12px] font-semibold tracking-[0.05em] text-accent-electric uppercase">Sector Intelligence</p>
          </div>
          <h2 className="font-headline text-[28px] md:text-[32px] font-semibold text-on-surface">
            Market Sector Analysis
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">AI-powered sector classification of {totalArticles} live articles</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-surface-container-high rounded-lg border border-border-subtle overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-accent-electric/15 text-accent-electric' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-[16px]">grid_view</span> Grid
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-accent-electric/15 text-accent-electric' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-[16px]">view_list</span> List
            </button>
          </div>
          {/* Overall Sentiment Pill */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sentiment-positive/10 border border-sentiment-positive/20">
              <div className="w-2 h-2 rounded-full bg-sentiment-positive"></div>
              <span className="text-xs font-bold text-sentiment-positive">{overallStats.pos}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sentiment-negative/10 border border-sentiment-negative/20">
              <div className="w-2 h-2 rounded-full bg-sentiment-negative"></div>
              <span className="text-xs font-bold text-sentiment-negative">{overallStats.neg}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sentiment-neutral/10 border border-sentiment-neutral/20">
              <div className="w-2 h-2 rounded-full bg-sentiment-neutral"></div>
              <span className="text-xs font-bold text-sentiment-neutral">{overallStats.neu}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sector Cards Grid ── */}
      <div className={`grid gap-4 mb-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {sectorData.map((sector, idx) => {
          const total = sector.articles.length;
          const pct = totalArticles > 0 ? Math.round((total / totalArticles) * 100) : 0;
          const avgScore = total > 0 ? Math.round((sector.totalScore / total) * 100) : 0;
          const dominantSentiment = sector.positive >= sector.negative ? 'Bullish' : 'Bearish';
          const isActive = activeSector === sector.name;

          return (
            <div
              key={sector.name}
              onClick={() => setActiveSector(isActive ? null : sector.name)}
              className={`group relative bg-surface border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up ${
                isActive 
                  ? `border-[${sector.accent}]/50 shadow-[0_0_25px_rgba(0,229,255,0.1)] ring-2 ${sector.ring}` 
                  : 'border-border-subtle hover:border-on-surface-variant/30'
              }`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${sector.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                {/* Top Row: Icon + Name + Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-subtle bg-surface-container-high group-hover:border-on-surface-variant/30 transition-colors" style={{ boxShadow: isActive ? `0 0 12px ${sector.accent}30` : 'none' }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: sector.accent, fontVariationSettings: "'FILL' 1" }}>{sector.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-ticker text-[15px] font-bold text-on-surface">{sector.name}</h3>
                      <p className="text-[11px] text-on-surface-variant">{total} articles • {pct}% of feed</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    dominantSentiment === 'Bullish' 
                      ? 'bg-sentiment-positive/10 text-sentiment-positive border border-sentiment-positive/20' 
                      : 'bg-sentiment-negative/10 text-sentiment-negative border border-sentiment-negative/20'
                  }`}>
                    {total > 0 ? dominantSentiment : '—'}
                  </div>
                </div>

                {/* Sentiment Bar */}
                <div className="mb-4">
                  <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-surface-container-high">
                    {total > 0 ? (
                      <>
                        <div className="bg-sentiment-positive rounded-l-full transition-all duration-700" style={{ width: `${(sector.positive / total) * 100}%` }}></div>
                        <div className="bg-sentiment-neutral transition-all duration-700" style={{ width: `${(sector.neutral / total) * 100}%` }}></div>
                        <div className="bg-sentiment-negative rounded-r-full transition-all duration-700" style={{ width: `${(sector.negative / total) * 100}%` }}></div>
                      </>
                    ) : (
                      <div className="bg-surface-container-high w-full rounded-full"></div>
                    )}
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] font-semibold text-on-surface-variant">
                    <span className="text-sentiment-positive">{sector.positive} bullish</span>
                    <span className="text-sentiment-negative">{sector.negative} bearish</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-high/50 rounded-lg p-2.5 border border-border-subtle/50">
                    <p className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider mb-0.5">Avg Impact</p>
                    <p className="font-ticker text-lg font-bold" style={{ color: sector.accent }}>{avgScore}<span className="text-xs text-on-surface-variant">/100</span></p>
                  </div>
                  <div className="bg-surface-container-high/50 rounded-lg p-2.5 border border-border-subtle/50">
                    <p className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider mb-0.5">Coverage</p>
                    <p className="font-ticker text-lg font-bold text-on-surface">{pct}<span className="text-xs text-on-surface-variant">%</span></p>
                  </div>
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-3 right-3 z-20">
                  <span className="material-symbols-outlined text-accent-electric text-[18px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>expand_circle_down</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Expanded Sector Detail ── */}
      {selectedSector && selectedSector.articles.length > 0 && (
        <div className="bg-surface border border-border-subtle rounded-xl p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border-subtle" style={{ backgroundColor: `${selectedSector.accent}15` }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: selectedSector.accent, fontVariationSettings: "'FILL' 1" }}>{selectedSector.icon}</span>
              </div>
              <div>
                <h3 className="font-ticker text-[16px] font-bold text-on-surface">{selectedSector.name} Sector — Live Feed</h3>
                <p className="text-xs text-on-surface-variant">{selectedSector.articles.length} articles matching this sector</p>
              </div>
            </div>
            <button onClick={() => setActiveSector(null)} className="text-on-surface-variant hover:text-accent-electric transition-colors p-1.5 rounded-lg hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedSector.articles.slice(0, 8).map((a, i) => {
              const sent = (a.sentiment || '').toLowerCase();
              const isPos = sent === 'positive';
              const isNeg = sent === 'negative';
              return (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-lg bg-surface-container-low border border-border-subtle/50 hover:border-on-surface-variant/20 transition-all hover:bg-surface-container-high/50 group`}>
                  <div className={`mt-0.5 w-1.5 h-full min-h-[40px] rounded-full flex-shrink-0 ${isPos ? 'bg-sentiment-positive' : isNeg ? 'bg-sentiment-negative' : 'bg-sentiment-neutral'}`}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-on-surface line-clamp-2 group-hover:text-accent-electric transition-colors">{a.title}</h4>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">source</span> {a.source}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isPos ? 'bg-sentiment-positive/10 text-sentiment-positive' : 
                        isNeg ? 'bg-sentiment-negative/10 text-sentiment-negative' : 
                        'bg-sentiment-neutral/10 text-sentiment-neutral'
                      }`}>{isPos ? 'Bullish' : isNeg ? 'Bearish' : 'Neutral'}</span>
                      <span className="text-[11px] font-ticker font-bold" style={{ color: selectedSector.accent }}>{Math.round((a.score || 0) * 100)}/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedSector.articles.length > 8 && (
            <p className="text-center text-xs text-on-surface-variant mt-4">
              +{selectedSector.articles.length - 8} more articles in this sector
            </p>
          )}
        </div>
      )}

      {/* ── Empty State ── */}
      {totalArticles === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 animate-pulse">cloud_sync</span>
          <h3 className="font-headline text-xl font-semibold text-on-surface mb-2">Scanning Market Sectors...</h3>
          <p className="text-sm text-on-surface-variant max-w-md">PulseIQ is collecting and classifying live news articles into market sectors. Data will appear here once the pipeline is active.</p>
        </div>
      )}
    </div>
  );
}

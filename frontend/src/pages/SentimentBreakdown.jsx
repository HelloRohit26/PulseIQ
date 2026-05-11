import { useMemo } from 'react';

export default function SentimentBreakdown({ articles = [] }) {
  const stats = useMemo(() => {
    if (!articles.length) return { pulse: 0, momentum: '0%' };
    const avg = articles.reduce((s, a) => s + (a.sentiment?.toLowerCase() === 'positive' ? a.score : -a.score), 0) / articles.length;
    const pulseScore = Math.round(50 + (avg * 50));
    const momentumValue = (avg * 15).toFixed(1);
    return { 
      pulse: pulseScore, 
      momentum: `${momentumValue > 0 ? '+' : ''}${momentumValue}%`,
      isPositive: avg > 0
    };
  }, [articles]);

  const factors = useMemo(() => {
    if (!articles.length) return [];
    
    const categories = {
      'Technology': ['ai', 'tech', 'software', 'cloud', 'apple', 'microsoft'],
      'Energy': ['oil', 'energy', 'gas', 'green'],
      'Financials': ['bank', 'fed', 'rate', 'inflation', 'economy', 'crypto'],
      'Healthcare': ['health', 'medical', 'drug', 'fda']
    };

    const result = [];
    let totalMatches = 0;
    
    // Count matches
    const counts = {};
    articles.forEach(a => {
      const text = (a.title + " " + a.content).toLowerCase();
      for (const [name, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => text.includes(kw))) {
          counts[name] = (counts[name] || 0) + 1;
          totalMatches++;
          break; // Count in first matching category only to avoid double counting
        }
      }
    });

    if (totalMatches === 0) totalMatches = 1; // Prevent division by zero

    for (const [name, count] of Object.entries(counts)) {
      result.push({
        label: name,
        pct: Math.round((count / totalMatches) * 100)
      });
    }

    // Fill remaining if empty
    if (result.length === 0) {
      return [
        { label: 'Technology', pct: 42 },
        { label: 'Energy', pct: 28 },
        { label: 'Financials', pct: 15 },
        { label: 'Healthcare', pct: 10 },
      ];
    }
    
    return result.sort((a, b) => b.pct - a.pct);
  }, [articles]);

  const institutional = useMemo(() => {
    if (!articles.length) return [];
    // Filter to big sources
    const bigBanks = ['Goldman Sachs', 'Morgan Stanley', 'Bloomberg', 'Reuters', 'CNBC', 'Wall Street Journal'];
    const instArticles = articles.filter(a => bigBanks.some(b => a.source.toLowerCase().includes(b.toLowerCase())));
    
    const display = instArticles.length > 0 ? instArticles.slice(0, 4) : articles.slice(0, 4);
    
    return display.map(a => ({
      source: a.source,
      sentiment: a.sentiment?.toLowerCase() === 'positive' ? 'Bullish' : 'Bearish',
      body: a.title + ". " + (a.content || ''),
      score: Math.round(a.score * 100),
      icon: 'account_balance'
    }));
  }, [articles]);

  const newsIntel = useMemo(() => {
    if (!articles.length) return [];
    
    // Filter to highest score articles not in institutional
    const sorted = [...articles].sort((a, b) => b.score - a.score).slice(0, 6);
    
    return sorted.map(a => ({
      source: a.source,
      sentiment: a.sentiment?.toLowerCase() === 'positive' ? 'Bullish' : 'Bearish',
      body: a.title,
      score: Math.round(a.score * 100),
      icon: 'article'
    }));
  }, [articles]);

  return (
    <div className="p-(--spacing-container-margin)">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <p className="font-body text-[12px] font-semibold tracking-[0.05em] text-accent-electric mb-2 uppercase">Sentiment Breakdown</p>
          <h2 className="font-headline text-[32px] font-semibold text-on-surface">
            Sentiment Drivers: {stats.isPositive ? 'Bullish' : 'Bearish'}
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface border border-border-subtle p-3 rounded min-w-[140px]">
            <p className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-1 uppercase">Aggregate Pulse</p>
            <p className="font-ticker text-2xl text-accent-electric font-bold">{stats.pulse}</p>
          </div>
          <div className="bg-surface border border-border-subtle p-3 rounded min-w-[140px]">
            <p className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-1 uppercase">24h Momentum</p>
            <p className={`font-ticker text-2xl font-bold ${stats.isPositive ? 'text-sentiment-positive' : 'text-sentiment-negative'}`}>
              {stats.momentum}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-(--spacing-gutter)">
        {/* Factor Attribution */}
        <div className="lg:col-span-4 flex flex-col gap-(--spacing-gutter)">
          <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-lg">
            <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface mb-4 border-b border-border-subtle pb-2 uppercase">Live Factor Attribution</h3>
            <div className="space-y-4">
              {factors.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-1 uppercase">
                    <span>{f.label}</span>
                    <span className="text-accent-electric">{f.pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-accent-electric h-full rounded-full transition-all duration-1000" style={{ width: `${f.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="lg:col-span-8 flex flex-col gap-(--spacing-gutter)">
          {/* Institutional Research */}
          <div>
            <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-3 pl-2 border-l-2 border-border-subtle uppercase">Institutional & Major Media Research</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-(--spacing-gutter)">
              {institutional.length > 0 ? institutional.map((item, i) => (
                <ResearchCard key={i} {...item} />
              )) : (
                <div className="text-sm text-on-surface-variant">Gathering institutional intelligence...</div>
              )}
            </div>
          </div>

          {/* News Intelligence */}
          <div>
            <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant mb-3 pl-2 border-l-2 border-border-subtle mt-4 uppercase">Real-Time News Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-(--spacing-gutter)">
              {newsIntel.length > 0 ? newsIntel.map((item, i) => (
                <ResearchCard key={i} {...item} />
              )) : (
                <div className="text-sm text-on-surface-variant">Gathering news intelligence...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchCard({ source, sentiment, body, score, icon }) {
  const isPos = sentiment === 'Bullish';
  return (
    <div className="bg-surface border border-border-subtle p-(--spacing-card-padding) rounded-lg hover:border-accent-electric/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-sm">{icon}</span>
          <span className="font-ticker text-[14px] font-bold text-on-surface">{source}</span>
        </div>
        <div className={`${isPos ? 'bg-sentiment-positive/10 text-sentiment-positive' : 'bg-sentiment-negative/10 text-sentiment-negative'} px-2 py-0.5 rounded-full font-body text-[10px] font-semibold`}>{sentiment}</div>
      </div>
      <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-2">{body}</p>
      <div className="flex justify-between items-center border-t border-border-subtle pt-3">
        <span className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Impact Score</span>
        <span className={`font-ticker text-[14px] font-bold ${isPos ? 'text-accent-electric' : 'text-sentiment-negative'}`}>{score}/100</span>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { fetchMarketData } from '../services/api';

export default function LiveTicker({ articles = [] }) {
  const [marketAssets, setMarketAssets] = useState([]);

  useEffect(() => {
    fetchMarketData().then((data) => {
      if (data && data.assets) {
        setMarketAssets(data.assets);
      }
    });
    const interval = setInterval(() => {
      fetchMarketData().then((data) => {
        if (data && data.assets) setMarketAssets(data.assets);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const newsItems = articles.length > 0
    ? articles.slice(0, 8).map((a) => ({
        type: 'news',
        text: a.title,
        sentiment: a.sentiment,
        icon: a.sentiment === 'positive' ? 'trending_up' : a.sentiment === 'negative' ? 'trending_down' : 'bolt',
      }))
    : [
        { type: 'news', text: 'Global Semiconductor Foundries Accelerate Sub-2nm Deployment', sentiment: 'positive', icon: 'trending_up' },
        { type: 'news', text: 'Fed Notes Resilient Employment Indicators Inside Target Rate Corridor', sentiment: 'neutral', icon: 'bolt' },
        { type: 'news', text: 'Energy Transit Bottlenecks Introduce Freight Spot Premiums', sentiment: 'negative', icon: 'trending_down' },
        { type: 'news', text: 'Hyperscale Cloud CapEx Expands 34% Year-Over-Year', sentiment: 'positive', icon: 'trending_up' }
      ];

  const marketChips = marketAssets.map((asset) => ({
    type: 'market',
    ticker: asset.ticker,
    price: typeof asset.price === 'number' ? `$${asset.price.toLocaleString()}` : asset.price,
    change: asset.change,
    isUp: asset.change.startsWith('+')
  }));

  // Interleave market prices with news headlines
  const combined = [];
  const maxLen = Math.max(newsItems.length, marketChips.length);
  for (let i = 0; i < maxLen; i++) {
    if (marketChips[i]) combined.push(marketChips[i]);
    if (newsItems[i]) combined.push(newsItems[i]);
  }

  const sentimentColor = (s) =>
    s === 'positive' ? 'text-sentiment-positive' : s === 'negative' ? 'text-sentiment-negative' : 'text-accent-electric';

  const doubled = [...combined, ...combined];

  return (
    <div className="fixed top-[73px] w-full bg-surface-container-high border-b border-border-subtle z-40 overflow-hidden py-2 px-(--spacing-container-margin)">
      <div className="flex items-center gap-6 font-ticker text-[13px] font-bold whitespace-nowrap animate-marquee">
        <span className="flex items-center gap-1.5 bg-accent-electric/15 text-accent-electric border border-accent-electric/30 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-electric animate-pulse"></span>
          REAL-TIME TELEMETRY
        </span>
        {doubled.map((item, i) => {
          if (item.type === 'market') {
            return (
              <span key={i} className="flex items-center gap-1.5 shrink-0 bg-surface/80 px-2.5 py-0.5 rounded border border-border-subtle/70">
                <span className="text-on-surface font-semibold">{item.ticker}</span>
                <span className="text-on-surface-variant font-mono">{item.price}</span>
                <span className={`text-[11px] font-bold ${item.isUp ? 'text-sentiment-positive' : 'text-sentiment-negative'}`}>
                  {item.change}
                </span>
                <span className="text-border-subtle ml-2">•</span>
              </span>
            );
          }
          return (
            <span key={i} className="flex items-center gap-2 shrink-0">
              <span className={`material-symbols-outlined text-[15px] ${sentimentColor(item.sentiment)}`}>{item.icon}</span>
              <span className={sentimentColor(item.sentiment)}>{item.text}</span>
              {i < doubled.length - 1 && <span className="text-border-subtle ml-4">•</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

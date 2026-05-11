export default function LiveTicker({ articles }) {
  const tickerItems = articles.length > 0
    ? articles.slice(0, 8).map((a) => ({
        text: a.title,
        sentiment: a.sentiment,
        icon: a.sentiment === 'positive' ? 'trending_up' : a.sentiment === 'negative' ? 'trending_down' : 'bolt',
      }))
    : [
        { text: 'AAPL Volatility Surge Detected (98% Conf)', sentiment: 'positive', icon: 'trending_up' },
        { text: 'Global Energy Sector Supply Chain Disruptions', sentiment: 'negative', icon: 'trending_down' },
        { text: 'Semi-Conductor CapEx Expansion Plans Leaked', sentiment: 'positive', icon: 'trending_up' },
        { text: 'Crypto Regulatory Hearing Concludes', sentiment: 'neutral', icon: 'bolt' },
        { text: 'Fed Rate Decision Imminent', sentiment: 'neutral', icon: 'news' },
        { text: 'TSLA Production Miss Reported', sentiment: 'negative', icon: 'trending_down' },
      ];

  const sentimentColor = (s) =>
    s === 'positive' ? 'text-sentiment-positive' : s === 'negative' ? 'text-sentiment-negative' : 'text-accent-electric';

  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="fixed top-[73px] w-full bg-surface-container-high border-b border-border-subtle z-40 overflow-hidden py-2 px-(--spacing-container-margin)">
      <div className="flex items-center gap-6 font-ticker text-[14px] font-bold whitespace-nowrap animate-marquee">
        <span className="text-accent-electric font-bold mr-4 shrink-0">LIVE PULSE</span>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 shrink-0">
            <span className={`material-symbols-outlined text-[16px] ${sentimentColor(item.sentiment)}`}>{item.icon}</span>
            <span className={sentimentColor(item.sentiment)}>{item.text}</span>
            {i < doubled.length - 1 && <span className="text-border-subtle ml-4">•</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

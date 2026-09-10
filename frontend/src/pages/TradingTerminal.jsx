import { useState, useEffect } from 'react';
import { fetchTradeSignals } from '../services/api';

const TICKERS = [
  { id: 'NVDA', name: 'NVIDIA Corp', symbol: 'NASDAQ:NVDA', class: 'Equities' },
  { id: 'BTCUSD', name: 'Bitcoin / USD', symbol: 'COINBASE:BTCUSD', class: 'Crypto' },
  { id: 'TSLA', name: 'Tesla Inc', symbol: 'NASDAQ:TSLA', class: 'Equities' },
  { id: 'AAPL', name: 'Apple Inc', symbol: 'NASDAQ:AAPL', class: 'Equities' },
  { id: 'SPY', name: 'S&P 500 ETF', symbol: 'AMEX:SPY', class: 'Indices' },
  { id: 'ETHUSD', name: 'Ethereum / USD', symbol: 'COINBASE:ETHUSD', class: 'Crypto' },
];

const TIMEFRAMES = [
  { label: '15m', interval: '15' },
  { label: '1H', interval: '60' },
  { label: '4H', interval: '240' },
  { label: '1D', interval: 'D' },
];

export default function TradingTerminal() {
  const [selectedTicker, setSelectedTicker] = useState(TICKERS[0]);
  const [selectedInterval, setSelectedInterval] = useState('D');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    async function loadSignals() {
      setLoading(true);
      const data = await fetchTradeSignals();
      setSignals(data.signals || []);
      setLoading(false);
    }
    loadSignals();
  }, []);

  const currentSignal = signals.find(s => 
    s.ticker.replace('/', '') === selectedTicker.id || 
    selectedTicker.id.startsWith(s.ticker.replace('/', ''))
  ) || signals[0];

  const filteredSignals = activeFilter === 'ALL' 
    ? signals 
    : signals.filter(s => s.asset_class.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in" id="trading-terminal-page">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container/60 border border-border-subtle p-5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-electric/10 border border-accent-electric/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-accent-electric text-[28px]">candlestick_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
                TradingView Terminal & <span className="text-accent-electric">AI Alpha Playbook</span>
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono tracking-wider uppercase animate-pulse">
                Live Feed
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Zero-latency institutional candlestick telemetry correlated directly with multi-source NLP sentiment velocity.
            </p>
          </div>
        </div>

        {/* Ticker Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TICKERS.map((t) => {
            const isSelected = selectedTicker.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTicker(t)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-electric text-background shadow-lg shadow-accent-electric/20 scale-105'
                    : 'bg-surface-container-high/80 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant border border-border-subtle/60'
                }`}
                id={`ticker-pill-${t.id}`}
              >
                <span>${t.id.replace('USD', '')}</span>
                <span className={`text-[9px] uppercase px-1 rounded ${isSelected ? 'bg-black/20 text-white' : 'bg-surface text-outline'}`}>
                  {t.class}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart & Quick Action Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* TradingView Candlestick Chart (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
          {/* Chart Subheader with Timeframe Selectors */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle/80 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-on-surface tracking-wide">
                {selectedTicker.name} ({selectedTicker.symbol})
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span>
              <span className="font-body text-xs text-on-surface-variant">Real-Time Candlestick Feed</span>
            </div>

            <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded-lg border border-border-subtle/60">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  onClick={() => setSelectedInterval(tf.interval)}
                  className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedInterval === tf.interval
                      ? 'bg-accent-electric/20 text-accent-electric border border-accent-electric/40'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Official TradingView Advanced Widget */}
          <div className="w-full h-[520px] bg-background relative">
            <iframe
              key={`${selectedTicker.symbol}-${selectedInterval}`}
              title={`TradingView-${selectedTicker.id}`}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(selectedTicker.symbol)}&interval=${selectedInterval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0A0E17&theme=dark&style=1&timezone=Etc%2FUTC&studies=%5B%5D&overrides=%7B%22paneProperties.background%22%3A%22%230A0E17%22%7D&locale=en&utm_source=pulseiq&utm_medium=widget`}
              className="w-full h-full border-0"
              allowTransparency={true}
              scrolling="no"
            />
          </div>

          {/* Event News Markers Aligned to Chart */}
          <div className="px-5 py-3 bg-surface-container-low border-t border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-accent-electric">timeline</span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Active News Correlation Markers:</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                11:15 UTC: Wafer Allocation Surge (+3.4% momentum)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                09:30 UTC: Institutional Spot Inflow Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Selected Ticker AI Trade Playbook Blueprint (1 Col) */}
        <div className="flex flex-col gap-4">
          {currentSignal && (
            <div className="bg-surface border border-accent-electric/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden bg-gradient-to-b from-accent-electric/5 to-transparent">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-accent-electric uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI Playbook Blueprint
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  currentSignal.action_type === 'bullish'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {currentSignal.action}
                </span>
              </div>

              <div>
                <div className="text-2xl font-bold font-mono text-on-surface">
                  ${currentSignal.ticker}
                </div>
                <div className="text-xs text-on-surface-variant font-body">
                  {currentSignal.name} · {currentSignal.timeframe}
                </div>
              </div>

              {/* Matrix Table */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container/60 p-3 rounded-xl border border-border-subtle/70 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Entry Zone</div>
                  <div className="text-on-surface font-bold text-emerald-400">{currentSignal.entry_zone}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Target 1 (Base)</div>
                  <div className="text-on-surface font-bold text-accent-electric">{currentSignal.target_1}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Hard Stop-Loss</div>
                  <div className="text-on-surface font-bold text-rose-400">{currentSignal.stop_loss}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Risk/Reward</div>
                  <div className="text-on-surface font-bold text-amber-300">{currentSignal.risk_reward}</div>
                </div>
              </div>

              {/* Confidence & Win Rate */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-border-subtle/60 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-outline uppercase">AI Confidence</div>
                  <div className="text-emerald-400 font-bold">{currentSignal.confidence}% High Conviction</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-outline uppercase">180D Backtest</div>
                  <div className="text-amber-400 font-bold">{currentSignal.win_rate_180d} Win Rate</div>
                </div>
              </div>

              {/* Catalyst Summary */}
              <div className="text-xs font-body text-on-surface-variant bg-surface/40 p-3 rounded-xl border border-border-subtle/40 leading-relaxed">
                <span className="font-semibold text-on-surface block mb-1">Catalyst Trigger:</span>
                {currentSignal.catalyst}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-outline pt-2 border-t border-border-subtle/60">
                <span>{currentSignal.lead_time}</span>
                <span className="text-emerald-400">{currentSignal.volume_surge} Vol Surge</span>
              </div>
            </div>
          )}

          {/* Quick Telegram Bot Ping Card */}
          <div className="bg-surface-container-low border border-border-subtle rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent-electric text-[20px]">send</span>
              <div>
                <div className="text-xs font-bold text-on-surface font-mono">Instant Telegram Ping</div>
                <div className="text-[11px] text-on-surface-variant font-body">Forward setup to Telegram</div>
              </div>
            </div>
            <button
              onClick={() => window.open('https://t.me', '_blank')}
              className="px-3 py-1.5 rounded-lg bg-accent-electric/10 hover:bg-accent-electric text-accent-electric hover:text-background border border-accent-electric/30 text-xs font-bold font-mono transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Full AI Quantitative Trade Signals Grid */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-electric">bolt</span>
              Active Quantitative Signal Blueprints
            </h2>
            <p className="font-body text-xs text-on-surface-variant">
              Systematic trade hypotheses generated by PulseIQ sentiment-momentum correlation models.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'Equities', 'Crypto', 'Commodities'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-accent-electric text-background'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-border-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSignals.map((sig) => (
            <div
              key={sig.id}
              className="bg-surface border border-border-subtle hover:border-accent-electric/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-accent-electric/5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-on-surface group-hover:text-accent-electric transition-colors">
                      ${sig.ticker}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-outline">
                      {sig.asset_class.split('/')[0]}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant font-body">{sig.name}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                  sig.action_type === 'bullish'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {sig.action}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-lg text-center font-mono text-[11px]">
                <div>
                  <div className="text-[9px] text-outline uppercase">Entry</div>
                  <div className="font-semibold text-on-surface">{sig.entry_zone.split('-')[0]}</div>
                </div>
                <div>
                  <div className="text-[9px] text-outline uppercase">Target 1</div>
                  <div className="font-semibold text-accent-electric">{sig.target_1.split(' ')[0]}</div>
                </div>
                <div>
                  <div className="text-[9px] text-outline uppercase">Stop</div>
                  <div className="font-semibold text-rose-400">{sig.stop_loss.split(' ')[0]}</div>
                </div>
              </div>

              <div className="text-xs font-body text-on-surface-variant line-clamp-2">
                {sig.catalyst}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-outline pt-2 border-t border-border-subtle/50">
                <span className="text-emerald-400 font-semibold">{sig.win_rate_180d} Win Rate</span>
                <span>RRR {sig.risk_reward}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

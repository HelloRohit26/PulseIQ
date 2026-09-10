import { useState, useEffect } from 'react';
import { fetchTradeSignals } from '../services/api';
import TiltCard from '../components/TiltCard';
import { playClick } from '../utils/soundEffects';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel specular-border p-5 rounded-2xl border-beam-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-electric/30 to-purple-600/30 border border-accent-electric/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(0,229,255,0.35)]">
            <span className="material-symbols-outlined text-accent-electric text-[28px]">candlestick_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
                TradingView Terminal & <span className="text-gradient-aurora">AI Alpha Playbook</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono tracking-wider uppercase animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">
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
                onClick={() => {
                  playClick();
                  setSelectedTicker(t);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-electric text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-105'
                    : 'glass-panel specular-border text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
                id={`ticker-pill-${t.id}`}
              >
                <span>${t.id.replace('USD', '')}</span>
                <span className={`text-[9px] uppercase px-1 rounded ${isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-surface text-outline'}`}>
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
        <div className="lg:col-span-3 flex flex-col glass-panel specular-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Chart Subheader with Timeframe Selectors */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle/80 bg-surface-container-low/50">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-on-surface tracking-wide">
                {selectedTicker.name} ({selectedTicker.symbol})
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-electric animate-pulse"></span>
              <span className="font-body text-xs text-on-surface-variant">Real-Time Candlestick Feed</span>
            </div>

            <div className="flex items-center gap-1 bg-surface-container-high/40 p-1 rounded-xl border border-border-subtle/60">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.interval}
                  onClick={() => {
                    playClick();
                    setSelectedInterval(tf.interval);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedInterval === tf.interval
                      ? 'bg-accent-electric text-black shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* TradingView Dynamic Embed */}
          <div className="h-[460px] w-full bg-surface-container-lowest relative">
            <iframe
              key={`${selectedTicker.symbol}-${selectedInterval}`}
              title="TradingView Real-Time Chart"
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_embed&symbol=${encodeURIComponent(
                selectedTicker.symbol
              )}&interval=${selectedInterval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0b0f19&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%22paneProperties.background%22%3A%22%230b0f19%22%2C%22paneProperties.vertGridProperties.color%22%3A%22%23161d2b%22%2C%22paneProperties.horzGridProperties.color%22%3A%22%23161d2b%22%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        {/* AI Alpha Playbook Card (1 Col) */}
        <div className="flex flex-col gap-4">
          {currentSignal && (
            <TiltCard
              spotlightColor={currentSignal.action_type === 'bullish' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}
              borderGlowColor={currentSignal.action_type === 'bullish' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(244, 63, 94, 0.6)'}
              tiltIntensity={8}
              className="p-5 flex flex-col gap-4 border-beam-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">
                  AI Trade Setup
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border shadow-sm ${
                  currentSignal.action_type === 'bullish' 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {currentSignal.action}
                </span>
              </div>

              <div>
                <div className="text-2xl font-bold font-mono text-on-surface">
                  ${currentSignal.ticker}
                </div>
                <div className="text-xs text-on-surface-variant font-body">
                  {currentSignal.name} &bull; {currentSignal.timeframe}
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
                <span className="text-emerald-400 font-bold">{currentSignal.volume_surge} Vol Surge</span>
              </div>
            </TiltCard>
          )}

          {/* Quick Telegram Bot Ping Card */}
          <div className="glass-panel specular-border rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-electric/15 flex items-center justify-center text-accent-electric shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </div>
              <div>
                <div className="text-xs font-bold text-on-surface font-mono">Instant Telegram Ping</div>
                <div className="text-[11px] text-on-surface-variant font-body">Forward setup to Telegram</div>
              </div>
            </div>
            <button
              onClick={() => {
                playClick();
                window.open('https://t.me', '_blank');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-accent-electric/15 hover:bg-accent-electric text-accent-electric hover:text-black border border-accent-electric/30 text-xs font-bold font-mono transition-all cursor-pointer shadow-sm btn-shimmer"
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
                onClick={() => {
                  playClick();
                  setActiveFilter(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-accent-electric to-primary-fixed-dim text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-105'
                    : 'glass-panel specular-border text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSignals.map((sig) => (
            <TiltCard
              key={sig.id}
              spotlightColor={sig.action_type === 'bullish' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}
              borderGlowColor={sig.action_type === 'bullish' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'}
              tiltIntensity={6}
              className="p-5 flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-on-surface group-hover:text-accent-electric transition-colors">
                      ${sig.ticker}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-container-high/80 text-outline border border-border-subtle">
                      {sig.asset_class.split('/')[0]}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant font-body">{sig.name}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border shadow-sm ${
                  sig.action_type === 'bullish'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {sig.action}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container-low/70 p-2.5 rounded-xl text-center font-mono text-[11px] border border-border-subtle/50">
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

              <div className="text-xs font-body text-on-surface-variant line-clamp-2 leading-relaxed">
                {sig.catalyst}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-outline pt-2 border-t border-border-subtle/50">
                <span className="text-emerald-400 font-semibold">{sig.win_rate_180d} Win Rate</span>
                <span>RRR {sig.risk_reward}</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
}

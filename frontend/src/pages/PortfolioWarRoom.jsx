import { useState, useEffect } from 'react';
import { analyzePortfolio } from '../services/api';
import TiltCard from '../components/TiltCard';
import { playClick, playSuccess } from '../utils/soundEffects';

const DEFAULT_HOLDINGS = [
  { ticker: 'NVDA', quantity: 15, buy_price: 112.50 },
  { ticker: 'BTC', quantity: 0.45, buy_price: 59200.00 },
  { ticker: 'AAPL', quantity: 20, buy_price: 215.00 },
  { ticker: 'TSLA', quantity: 12, buy_price: 230.00 }
];

const PRESETS = [
  {
    name: 'Tech Alpha Momentum',
    icon: 'memory',
    holdings: [
      { ticker: 'NVDA', quantity: 20, buy_price: 114.00 },
      { ticker: 'AAPL', quantity: 15, buy_price: 216.00 },
      { ticker: 'MSFT', quantity: 10, buy_price: 435.00 }
    ]
  },
  {
    name: 'Crypto Web3 High-Beta',
    icon: 'currency_bitcoin',
    holdings: [
      { ticker: 'BTC', quantity: 0.85, buy_price: 61000.00 },
      { ticker: 'ETH', quantity: 5.0, buy_price: 3200.00 }
    ]
  },
  {
    name: 'Balanced All-Weather',
    icon: 'balance',
    holdings: [
      { ticker: 'SPY', quantity: 25, buy_price: 540.00 },
      { ticker: 'AAPL', quantity: 15, buy_price: 218.00 },
      { ticker: 'BTC', quantity: 0.2, buy_price: 63000.00 }
    ]
  }
];

export default function PortfolioWarRoom() {
  const [holdings, setHoldings] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseiq_portfolio');
      return saved ? JSON.parse(saved) : DEFAULT_HOLDINGS;
    } catch {
      return DEFAULT_HOLDINGS;
    }
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form input state
  const [tickerInput, setTickerInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  // Persist and re-analyze
  useEffect(() => {
    try {
      localStorage.setItem('pulseiq_portfolio', JSON.stringify(holdings));
    } catch {}

    async function runAnalysis() {
      setLoading(true);
      const res = await analyzePortfolio(holdings);
      setAnalysis(res);
      setLoading(false);
    }
    runAnalysis();
  }, [holdings]);

  const handleAddHolding = (e) => {
    e.preventDefault();
    if (!tickerInput || !qtyInput || !priceInput) return;
    playSuccess();
    const newH = {
      ticker: tickerInput.toUpperCase().trim(),
      quantity: parseFloat(qtyInput),
      buy_price: parseFloat(priceInput)
    };
    setHoldings(prev => [...prev, newH]);
    setTickerInput('');
    setQtyInput('');
    setPriceInput('');
  };

  const handleRemoveHolding = (index) => {
    playClick();
    setHoldings(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadPreset = (presetHoldings) => {
    playClick();
    setHoldings(presetHoldings);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in" id="portfolio-war-room-page">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel specular-border p-5 rounded-2xl border-beam-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/30 to-rose-500/25 border border-amber-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <span className="material-symbols-outlined text-amber-300 text-[28px]">shield</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
                Portfolio War Room & <span className="text-gradient-aurora">Risk Exposure Simulator</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-electric/15 text-accent-electric border border-accent-electric/30 text-[10px] font-bold font-mono tracking-wider uppercase shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                Active Simulation
              </span>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Real-time portfolio stress-testing: calculates exact dollar vulnerability to breaking black-swan and momentum headlines.
            </p>
          </div>
        </div>

        {/* 1-Click Sample Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-outline uppercase font-semibold">Load Presets:</span>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleLoadPreset(p.holdings)}
              className="px-3 py-1.5 rounded-xl glass-panel specular-border text-on-surface-variant hover:text-on-surface hover:bg-white/10 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
            >
              <span className="material-symbols-outlined text-[14px] text-accent-electric">{p.icon}</span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Metric Summary Cards */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TiltCard
            spotlightColor="rgba(0, 242, 254, 0.22)"
            borderGlowColor="rgba(0, 242, 254, 0.5)"
            tiltIntensity={9}
            className="p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-mono text-outline uppercase font-semibold">Total Portfolio Value</span>
            <div className="text-2xl md:text-3xl font-bold font-mono text-on-surface mt-1 drop-shadow-sm">
              ${analysis.total_current_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-on-surface-variant mt-1">
              Invested Cost Basis: ${analysis.total_invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </TiltCard>

          <TiltCard
            spotlightColor={analysis.total_pnl >= 0 ? "rgba(16, 185, 129, 0.22)" : "rgba(244, 63, 94, 0.22)"}
            borderGlowColor={analysis.total_pnl >= 0 ? "rgba(16, 185, 129, 0.5)" : "rgba(244, 63, 94, 0.5)"}
            tiltIntensity={9}
            className="p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-mono text-outline uppercase font-semibold">Net Unrealized P&L</span>
            <div className={`text-2xl md:text-3xl font-bold font-mono mt-1 drop-shadow-sm ${
              analysis.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {analysis.total_pnl >= 0 ? '+' : ''}${analysis.total_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-[11px] font-mono font-semibold mt-1 ${
              analysis.total_pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {analysis.total_pnl_pct >= 0 ? '▲' : '▼'} {analysis.total_pnl_pct.toFixed(2)}% Net Return
            </div>
          </TiltCard>

          <TiltCard
            spotlightColor="rgba(163, 112, 255, 0.22)"
            borderGlowColor="rgba(163, 112, 255, 0.5)"
            tiltIntensity={9}
            className="p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-mono text-outline uppercase font-semibold">Weighted Sentiment Exposure</span>
            <div className="text-2xl md:text-3xl font-bold font-mono text-accent-electric mt-1 drop-shadow-sm">
              {(analysis.net_sentiment_score * 100).toFixed(0)} <span className="text-base text-outline">/ 100</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
              {analysis.net_sentiment_bias}
            </div>
          </TiltCard>

          <TiltCard
            spotlightColor="rgba(245, 158, 11, 0.22)"
            borderGlowColor="rgba(245, 158, 11, 0.5)"
            tiltIntensity={9}
            className="p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-mono text-outline uppercase font-semibold">Sector Concentration Risk</span>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div style={{ width: `${analysis.risk_exposure.tech_pct}%` }} className="bg-accent-electric" title="Tech"></div>
                <div style={{ width: `${analysis.risk_exposure.crypto_pct}%` }} className="bg-amber-400" title="Crypto"></div>
                <div style={{ width: `${analysis.risk_exposure.broad_pct}%` }} className="bg-emerald-400" title="Broad"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-outline mt-1.5">
              <span>Tech {analysis.risk_exposure.tech_pct}%</span>
              <span>Crypto {analysis.risk_exposure.crypto_pct}%</span>
              <span>Broad {analysis.risk_exposure.broad_pct}%</span>
            </div>
          </TiltCard>
        </div>
      )}

      {/* Urgent War Room Alerts Banner */}
      {analysis && analysis.war_room_alerts && analysis.war_room_alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] animate-pulse">crisis_alert</span>
            Personalized Breaking News Impact on Your Positions:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.war_room_alerts.map((alert, idx) => (
              <TiltCard
                key={idx}
                spotlightColor="rgba(245, 158, 11, 0.25)"
                borderGlowColor="rgba(245, 158, 11, 0.6)"
                tiltIntensity={7}
                className="bg-gradient-to-r from-amber-500/15 via-surface/85 to-surface/65 border border-amber-500/40 p-4 flex flex-col justify-between gap-2 border-beam-card"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/30">
                    ${alert.ticker} Position Impact
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {alert.portfolio_impact}
                  </span>
                </div>
                <p className="text-xs font-body text-on-surface font-medium leading-snug">
                  {alert.headline}
                </p>
                <div className="text-[11px] font-mono text-amber-200/90 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  <span><strong>AI Strategy:</strong> {alert.recommended_action}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      )}

      {/* Holdings Manager & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table (2 Cols) */}
        <div className="lg:col-span-2 glass-panel specular-border rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-electric">account_balance_wallet</span>
              Your Active Holdings ({holdings.length})
            </h2>
            <span className="text-[11px] font-mono text-outline">Persisted in Local Terminal Storage</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border-subtle/80 text-outline text-[10px] uppercase">
                  <th className="pb-3 font-semibold">Asset</th>
                  <th className="pb-3 font-semibold">Quantity</th>
                  <th className="pb-3 font-semibold">Buy Price</th>
                  <th className="pb-3 font-semibold">Live Price</th>
                  <th className="pb-3 font-semibold">P&L</th>
                  <th className="pb-3 font-semibold">Sentiment</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/40">
                {analysis && analysis.holdings.map((h, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-bold text-on-surface">${h.ticker}</td>
                    <td className="py-3 text-on-surface-variant">{h.quantity}</td>
                    <td className="py-3 text-on-surface-variant">${h.buy_price.toFixed(2)}</td>
                    <td className="py-3 font-semibold text-accent-electric">${h.current_price.toFixed(2)}</td>
                    <td className={`py-3 font-semibold ${h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)} ({h.pnl_pct.toFixed(1)}%)
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        {h.sentiment} ({h.sentiment_score})
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemoveHolding(index)}
                        className="text-rose-400/80 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove holding"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Holding Form (1 Col) */}
        <div className="glass-panel specular-border rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-accent-electric">add_circle</span>
              Add Custom Asset
            </h2>
            <p className="font-body text-xs text-on-surface-variant">
              Input any stock or token to monitor live sentiment stress tests.
            </p>
          </div>

          <form onSubmit={handleAddHolding} className="flex flex-col gap-3 font-mono text-xs">
            <div>
              <label className="text-[10px] text-outline uppercase font-semibold block mb-1">Ticker Symbol</label>
              <input
                type="text"
                placeholder="e.g. NVDA, BTC, AAPL"
                value={tickerInput}
                onChange={e => setTickerInput(e.target.value)}
                className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-accent-electric uppercase transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-outline uppercase font-semibold block mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 10 or 0.5"
                value={qtyInput}
                onChange={e => setQtyInput(e.target.value)}
                className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-accent-electric transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-outline uppercase font-semibold block mb-1">Average Buy Price ($)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 120.50"
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                className="w-full bg-surface-container-low border border-border-subtle rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-accent-electric transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 bg-accent-electric text-black font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent-electric/25 hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Add To War Room
            </button>
          </form>

          <div className="text-[11px] font-body text-outline bg-surface-container-low/70 p-3 rounded-xl border border-border-subtle/50 leading-relaxed">
            💡 <strong>Pro Tip:</strong> PulseIQ auto-fetches live quotes and correlates breaking news against all stored positions continuously.
          </div>
        </div>
      </div>
    </div>
  );
}

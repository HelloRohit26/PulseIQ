import { useState } from 'react';
import { checkHeadlineCredibility } from '../services/api';

const SAMPLES = [
  { label: 'Verified News', text: 'Reuters: TSMC accelerates sub-2nm foundry allocation for tier-1 hyperscalers.' },
  { label: 'Whale Trap Rumor', text: 'URGENT LEAK: Insider claims token is going 1000x to the moon tomorrow guaranteed!' },
  { label: 'Developing Story', text: 'European regulators draft initial oversight framework for frontier AI developers.' }
];

export default function ManipulationRadar() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleAudit = async (customText) => {
    const query = (customText || inputText).trim();
    if (!query) return;
    setScanning(true);
    const res = await checkHeadlineCredibility(query);
    setResult(res);
    setScanning(false);
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-5" id="manipulation-radar-widget">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-rose-400 text-[24px]">radar</span>
          </div>
          <div>
            <h2 className="font-headline text-base md:text-lg font-bold text-on-surface flex items-center gap-2">
              Market Manipulation & <span className="text-rose-400">Whale Trap Radar</span>
            </h2>
            <p className="font-body text-xs text-on-surface-variant">
              Cross-references breaking social rumors against SEC EDGAR 8-K filings and algorithmic bot networks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-outline uppercase font-semibold">Test Sample:</span>
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(s.text);
                handleAudit(s.text);
              }}
              className="px-2 py-1 rounded bg-surface-container border border-border-subtle hover:border-accent-electric text-[11px] font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Paste any headline, tweet, or WhatsApp rumor to audit (e.g. 'Company X acquired for $5B')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
            className="w-full bg-surface-container border border-border-subtle rounded-xl px-4 py-3 text-xs md:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-rose-400 font-body"
          />
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => handleAudit()}
          disabled={scanning || !inputText.trim()}
          className="px-5 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            {scanning ? 'progress_activity' : 'search_check'}
          </span>
          {scanning ? 'Auditing...' : 'Run Forensic Audit'}
        </button>
      </div>

      {/* Forensic Audit Results Panel */}
      {result && (
        <div className={`p-5 rounded-2xl border flex flex-col gap-4 animate-fade-in ${
          result.verdict_type === 'safe'
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : result.verdict_type === 'danger'
            ? 'bg-rose-500/10 border-rose-500/40'
            : 'bg-amber-500/5 border-amber-500/30'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle/50 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full animate-ping ${
                result.verdict_type === 'safe' ? 'bg-emerald-400' : result.verdict_type === 'danger' ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                Forensic Verdict: <strong className={
                  result.verdict_type === 'safe' ? 'text-emerald-400' : result.verdict_type === 'danger' ? 'text-rose-400' : 'text-amber-400'
                }>{result.verdict}</strong>
              </span>
            </div>
            <span className="font-mono text-[11px] text-outline">{result.timestamp}</span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-surface/70 p-3 rounded-xl border border-border-subtle/60">
              <div className="text-[10px] text-outline uppercase font-semibold">Credibility Index</div>
              <div className={`text-xl font-bold mt-0.5 ${
                result.credibility_score >= 75 ? 'text-emerald-400' : result.credibility_score < 40 ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {result.credibility_score} / 100
              </div>
            </div>

            <div className="bg-surface/70 p-3 rounded-xl border border-border-subtle/60">
              <div className="text-[10px] text-outline uppercase font-semibold">Bot / Hype Activity</div>
              <div className="text-on-surface font-semibold mt-0.5">{result.bot_activity}</div>
            </div>

            <div className="bg-surface/70 p-3 rounded-xl border border-border-subtle/60">
              <div className="text-[10px] text-outline uppercase font-semibold">Regulatory SEC 8-K</div>
              <div className="text-accent-electric font-semibold mt-0.5">{result.sec_filing_status}</div>
            </div>

            <div className="bg-surface/70 p-3 rounded-xl border border-border-subtle/60">
              <div className="text-[10px] text-outline uppercase font-semibold">Retail Trap Risk</div>
              <div className={`font-semibold mt-0.5 ${
                result.verdict_type === 'danger' ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}>
                {result.retail_trap_risk}
              </div>
            </div>
          </div>

          {/* Forensic Breakdown */}
          <div className="bg-surface/50 p-3.5 rounded-xl border border-border-subtle/50 font-body text-xs flex flex-col gap-1.5">
            <span className="font-mono font-semibold uppercase text-on-surface text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-accent-electric">manage_search</span>
              Forensic Evidence Breakdown:
            </span>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant pl-1">
              {result.forensic_breakdown.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

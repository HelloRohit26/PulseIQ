import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playClick, playSuccess, isSoundEnabled, setSoundEnabled } from '../utils/soundEffects';
import { useTheme } from '../ThemeContext';

export default function CommandPalette({ isOpen, onClose, onOpenAudioBriefing, onOpenTelegramModal }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const commands = [
    // Tickers & Trading
    { id: 't-nvda', group: '📈 Tickers & TradingView', name: 'NVIDIA Corp ($NVDA)', desc: 'Open Candlestick Chart & AI Trade Setup', action: () => navigate('/terminal'), icon: 'candlestick_chart', badge: '$128.45' },
    { id: 't-btc', group: '📈 Tickers & TradingView', name: 'Bitcoin ($BTC/USD)', desc: 'Open Live Candlestick & Spot ETF Playbook', action: () => navigate('/terminal'), icon: 'currency_bitcoin', badge: '$64,820' },
    { id: 't-tsla', group: '📈 Tickers & TradingView', name: 'Tesla Inc ($TSLA)', desc: 'Autonomous Tech Breakout Setup', action: () => navigate('/terminal'), icon: 'electric_bolt', badge: '$242.60' },
    { id: 't-aapl', group: '📈 Tickers & TradingView', name: 'Apple Inc ($AAPL)', desc: 'Device Cycle Accumulation Zone', action: () => navigate('/terminal'), icon: 'smartphone', badge: '$224.50' },
    { id: 't-spy', group: '📈 Tickers & TradingView', name: 'S&P 500 ETF ($SPY)', desc: 'Macro Market Convergence Radar', action: () => navigate('/terminal'), icon: 'trending_up', badge: '$558.20' },

    // Core Workflows
    { id: 'nav-dash', group: '🚀 Terminal Command', name: 'Dashboard Overview', desc: 'Main Institutional Command Center & KPIs', action: () => navigate('/dashboard'), icon: 'grid_view' },
    { id: 'nav-term', group: '🚀 Terminal Command', name: 'TradingView Terminal & Playbook', desc: 'Interactive Candlestick & Trade Signals', action: () => navigate('/terminal'), icon: 'candlestick_chart' },
    { id: 'nav-port', group: '🚀 Terminal Command', name: 'Portfolio War Room', desc: 'Stress-test holdings & personalized shock alerts', action: () => navigate('/portfolio'), icon: 'shield' },
    { id: 'nav-chat', group: '🚀 Terminal Command', name: 'Deep Pulse AI Intel Chat', desc: 'Direct Gemini 3.5 Flash financial intelligence', action: () => navigate('/chat'), icon: 'neurology' },
    { id: 'nav-news', group: '🚀 Terminal Command', name: 'The Digital Chronicle', desc: 'Synthesized daily financial intelligence print', action: () => navigate('/newspaper'), icon: 'menu_book' },
    { id: 'nav-threat', group: '🚀 Terminal Command', name: 'Entity Threat Web', desc: 'Multi-node geopolitical risk correlation', action: () => navigate('/threat-web'), icon: 'hub' },

    // Executive Actions
    { id: 'act-briefing', group: '⚡ Executive Actions', name: 'Play Morning Audio Market Brief', desc: 'Synthesized 60-second voice briefing podcast', action: () => onOpenAudioBriefing && onOpenAudioBriefing(), icon: 'podcasts', badge: 'AUDIO' },
    { id: 'act-telegram', group: '⚡ Executive Actions', name: 'Telegram Alpha Alerts Bot', desc: 'Configure instant push notifications to your phone', action: () => onOpenTelegramModal && onOpenTelegramModal(), icon: 'send', badge: 'BOT' },
    { id: 'act-radar', group: '⚡ Executive Actions', name: 'Whale Trap & Fake News Radar', desc: 'Forensic audit against SEC 8-K filings', action: () => navigate('/dashboard'), icon: 'radar', badge: 'FORENSIC' },

    // System Settings
    { id: 'set-sound', group: '⚙️ Audio & Interface', name: isSoundEnabled() ? 'Disable Cyber Sound FX' : 'Enable Cyber Sound FX', desc: 'Toggle futuristic tactile audio feedback', action: () => { setSoundEnabled(!isSoundEnabled()); playSuccess(); }, icon: isSoundEnabled() ? 'volume_up' : 'volume_off' },
    { id: 'set-theme', group: '⚙️ Audio & Interface', name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, desc: 'Toggle terminal illumination palette', action: () => toggleTheme(), icon: theme === 'dark' ? 'light_mode' : 'dark_mode' },
  ];

  const filtered = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      playClick();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      playClick();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeCommand = (cmd) => {
    playSuccess();
    cmd.action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-background/80 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0B0E14]/95 border border-accent-electric/40 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.15)] overflow-hidden flex flex-col backdrop-blur-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle/80 bg-surface-container-low">
          <span className="material-symbols-outlined text-accent-electric text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a stock ($NVDA, $BTC), feature, action, or setting..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm md:text-base text-on-surface placeholder:text-outline focus:outline-none font-body"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container-high border border-border-subtle text-[11px] font-mono text-outline font-semibold">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border-subtle/30">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-outline">
              No matching command or asset found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'bg-accent-electric/15 border border-accent-electric/40 shadow-sm' 
                      : 'hover:bg-surface-container/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected 
                        ? 'bg-accent-electric/25 border-accent-electric/50 text-accent-electric' 
                        : 'bg-surface-container border-border-subtle text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs md:text-sm font-bold truncate ${
                          isSelected ? 'text-accent-electric' : 'text-on-surface'
                        }`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-outline hidden sm:inline">
                          {item.group}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate font-body">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-border-subtle text-[10px] font-mono font-bold text-emerald-400">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && (
                      <kbd className="px-1.5 py-0.5 rounded bg-accent-electric text-background text-[10px] font-mono font-bold">
                        ↵
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="px-4 py-2.5 bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-outline">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="text-accent-electric">↑</kbd> <kbd className="text-accent-electric">↓</kbd> to navigate</span>
            <span><kbd className="text-accent-electric">Enter</kbd> to select</span>
          </div>
          <span>PulseIQ Global Command Engine</span>
        </div>
      </div>
    </div>
  );
}

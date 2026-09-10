import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { isBackendOnline, fetchExecutiveBriefing, subscribeTelemetry } from '../services/api';
import { useTheme } from '../ThemeContext';
import TelegramAlertsModal from './TelegramAlertsModal';

export default function TopAppBar({ autoRefresh, setAutoRefresh, lastUpdated }) {
  const location = useLocation();
  const [online, setOnline] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dndMode, setDndMode] = useState(false);
  const [cacheFlushed, setCacheFlushed] = useState(false);
  
  // KILLER FEATURE 5: Telegram Alpha Alerts Bot state
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  // FEATURE 6: Executive Audio Briefing state
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const speechRef = useRef(null);

  // FEATURE 1: Live SSE Telemetry pulse state
  const [telemetryPulse, setTelemetryPulse] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const profileMenuRef = useRef(null);
  const toolsMenuRef = useRef(null);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setOnline(isBackendOnline());
    check();
    const id = setInterval(check, 4000);

    // Subscribe to real-time SSE stream
    const unsubscribeSSE = subscribeTelemetry((data) => {
      setTelemetryPulse(data);
    });
    
    // User session
    const userStr = localStorage.getItem('pulseiq_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) {}
    } else {
      const premiumUser = { 
        username: 'Rohit Maurya', 
        full_name: 'Rohit Maurya', 
        role: 'Command System Architect', 
        email: 'rohit.m@pulseiq.ai',
        node: 'US-EAST-KAFKA-01'
      };
      setUser(premiumUser);
      localStorage.setItem('pulseiq_user', JSON.stringify(premiumUser));
    }

    // Load Web Speech synthesis voices
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        const engVoices = available.filter(v => v.lang.startsWith('en'));
        setVoices(engVoices.length > 0 ? engVoices : available);
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      clearInterval(id);
      unsubscribeSSE();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch executive briefing data when modal opens
  useEffect(() => {
    if (audioModalOpen && !briefing) {
      fetchExecutiveBriefing().then(data => setBriefing(data));
    }
  }, [audioModalOpen, briefing]);

  // Audio Playback Controls using Web Speech Synthesis API
  const handlePlayBriefing = () => {
    if (!('speechSynthesis' in window) || !briefing?.script) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(briefing.script);
    utterance.rate = speechRate;
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseBriefing = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPlayingAudio(false);
    }
  };

  const handleStopBriefing = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setToolsMenuOpen(false);
  }, [location.pathname]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target)) {
        setToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFlushCache = () => {
    setCacheFlushed(true);
    setTimeout(() => setCacheFlushed(false), 2500);
  };

  const primaryNavLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Charts & Alpha', path: '/terminal' },
    { label: 'War Room', path: '/portfolio' },
    { label: 'Intel Chat', path: '/chat' },
    { label: 'Chronicle', path: '/newspaper' },
  ];

  const secondaryTools = [
    { label: 'Sector Analysis', path: '/sentiment', icon: 'pie_chart' },
    { label: 'Threat Web Radar', path: '/threat-web', icon: 'hub' },
    { label: 'Historical Signals', path: '/historical', icon: 'monitoring' },
    { label: 'Global Sentiment Map', path: '/map', icon: 'public' },
    { label: 'System Architecture', path: '/architecture', icon: 'account_tree' },
  ];

  const mobileNavLinks = [
    { label: 'Terminal Dashboard', path: '/dashboard', icon: 'grid_view' },
    { label: 'TradingView & Alpha', path: '/terminal', icon: 'candlestick_chart' },
    { label: 'Portfolio War Room', path: '/portfolio', icon: 'shield' },
    { label: 'Deep Pulse AI Chat', path: '/chat', icon: 'neurology' },
    { label: 'The Digital Chronicle', path: '/newspaper', icon: 'menu_book' },
    { label: 'Sector Analysis', path: '/sentiment', icon: 'pie_chart' },
    { label: 'Entity Threat Web', path: '/threat-web', icon: 'hub' },
    { label: 'Historical Signals', path: '/historical', icon: 'monitoring' },
    { label: 'Global Map', path: '/map', icon: 'public' },
    { label: 'System Architecture', path: '/architecture', icon: 'account_tree' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0B0E14]/90 border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)]' 
          : 'bg-white/95 border-slate-200 shadow-sm'
      } backdrop-blur-md border-b`}>
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-[57px] flex items-center justify-between">
          
          {/* Left Block: Logo & Desktop Navigation */}
          <div className="flex items-center gap-5 lg:gap-8 min-w-0">
            <button 
              className={`md:hidden flex items-center justify-center w-8 h-8 rounded-lg ${
                isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
              } transition-colors shrink-0`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu navigation"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <span className="material-symbols-outlined text-accent-electric text-[26px] md:text-[28px] group-hover:rotate-12 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>
                hub
              </span>
              <span className={`font-headline text-xl md:text-2xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Pulse<span className="text-accent-electric">IQ</span>
              </span>
            </Link>

            {/* Decongested Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {primaryNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-body text-[13px] font-semibold tracking-wide transition-all duration-200 relative py-1 whitespace-nowrap ${
                      isActive
                        ? 'text-accent-electric font-bold'
                        : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-accent-electric rounded-full"></span>
                    )}
                  </Link>
                );
              })}

              {/* Analytics & Tools Dropdown */}
              <div className="relative" ref={toolsMenuRef}>
                <button
                  onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                  className={`font-body text-[13px] font-semibold tracking-wide transition-all duration-200 flex items-center gap-1 py-1 whitespace-nowrap cursor-pointer ${
                    secondaryTools.some(t => t.path === location.pathname)
                      ? 'text-accent-electric font-bold'
                      : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
                  }`}
                >
                  <span>More Tools</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${toolsMenuOpen ? 'rotate-180 text-accent-electric' : ''}`}>
                    expand_more
                  </span>
                </button>

                {toolsMenuOpen && (
                  <div className={`absolute left-0 mt-3 w-56 rounded-2xl border ${
                    isDark ? 'bg-[#0F141C] border-[#1E293B] shadow-[0_10px_30px_rgba(0,0,0,0.6)]' : 'bg-white border-slate-200 shadow-xl'
                  } py-2 z-50 backdrop-blur-xl animate-fade-in`}>
                    {secondaryTools.map(tool => {
                      const isItemActive = location.pathname === tool.path;
                      return (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => setToolsMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                            isItemActive
                              ? 'text-accent-electric bg-accent-electric/10 font-bold'
                              : `${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px] text-accent-electric">{tool.icon}</span>
                          <span>{tool.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Block: Live Synced Badges & Quick Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">

            {/* FEATURE 6: Executive AI Audio Briefing Button */}
            <button
              onClick={() => setAudioModalOpen(true)}
              title="Listen to Executive Morning Audio Market Brief"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent-electric/40 text-accent-electric bg-accent-electric/10 hover:bg-accent-electric/20 text-xs font-mono font-bold transition-all duration-300 cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.15)] whitespace-nowrap shrink-0"
            >
              <span className={`material-symbols-outlined text-[15px] ${isPlayingAudio ? 'animate-pulse text-sentiment-positive' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlayingAudio ? 'graphic_eq' : 'podcasts'}
              </span>
              <span className="hidden xl:inline">AI BRIEFING</span>
              {isPlayingAudio && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 h-full bg-accent-electric animate-pulse"></span>
                  <span className="w-0.5 h-2/3 bg-accent-electric animate-pulse" style={{ animationDelay: '100ms' }}></span>
                  <span className="w-0.5 h-full bg-accent-electric animate-pulse" style={{ animationDelay: '200ms' }}></span>
                </span>
              )}
            </button>

            {/* KILLER FEATURE 5: Telegram Alpha Alerts Bot Button */}
            <button
              onClick={() => setTelegramModalOpen(true)}
              title="Configure Instant Telegram Alpha Alerts Bot"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sky-400/40 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-mono font-bold transition-all duration-300 cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.15)] whitespace-nowrap shrink-0"
              id="telegram-bot-header-btn"
            >
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
              <span className="hidden xl:inline">TELEGRAM BOT</span>
            </button>

            {/* Auto-Refresh Toggle Pill */}
            {setAutoRefresh && (
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? 'Live Telemetry Sync Active' : 'Telemetry Paused'}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-all duration-300 ${
                  autoRefresh
                    ? 'border-accent-electric/40 text-accent-electric bg-accent-electric/10 hover:bg-accent-electric/20'
                    : `${isDark ? 'border-white/10 text-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:text-slate-600'}`
                }`}
              >
                <span className={`material-symbols-outlined text-[15px] ${autoRefresh ? 'animate-spin-slow' : ''}`} style={{ fontVariationSettings: autoRefresh ? "'FILL' 1" : "'FILL' 0" }}>
                  sync
                </span>
                <span className="hidden lg:inline">{autoRefresh ? 'SYNC' : 'PAUSED'}</span>
                {autoRefresh && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-electric animate-pulse"></span>
                )}
              </button>
            )}

            {/* Backend Connection Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
              online === null
                ? `${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`
                : online
                  ? 'border-sentiment-positive/30 text-sentiment-positive bg-sentiment-positive/5'
                  : 'border-amber-500/30 text-amber-500 bg-amber-500/5'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                online === null ? 'bg-slate-500 animate-pulse' : online ? 'bg-sentiment-positive animate-pulse' : 'bg-amber-500'
              }`}></span>
              <span>{online === null ? 'PROBING' : online ? 'LIVE' : 'DEMO'}</span>
            </div>

            {/* Sleek Theme Toggle Switch Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isDark ? 'text-amber-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Profile Avatar & Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-expanded={profileMenuOpen}
                aria-label="Toggle intelligent profile menu"
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 group ${
                  profileMenuOpen 
                    ? 'border-accent-electric bg-accent-electric/10 ring-2 ring-accent-electric/30' 
                    : `${isDark ? 'border-[#334155] bg-[#1E293B]/50 hover:border-accent-electric/50 text-slate-300' : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'}`
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                  profileMenuOpen ? 'scale-110 text-accent-electric' : 'group-hover:text-accent-electric'
                }`}>
                  account_circle
                </span>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-sentiment-positive border border-background"></span>
              </button>

              {/* Opened Popover Menu */}
              {profileMenuOpen && (
                <div className={`absolute right-0 mt-3 w-72 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#0F1117]/98 border-[#1E293B] shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-slate-200' 
                    : 'bg-white/98 border-slate-200 shadow-2xl shadow-slate-200/60 text-slate-800'
                } backdrop-blur-2xl p-4 z-50 animate-scale-in divide-y ${
                  isDark ? 'divide-slate-800' : 'divide-slate-100'
                }`}>
                  <div className="pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-electric to-teal-400 flex items-center justify-center text-background font-black text-base shadow-sm">
                        {user ? (user.full_name || user.username).charAt(0) : 'Ω'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate">{user ? (user.full_name || user.username) : 'Terminal Analyst'}</div>
                        <div className="text-[11px] font-mono text-accent-electric truncate">{user?.email || 'analyst@pulseiq.ai'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="py-3 flex flex-col gap-2">
                    <button 
                      onClick={handleFlushCache}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        cacheFlushed 
                          ? 'bg-sentiment-positive/15 text-sentiment-positive' 
                          : `${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Flush Local Telemetry Cache
                      </span>
                      {cacheFlushed && <span className="text-[10px] font-mono">PURGED</span>}
                    </button>
                    <button 
                      onClick={() => setDndMode(!dndMode)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        dndMode 
                          ? 'bg-amber-500/15 text-amber-400' 
                          : `${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">notifications_paused</span>
                        Mute Real-Time Sound Alerts
                      </span>
                      <span className="text-[10px] font-mono">{dndMode ? 'MUTED' : 'LIVE'}</span>
                    </button>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => {
                        localStorage.removeItem('pulseiq_token');
                        localStorage.removeItem('pulseiq_user');
                        window.location.href = '/login/index.html';
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sentiment-negative/10 hover:bg-sentiment-negative/20 text-sentiment-negative font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Secure Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global content buffer */}
      <div className="h-[57px] w-full"></div>

      {/* FEATURE 6: Executive Audio Briefing Modal */}
      {audioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in-up">
          <div className={`w-full max-w-xl rounded-2xl border ${
            isDark ? 'bg-[#0F1117] border-border-subtle text-on-surface' : 'bg-white border-slate-200 text-slate-800'
          } p-6 shadow-2xl relative overflow-hidden`}>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-electric/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-electric to-blue-600 flex items-center justify-center text-background shadow-lg">
                  <span className="material-symbols-outlined text-[24px]">podcasts</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">Executive Morning Briefing</h3>
                  <p className="text-xs font-mono text-accent-electric">{briefing?.date || 'Today\'s Intelligence Summary'}</p>
                </div>
              </div>
              <button 
                onClick={() => { handleStopBriefing(); setAudioModalOpen(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Audio Wave Visualizer Animation */}
            <div className="bg-surface-container-high rounded-xl p-4 mb-4 border border-border-subtle flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={isPlayingAudio ? handlePauseBriefing : handlePlayBriefing}
                  className="w-12 h-12 rounded-full bg-accent-electric text-background flex items-center justify-center font-bold hover:scale-105 transition-transform shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {isPlayingAudio ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  onClick={handleStopBriefing}
                  className="w-9 h-9 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Stop"
                >
                  <span className="material-symbols-outlined text-[18px]">stop</span>
                </button>
              </div>

              {/* Animated Waveform Bars */}
              <div className="flex items-end gap-1 flex-1 h-10 px-3 justify-center">
                {[40, 65, 85, 30, 95, 70, 45, 80, 60, 90, 50, 75, 35, 85, 55].map((h, idx) => (
                  <span 
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlayingAudio ? 'bg-accent-electric animate-pulse' : 'bg-slate-600'
                    }`}
                    style={{ 
                      height: isPlayingAudio ? `${Math.max(15, (h * (idx % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                      animationDelay: `${idx * 60}ms`
                    }}
                  ></span>
                ))}
              </div>

              {/* Playback Rate Toggle */}
              <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border-subtle">
                {[1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => { setSpeechRate(rate); if (isPlayingAudio) handlePlayBriefing(); }}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded ${
                      speechRate === rate ? 'bg-accent-electric text-background' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-accent-electric mb-2 font-body">Executive Takeaways</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {briefing?.key_takeaways?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface/60 border border-border-subtle text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span>
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Synchronized Script Transcript */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1 font-body">Audio Transcript</h4>
              <div className="max-h-32 overflow-y-auto p-3 rounded-lg bg-surface-container-high/50 border border-border-subtle text-xs text-on-surface-variant leading-relaxed">
                {briefing?.script || 'Loading briefing transcript...'}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      <div className={`md:hidden fixed top-[57px] left-0 right-0 z-40 ${
        isDark ? 'bg-[#0B0E14]/98 border-[#1E293B]' : 'bg-white/98 border-slate-200'
      } backdrop-blur-2xl border-b transition-all duration-300 ease-in-out overflow-hidden shadow-2xl ${
        mobileMenuOpen ? 'max-h-[500px] opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
      }`}>
        <nav className="flex flex-col gap-0.5 px-3 max-w-md mx-auto">
          {mobileNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-bold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-electric/15 text-accent-electric'
                    : `${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
          
          <Link 
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-3 bg-accent-electric text-background font-body text-xs font-black uppercase py-3 rounded-xl text-center block shadow-md"
          >
            Launch Deep Pulse Chat
          </Link>
        </nav>
      </div>

      {/* KILLER FEATURE 5: Telegram Alpha Alerts Bot Modal */}
      <TelegramAlertsModal isOpen={telegramModalOpen} onClose={() => setTelegramModalOpen(false)} />
    </>
  );
}

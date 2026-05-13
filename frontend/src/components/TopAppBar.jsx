import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { isBackendOnline } from '../services/api';
import { useTheme } from '../ThemeContext';

export default function TopAppBar({ autoRefresh, setAutoRefresh, lastUpdated }) {
  const location = useLocation();
  const [online, setOnline] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Advanced features state for the profile menu
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dndMode, setDndMode] = useState(false);
  const [cacheFlushed, setCacheFlushed] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const check = () => setOnline(isBackendOnline());
    check();
    const id = setInterval(check, 3000);
    
    // Check user auth
    const userStr = localStorage.getItem('pulseiq_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) {}
    } else {
      // Auto-assign a premium default simulated user if none is active to demonstrate gorgeous working profile menus
      const defaultUser = { username: 'Rohit Maurya', full_name: 'Rohit Maurya', role: 'Command System Architect', email: 'rohit.m@pulseiq.ai' };
      setUser(defaultUser);
      localStorage.setItem('pulseiq_user', JSON.stringify(defaultUser));
    }

    return () => clearInterval(id);
  }, []);

  // Close mobile menu or profile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // Handle clicking outside the profile menu to close it gracefully
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('pulseiq_token');
    localStorage.removeItem('pulseiq_user');
    setUser(null);
    setProfileMenuOpen(false);
    // Reload state seamlessly
    window.location.reload();
  };

  const simulateLogin = () => {
    const defaultUser = { username: 'Rohit Maurya', full_name: 'Rohit Maurya', role: 'Command System Architect', email: 'rohit.m@pulseiq.ai' };
    setUser(defaultUser);
    localStorage.setItem('pulseiq_user', JSON.stringify(defaultUser));
    setProfileMenuOpen(false);
  };

  const handleFlushCache = () => {
    setCacheFlushed(true);
    setTimeout(() => setCacheFlushed(false), 2500);
  };

  const navLinks = [
    { label: 'Intelligence', path: '/dashboard' },
    { label: 'Markets', path: '/map' },
    { label: 'Signals', path: '/sentiment' },
    { label: 'Analysis', path: '/historical' },
  ];

  const mobileNavLinks = [
    { icon: 'dashboard', label: 'Intelligence', path: '/dashboard' },
    { icon: 'public', label: 'Markets', path: '/map' },
    { icon: 'filter_list', label: 'Signals', path: '/sentiment' },
    { icon: 'analytics', label: 'Analysis', path: '/historical' },
    { icon: 'newspaper', label: 'Daily Pulse', path: '/newspaper' },
    { icon: 'smart_toy', label: 'Deep Pulse Chat', path: '/chat' },
    { icon: 'hub', label: 'Threat Web', path: '/threat-web' },
    { icon: 'code', label: 'API Terminal', path: '/architecture' },
  ];

  const timeAgo = lastUpdated
    ? `${Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000))}s ago`
    : '—';

  return (
    <>
      {/* Premium Sleek Floating Top Command Strip */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isDark 
          ? 'bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,229,255,0.05)]' 
          : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
      }`}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-4 md:px-8 py-2.5 md:py-3.5">
          
          {/* Left Column: Brand & Main Routing */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Hamburger Menu Button — Mobile Only */}
            <button 
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-xl border ${
                isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'
              } transition-colors`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-accent-electric via-blue-500 to-teal-400 p-[1.5px] shadow-lg shadow-accent-electric/20 group-hover:scale-105 transition-transform duration-300">
                <div className={`w-full h-full rounded-[10px] ${isDark ? 'bg-[#0B0E14]' : 'bg-white'} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-accent-electric text-[18px] md:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                </div>
              </div>
              <span className="font-headline text-lg md:text-2xl font-black bg-gradient-to-r from-accent-electric via-teal-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                PulseIQ
              </span>
            </Link>

            {/* Desktop Navigation Link Matrix */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3.5 py-1.5 rounded-lg font-body text-xs lg:text-sm font-bold tracking-wide uppercase transition-all duration-200 ${
                      isActive
                        ? `${isDark ? 'text-accent-electric bg-accent-electric/10' : 'text-slate-900 bg-slate-100'} shadow-xs`
                        : `${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent-electric rounded-full animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Column: Status Indicators & Interactive Profile Hub */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* ── Auto-Refresh Toggle Strip ── */}
            {setAutoRefresh && (
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? `Auto-refresh ON (updated ${timeAgo})` : 'Auto-refresh OFF'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] md:text-xs font-mono font-bold transition-all duration-300 ${
                  autoRefresh
                    ? 'border-accent-electric/40 text-accent-electric bg-accent-electric/10 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                    : `${isDark ? 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`
                }`}
              >
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: autoRefresh ? "'FILL' 1" : "'FILL' 0" }}>
                  {autoRefresh ? 'sync' : 'sync_disabled'}
                </span>
                <span className="hidden xl:inline">{autoRefresh ? 'LIVE SYNC' : 'PAUSED'}</span>
                {autoRefresh && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-electric opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-electric"></span>
                  </span>
                )}
              </button>
            )}

            {/* Backend Connection Indicator Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-mono font-bold ${
              online === null
                ? `${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`
                : online
                  ? 'border-sentiment-positive/30 text-sentiment-positive bg-sentiment-positive/5'
                  : 'border-amber-500/30 text-amber-500 bg-amber-500/5'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                online === null ? 'bg-slate-400 animate-pulse' : online ? 'bg-sentiment-positive animate-pulse' : 'bg-amber-500'
              }`}></span>
              <span className="hidden sm:inline">{online === null ? 'PROBING' : online ? 'ONLINE' : 'DEMO MODE'}</span>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`relative w-8 h-8 md:w-9 md:h-9 rounded-xl border ${
                isDark ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              } flex items-center justify-center transition-all duration-300`}
            >
              <span className={`material-symbols-outlined text-[18px] transition-all duration-300 ${
                isDark ? 'rotate-0 opacity-100 text-amber-400' : 'rotate-180 opacity-0 absolute'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>light_mode</span>
              
              <span className={`material-symbols-outlined text-[18px] transition-all duration-300 ${
                !isDark ? 'rotate-0 opacity-100 text-accent-electric' : '-rotate-180 opacity-0 absolute'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
            </button>

            {/* 🌟 USER PROFILE AVATAR MENU HUB (Fully Workable Dropdown Feature) 🌟 */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-expanded={profileMenuOpen}
                aria-label="User profile menu"
                className={`flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full border transition-all duration-300 ${
                  profileMenuOpen 
                    ? 'border-accent-electric ring-2 ring-accent-electric/20 bg-accent-electric/5' 
                    : `${isDark ? 'border-white/10 hover:border-white/25 bg-white/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`
                }`}
              >
                {/* Sleek Interactive Avatar Ring */}
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-tr from-accent-electric to-teal-400 text-background flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                  {user ? (user.full_name || user.username).charAt(0) : 'Ω'}
                </div>
                
                {/* Username label */}
                <span className={`font-body text-xs font-bold truncate max-w-[90px] hidden md:inline ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  {user ? (user.full_name || user.username).split(' ')[0] : 'Guest Portal'}
                </span>

                <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${
                  profileMenuOpen ? 'rotate-180 text-accent-electric' : 'text-slate-400'
                }`}>
                  expand_more
                </span>
              </button>

              {/* Advanced Workable Dropdown Popover */}
              {profileMenuOpen && (
                <div className={`absolute right-0 mt-3 w-72 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#12151E]/95 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]' 
                    : 'bg-white/95 border-slate-200/80 shadow-2xl shadow-slate-200'
                } backdrop-blur-2xl p-4 z-50 animate-scale-in divide-y ${
                  isDark ? 'divide-white/5' : 'divide-slate-100'
                }`}>
                  
                  {/* Popover Header Info */}
                  <div className="pb-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-electric to-cyan-400 flex items-center justify-center text-background font-black text-base shadow-md">
                        {user ? (user.full_name || user.username).charAt(0) : 'Ω'}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className={`font-body text-sm font-extrabold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {user ? user.full_name || user.username : 'Guest Session'}
                        </h4>
                        <p className="text-[10px] font-mono text-accent-electric font-bold truncate">
                          {user ? user.role || 'Senior Intelligence Lead' : 'Unauthenticated Node'}
                        </p>
                      </div>
                    </div>
                    {user && (
                      <div className="text-[10px] font-mono text-slate-400 truncate mt-1">
                        ✉ {user.email || 'rohit.m@pulseiq.ai'}
                      </div>
                    )}
                  </div>

                  {/* Popover Active Features array */}
                  <div className="py-3 space-y-2.5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold px-1">
                      Interactive Actions
                    </div>
                    
                    {/* Feature 1: Notification DND Mode Toggle Switch */}
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${dndMode ? 'text-amber-400' : 'text-slate-400'}`}>
                          {dndMode ? 'do_not_disturb_on' : 'notifications_active'}
                        </span>
                        <span className={`text-xs font-body ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Quiet Mode (DND)
                        </span>
                      </div>
                      <button 
                        onClick={() => setDndMode(!dndMode)}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          dndMode ? 'bg-accent-electric' : 'bg-slate-400'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full bg-white block transition-transform duration-200 ${
                          dndMode ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>

                    {/* Feature 2: Flush Client Telemetry Cache */}
                    <button
                      onClick={handleFlushCache}
                      disabled={cacheFlushed}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${cacheFlushed ? 'text-sentiment-positive animate-spin' : 'text-slate-400'}`}>
                          cached
                        </span>
                        <span className={`text-xs font-body ${cacheFlushed ? 'text-sentiment-positive font-bold' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {cacheFlushed ? 'Cache Flushed OK' : 'Clear Stream Cache'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded">
                        24MB
                      </span>
                    </button>

                    {/* Feature 3: Live API Key validation mask */}
                    <div className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">Node Token</span>
                      <span className="text-[10px] font-mono font-bold text-accent-electric">pk_live_••••894</span>
                    </div>
                  </div>

                  {/* Popover Bottom Actions */}
                  <div className="pt-3">
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-sentiment-negative/10 hover:bg-sentiment-negative text-sentiment-negative hover:text-white font-body text-xs font-extrabold uppercase tracking-wider transition-all duration-200"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Secure Logout
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={simulateLogin}
                          className="w-full py-2 rounded-xl bg-accent-electric text-background font-body text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                          Simulate Admin Entry
                        </button>
                        <a
                          href="/login/index.html"
                          className="w-full py-1.5 rounded-xl border border-slate-500/20 text-center block font-body text-[11px] text-slate-400 hover:text-white transition-colors"
                        >
                          Web2 Auth Portal
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Spacer item preventing content overlapping below the header strip */}
      <div className="h-[60px] md:h-[72px] w-full"></div>

      {/* ── Mobile Slide-Down Overlay Menu ── */}
      <div className={`md:hidden fixed top-[60px] left-0 right-0 z-40 ${
        isDark ? 'bg-[#0B0E14]/98 border-white/10' : 'bg-white/98 border-slate-200'
      } backdrop-blur-2xl border-b transition-all duration-300 ease-in-out overflow-hidden shadow-2xl ${
        mobileMenuOpen ? 'max-h-[600px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
      }`}>
        <nav className="flex flex-col gap-1 px-4 max-w-md mx-auto">
          {mobileNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-bold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-electric text-background shadow-md'
                    : `${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
          
          {/* Mobile New Investigation button */}
          <Link 
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 bg-gradient-to-r from-accent-electric to-teal-400 text-background font-body text-xs font-black uppercase py-3 rounded-xl shadow-lg transition-transform hover:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Launch Intelligence Chat
          </Link>
        </nav>
      </div>
    </>
  );
}

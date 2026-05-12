import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isBackendOnline } from '../services/api';

export default function TopAppBar({ autoRefresh, setAutoRefresh, lastUpdated }) {
  const location = useLocation();
  const [online, setOnline] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setOnline(isBackendOnline());
    check();
    const id = setInterval(check, 3000);
    
    // Check user auth
    const userStr = localStorage.getItem('pulseiq_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) {}
    }

    return () => clearInterval(id);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('pulseiq_token');
    localStorage.removeItem('pulseiq_user');
    setUser(null);
    window.location.reload();
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
      <header className="bg-background/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-border-subtle flex justify-between items-center px-4 md:px-(--spacing-container-margin) py-3 md:py-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Hamburger Menu Button — Mobile Only */}
          <button 
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-white text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link to="/" className="font-headline text-[24px] md:text-[32px] font-bold text-accent-electric tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-accent-electric text-[24px] md:text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            PulseIQ
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-[16px] font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-accent-electric font-bold border-b-2 border-accent-electric pb-1'
                    : 'text-on-surface-variant hover:text-primary-fixed'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-3 text-primary-fixed-dim">

          {/* ── Auto-Refresh Toggle ── */}
          {setAutoRefresh && (
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? `Auto-refresh ON (updated ${timeAgo})` : 'Auto-refresh OFF'}
              className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-full border text-xs font-ticker font-bold transition-all duration-300 ${
                autoRefresh
                  ? 'border-accent-electric/40 text-accent-electric bg-accent-electric/10 hover:bg-accent-electric/20'
                  : 'border-border-subtle text-on-surface-variant hover:border-on-surface-variant/40 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: autoRefresh ? "'FILL' 1" : "'FILL' 0" }}>
                {autoRefresh ? 'sync' : 'sync_disabled'}
              </span>
              <span className="hidden sm:inline">{autoRefresh ? 'LIVE SYNC' : 'PAUSED'}</span>
              {autoRefresh && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-electric opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-electric"></span>
                </span>
              )}
            </button>
          )}

          {/* Backend Status Indicator */}
          <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-full border text-[10px] md:text-xs font-ticker font-bold ${
            online === null
              ? 'border-border-subtle text-on-surface-variant'
              : online
                ? 'border-sentiment-positive/30 text-sentiment-positive bg-sentiment-positive/5'
                : 'border-tertiary-container/30 text-tertiary-container bg-tertiary-container/5'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              online === null ? 'bg-on-surface-variant animate-pulse' : online ? 'bg-sentiment-positive animate-pulse' : 'bg-tertiary-container'
            }`}></span>
            <span className="hidden xs:inline">{online === null ? 'CHECKING' : online ? 'LIVE' : 'DEMO MODE'}</span>
            <span className="xs:hidden">{online === null ? '...' : online ? '●' : 'DEMO'}</span>
          </div>
          
          {/* Icons — hide some on mobile */}
          <button className="hidden sm:block hover:text-accent-electric transition-colors duration-200 hover:scale-95" title="Live Sensors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
          </button>
          <button className="hover:text-accent-electric transition-colors duration-200 relative" title="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-accent-electric rounded-full"></span>
          </button>
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-surface-container/50 px-3 py-1 rounded-full border border-border-subtle" title={`Logged in as ${user.full_name || user.username}`}>
                <div className="w-6 h-6 rounded-full bg-accent-electric text-background flex items-center justify-center font-bold text-xs uppercase">
                  {(user.full_name || user.username).charAt(0)}
                </div>
                <span className="font-body text-xs font-semibold text-on-surface">
                  {user.full_name || user.username}
                </span>
              </div>
              {/* Mobile: just avatar */}
              <div className="sm:hidden w-8 h-8 rounded-full bg-accent-electric text-background flex items-center justify-center font-bold text-sm uppercase">
                {(user.full_name || user.username).charAt(0)}
              </div>
              <button onClick={handleLogout} className="hover:text-sentiment-negative transition-colors duration-200" title="Logout">
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <a href="/login/index.html" className="hover:text-accent-electric transition-colors duration-200 flex items-center gap-2" title="Sign In">
              <span className="material-symbols-outlined">account_circle</span>
            </a>
          )}
        </div>
      </header>

      {/* ── Mobile Slide-Down Menu ── */}
      <div className={`md:hidden fixed top-[57px] left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border-subtle transition-all duration-300 ease-in-out overflow-hidden ${
        mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="flex flex-col py-3 px-4">
          {mobileNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-body text-[14px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-electric/15 text-accent-electric'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
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
            className="mt-3 mx-4 bg-accent-electric text-background font-body text-[13px] font-semibold uppercase py-3 rounded-xl hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Investigation
          </Link>
        </nav>
      </div>
    </>
  );
}

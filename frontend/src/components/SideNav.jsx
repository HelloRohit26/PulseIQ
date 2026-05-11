import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: 'newspaper', label: 'Daily Pulse', path: '/newspaper' },
  { icon: 'smart_toy', label: 'Deep Pulse Chat', path: '/chat' },
  { icon: 'filter_list', label: 'Sector Filters', path: '/dashboard' },
  { icon: 'analytics', label: 'Sentiment Map', path: '/map' },
  { icon: 'hub', label: 'Threat Web', path: '/threat-web' },
  { icon: 'history', label: 'Historical', path: '/historical' },
  { icon: 'code', label: 'API Terminal', path: '/architecture' },
];

export default function SideNav() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col bg-surface fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 border-r border-border-subtle py-6 justify-between z-40">
      <div>
        <div className="px-4 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
            <span className="material-symbols-outlined text-accent-electric" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <h2 className="font-ticker text-[14px] font-bold text-accent-electric uppercase">AI Terminal</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Gemini Ultra Active</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 font-body text-[12px] font-semibold tracking-[0.05em] uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-secondary-container/20 text-accent-electric border-r-4 border-accent-electric'
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-4">
        <Link 
          to="/chat"
          className="w-full bg-accent-electric text-background font-body text-[12px] font-semibold tracking-[0.05em] uppercase py-3 rounded hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Investigation
        </Link>
      </div>
    </aside>
  );
}

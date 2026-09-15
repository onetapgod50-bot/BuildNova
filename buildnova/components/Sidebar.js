'use client';

const ICONS = {
  dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  projects: 'M4 7h16M4 12h10M4 17h7',
  create: 'M12 5v14M5 12h14',
  blueprint: 'M4 4h16v16H4zM8 4v16M4 10h16',
  progress: 'M4 20V10M11 20V4M18 20v-7',
  reports: 'M6 3h9l3 3v15H6zM14 3v4h4',
  ai: 'M4 4h16v11H8l-4 4V4Z',
  bell: 'M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 0 0 4 0',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  supervisors: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21a6 6 0 0 1 12 0M14 21a6 6 0 0 1 9-5.2',
  resources: 'M3 7l9-4 9 4-9 4-9-4ZM3 7v10l9 4 9-4V7',
  requests: 'M8 4h8l3 4v12H5V8Z M8 12h8M8 16h5',
  photo: 'M4 7h3l2-3h6l2 3h3v13H4Z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'
};

function Icon({ name, className }) {
  const d = ICONS[name] || ICONS.dashboard;
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d={d} />
    </svg>
  );
}

export default function Sidebar({ role, roleLabel, items, active, onSelect }) {
  return (
    <aside className="hidden md:flex h-screen w-60 flex-none flex-col border-r border-ink-800 bg-evergreen-950 text-paper-100 sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-ink-800/60">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-site-green text-ink-950 font-display font-bold">
          B
        </span>
        <div>
          <p className="font-display text-sm font-semibold leading-none">BuildNova</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-paper-100/50">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const isActive = active === item.key;
          if (item.action === 'ai') {
            return (
              <button
                key={item.key}
                onClick={() => window.dispatchEvent(new Event('open-ai-chat'))}
                className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-paper-100/80 hover:bg-evergreen-900 hover:text-paper-50 transition-colors"
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            );
          }
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-site-green/15 text-site-green border-l-2 border-site-green'
                  : 'text-paper-100/80 hover:bg-evergreen-900 hover:text-paper-50 border-l-2 border-transparent'
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-ink-800/60 px-5 py-4">
        <p className="text-[10px] text-paper-100/40 font-mono">v1.0.0 · demo data</p>
      </div>
    </aside>
  );
}

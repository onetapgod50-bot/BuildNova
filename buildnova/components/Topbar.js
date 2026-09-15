'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/lib/auth-context';

export default function Topbar({ title, notifications, items, active, onSelect }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-paper-200 dark:border-ink-800 bg-paper-50/90 dark:bg-ink-950/90 backdrop-blur px-4 md:px-6 py-3">
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-sm border border-paper-200 dark:border-ink-700"
        aria-label="Open menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="font-display text-lg font-semibold text-ink-900 dark:text-paper-50">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell notifications={notifications} />
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-sm border border-paper-200 dark:border-ink-700 px-2 py-1.5 hover:border-site-green"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-evergreen-800 text-[11px] font-medium text-paper-50">
              {user?.name?.[0] || '?'}
            </span>
            <span className="hidden sm:block text-sm">{user?.name || 'Guest'}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 z-30 mt-2 w-48 card p-1 shadow-lg">
              <p className="px-3 py-2 text-xs text-ink-500">{user?.email}</p>
              <button
                onClick={handleLogout}
                className="w-full rounded-sm px-3 py-2 text-left text-sm text-site-red hover:bg-paper-100 dark:hover:bg-ink-800"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-evergreen-950 text-paper-100 p-4">
            <button onClick={() => setMobileOpen(false)} className="mb-4 text-sm text-paper-100/70">
              Close ✕
            </button>
            <nav className="space-y-0.5">
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.action === 'ai') {
                      window.dispatchEvent(new Event('open-ai-chat'));
                    } else {
                      onSelect(item.key);
                    }
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center rounded-sm px-3 py-2 text-sm ${
                    active === item.key ? 'bg-site-green/15 text-site-green' : 'text-paper-100/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

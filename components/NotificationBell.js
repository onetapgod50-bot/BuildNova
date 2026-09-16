'use client';

import { useEffect, useRef, useState } from 'react';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = items.filter((n) => !n.read_status).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read_status: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-paper-200 dark:border-ink-700 text-ink-700 dark:text-paper-100 hover:border-site-green"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-site-red px-1 text-[10px] font-mono text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 card p-0 shadow-lg">
          <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-800 px-4 py-3">
            <p className="font-display text-sm font-semibold">Notifications</p>
            <button onClick={markAllRead} className="text-xs text-site-green hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-500">You&apos;re all caught up.</p>
            )}
            {items.map((n) => (
              <div
                key={n.notification_id}
                className={`border-b border-paper-100 dark:border-ink-800 px-4 py-3 text-sm last:border-0 ${
                  n.read_status ? 'opacity-60' : ''
                }`}
              >
                <p className="text-ink-900 dark:text-paper-50">{n.message}</p>
                <p className="mt-1 font-mono text-[11px] text-ink-500">{timeAgo(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

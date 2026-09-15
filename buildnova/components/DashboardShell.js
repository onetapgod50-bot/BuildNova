'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatWidget from './AIChatWidget';

export default function DashboardShell({ roleLabel, title, items, active, onSelect, notifications, children }) {
  return (
    <div className="flex min-h-screen bg-paper-50 dark:bg-ink-950">
      <Sidebar roleLabel={roleLabel} items={items} active={active} onSelect={onSelect} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} notifications={notifications} items={items} active={active} onSelect={onSelect} />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
      <AIChatWidget />
    </div>
  );
}

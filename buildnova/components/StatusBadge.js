const STATUS_MAP = {
  not_started: { label: 'Not Started', cls: 'border-ink-300 text-ink-500 dark:border-ink-700 dark:text-ink-300' },
  in_progress: { label: 'In Progress', cls: 'border-site-blue text-site-blue' },
  completed: { label: 'Completed', cls: 'border-site-green text-site-green' },
  delayed: { label: 'Delayed', cls: 'border-site-red text-site-red' },
  on_hold: { label: 'On Hold', cls: 'border-site-amber text-site-amber' },
  pending_verification: { label: 'Pending Verification', cls: 'border-site-amber text-site-amber' },
  planning: { label: 'Planning', cls: 'border-site-blue text-site-blue' },
  pending: { label: 'Pending', cls: 'border-site-amber text-site-amber' },
  approved: { label: 'Approved', cls: 'border-site-green text-site-green' },
  rejected: { label: 'Rejected', cls: 'border-site-red text-site-red' }
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'border-ink-300 text-ink-500' };
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}

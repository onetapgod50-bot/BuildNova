export default function StatCard({ label, value, sub, tone = 'green' }) {
  const bars = {
    green: 'bg-site-green',
    amber: 'bg-site-amber',
    red: 'bg-site-red',
    blue: 'bg-site-blue'
  };
  return (
    <div className="card relative overflow-hidden p-4">
      <span className={`absolute left-0 top-0 h-full w-1 ${bars[tone] || bars.green}`} />
      <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-300 pl-2">{label}</p>
      <p className="mt-2 pl-2 font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 data-figure">
        {value}
      </p>
      {sub && <p className="mt-1 pl-2 text-xs text-ink-500 dark:text-ink-300">{sub}</p>}
    </div>
  );
}

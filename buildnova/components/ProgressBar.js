export default function ProgressBar({ value = 0, tone = 'green', size = 'md' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tones = {
    green: 'bg-site-green',
    amber: 'bg-site-amber',
    red: 'bg-site-red',
    blue: 'bg-site-blue'
  };
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className={`w-full ${height} rounded-full bg-paper-200 dark:bg-ink-800 overflow-hidden`}>
        <div
          className={`${height} ${tones[tone] || tones.green} rounded-full transition-[width] duration-500`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

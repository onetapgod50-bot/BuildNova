export default function DonutChart({ value = 0, label, size = 140, stroke = 14, tone = '#3FA65B' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-paper-200 dark:text-ink-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-ink-900 dark:fill-paper-50"
          style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.19, fontWeight: 600 }}
        >
          {value}%
        </text>
      </svg>
      {label && <p className="mt-2 text-xs text-ink-500 dark:text-ink-300">{label}</p>}
    </div>
  );
}

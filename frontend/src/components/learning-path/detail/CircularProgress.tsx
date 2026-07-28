interface CircularProgressProps {
  value: number;
  size?: number;
}

export default function CircularProgress({ value, size = 100 }: CircularProgressProps) {
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const cx = size / 2, cy = size / 2;
  
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E11D48" strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 18, fontWeight: 700, fill: '#ffffffff', transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
        {value}%
      </text>
    </svg>
  );
}

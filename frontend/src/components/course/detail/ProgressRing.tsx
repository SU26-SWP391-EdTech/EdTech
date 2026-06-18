interface ProgressRingProps {
  percent: number;
}

export function ProgressRing({ percent }: ProgressRingProps) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative w-[64px] h-[64px] flex-shrink-0">
      <svg viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#F1F5F9" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r={r} stroke="#E11D48" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-[#111827]" style={{ fontWeight: 700 }}>{percent}%</span>
      </div>
    </div>
  );
}

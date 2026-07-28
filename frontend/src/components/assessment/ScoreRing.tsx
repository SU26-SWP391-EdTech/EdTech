interface ScoreRingProps {
    score: number;
    size?: number;
}

export function ScoreRing({ score, size = 110 }: ScoreRingProps) {
    const r = size * 0.42; // Radius
    const circ = 2 * Math.PI * r;
    const color = '#4F46E5'; // Indigo Points Color
    const innerTextSize = Math.round(size * 0.22);
    const labelSize = Math.round(size * 0.09);

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth={size * 0.06}
                />
                {/* Score Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={size * 0.06}
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - score / 100)}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: innerTextSize, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{score}%</span>
                <span style={{ fontSize: labelSize, color: '#64748B', fontWeight: 600, marginTop: 4, letterSpacing: '0.5px' }}>
                    SCORE
                </span>
            </div>
        </div>
    );
}

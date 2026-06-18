const CircularMini = ({ value, color = '#E11D48', size = 44 }: { value: number; color?: string; size?: number }) => {
    const sw = 4;
    const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const cx = size / 2, cy = size / 2;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 10, fontWeight: 700, fill: '#111827', transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
                {value}%
            </text>
        </svg>
    );
};

export default CircularMini;

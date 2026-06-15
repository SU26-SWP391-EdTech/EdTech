import type { CourseStatus } from "../../../types/course/provider.types";

const StatusGuide = () => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'] as CourseStatus[]).map(s => {
                const cfg = STATUS_CFG[s];
                return (
                    <div key={s} style={{ background: '#fff', border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 18, fontWeight: 700, color: cfg.color, lineHeight: 1.2 }}>{counts[s]}</p>
                            <p style={{ fontSize: 12, color: '#6B7280' }}>{cfg.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default StatusGuide;
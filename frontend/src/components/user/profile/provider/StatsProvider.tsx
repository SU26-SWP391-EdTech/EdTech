import { BookOpen, GraduationCap, Award } from 'lucide-react';
import type { ProviderStatsProps } from '../../../types/user/provider-profile.types';

const StatsProvider = ({ coursesCount, approvedCount, totalEnrollments }: ProviderStatsProps) => {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Teaching Stats</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                    { icon: BookOpen, label: 'Courses Published', value: coursesCount, color: '#7C3AED' },
                    { icon: GraduationCap, label: 'Approved Courses', value: approvedCount, color: '#16A34A' },
                    { icon: Award, label: 'Total Enrollments', value: totalEnrollments.toLocaleString(), color: '#E11D48' },
                ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <s.icon size={15} style={{ color: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12.5, color: '#6B7280' }}>{s.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsProvider;

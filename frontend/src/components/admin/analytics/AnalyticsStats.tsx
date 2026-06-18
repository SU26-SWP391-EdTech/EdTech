import { Users, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { AnalyticsData } from '../../../services/admin/admin.service';

interface AnalyticsStatsProps {
    stats: AnalyticsData['stats'];
    currentMonthName: string;
}

export function AnalyticsStats({ stats, currentMonthName }: AnalyticsStatsProps) {
    const statCards = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: stats.totalUsersChange, icon: Users, color: '#E11D48', bg: '#FFF1F3' },
        { label: 'Total Enrollments', value: stats.totalEnrollments.toLocaleString(), change: stats.totalEnrollmentsChange, icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Approved Courses', value: stats.approvedCourses.toLocaleString(), change: stats.approvedCoursesChange, icon: BookOpen, color: '#2563EB', bg: '#EFF6FF' },
        { label: `Completions (${currentMonthName})`, value: stats.completionsThisMonth.toLocaleString(), change: stats.completionsChange, icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
            {statCards.map(s => {
                const IconComponent = s.icon;
                return (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconComponent size={16} style={{ color: s.color }} />
                            </div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 7px', borderRadius: 20 }}>
                                {s.change} this month
                            </span>
                        </div>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{s.value}</p>
                        <p style={{ fontSize: 12.5, color: '#6B7280' }}>{s.label}</p>
                    </div>
                );
            })}
        </div>
    );
}

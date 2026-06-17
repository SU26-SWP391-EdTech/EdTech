import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getAdminAnalyticsStats } from '../../services/admin/admin.service';
import type { AnalyticsData } from '../../services/admin/admin.service';

export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminAnalyticsStats()
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F8FAFC' }}>
                <p style={{ fontSize: 14, color: '#6B7280' }}>Loading analytics...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F8FAFC' }}>
                <p style={{ fontSize: 14, color: '#DC2626' }}>Failed to load analytics data.</p>
            </div>
        );
    }

    const { stats, activityData, topCourses } = data;
    const currentMonthName = activityData[activityData.length - 1]?.month || 'Jun';

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '28px 32px' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', marginBottom: 4 }}>Analytics</h1>
                <p style={{ fontSize: 13.5, color: '#6B7280' }}>Platform performance overview · {currentMonthName} 2026</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
                {[
                    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: stats.totalUsersChange, icon: Users, color: '#E11D48', bg: '#FFF1F3' },
                    { label: 'Total Enrollments', value: stats.totalEnrollments.toLocaleString(), change: stats.totalEnrollmentsChange, icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF' },
                    { label: 'Approved Courses', value: stats.approvedCourses.toLocaleString(), change: stats.approvedCoursesChange, icon: BookOpen, color: '#2563EB', bg: '#EFF6FF' },
                    { label: `Completions (${currentMonthName})`, value: stats.completionsThisMonth.toLocaleString(), change: stats.completionsChange, icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={16} style={{ color: s.color }} /></div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 7px', borderRadius: 20 }}>{s.change} this month</span>
                        </div>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{s.value}</p>
                        <p style={{ fontSize: 12.5, color: '#6B7280' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 22px' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Enrollments & Completions</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>6-month trend</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                            <Line type="monotone" dataKey="enrollments" stroke="#E11D48" strokeWidth={2} dot={false} name="Enrollments" />
                            <Line type="monotone" dataKey="completions" stroke="#16A34A" strokeWidth={2} dot={false} name="Completions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 22px' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>User Growth</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>New registrations per month</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={activityData} barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                            <Bar dataKey="users" fill="#E11D48" radius={[4, 4, 0, 0]} name="Users" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top courses */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}><p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Top Courses by Enrollment</p></div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        {['Course', 'Enrollments', 'Completion Rate'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {topCourses.map((c, i) => (
                            <tr key={c.courseId} style={{ borderBottom: i < topCourses.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500, color: '#111827' }}>{c.title}</td>
                                <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{c.enrollmentCount.toLocaleString()}</td>
                                <td style={{ padding: '13px 16px' }}><span style={{ fontSize: 13, fontWeight: 600, color: c.completionRate >= 0.7 ? '#16A34A' : '#D97706' }}>{Math.round(c.completionRate * 100)}%</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

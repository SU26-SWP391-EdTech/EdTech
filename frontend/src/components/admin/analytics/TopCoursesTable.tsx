import type { AnalyticsData } from '../../../services/admin/admin.service';

interface TopCoursesTableProps {
    topCourses: AnalyticsData['topCourses'];
}

export function TopCoursesTable({ topCourses }: TopCoursesTableProps) {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Top Courses by Enrollment</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        {['Course', 'Enrollments', 'Completion Rate'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {topCourses.map((c, i) => (
                        <tr key={c.courseId} style={{ borderBottom: i < topCourses.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                            <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500, color: '#111827' }}>{c.title}</td>
                            <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{c.enrollmentCount.toLocaleString()}</td>
                            <td style={{ padding: '13px 16px' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: c.completionRate >= 0.7 ? '#16A34A' : '#D97706' }}>
                                    {Math.round(c.completionRate * 100)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsData } from '../../../services/admin/admin.service';

interface EnrollmentTrendChartProps {
    activityData: AnalyticsData['activityData'];
}

export function EnrollmentTrendChart({ activityData }: EnrollmentTrendChartProps) {
    return (
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
    );
}

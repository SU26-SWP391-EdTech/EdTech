import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsData } from '../../../services/admin/admin.service';

interface UserGrowthChartProps {
    activityData: AnalyticsData['activityData'];
}

export function UserGrowthChart({ activityData }: UserGrowthChartProps) {
    return (
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
    );
}

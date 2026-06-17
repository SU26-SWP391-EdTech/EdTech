import { useEffect, useState } from 'react';
import { getAdminAnalyticsStats } from '../../services/admin/admin.service';
import type { AnalyticsData } from '../../services/admin/admin.service';
import { AnalyticsStats } from '../../components/admin/analytics/AnalyticsStats';
import { EnrollmentTrendChart } from '../../components/admin/analytics/EnrollmentTrendChart';
import { UserGrowthChart } from '../../components/admin/analytics/UserGrowthChart';
import { TopCoursesTable } from '../../components/admin/analytics/TopCoursesTable';

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
            <AnalyticsStats stats={stats} currentMonthName={currentMonthName} />

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <EnrollmentTrendChart activityData={activityData} />
                <UserGrowthChart activityData={activityData} />
            </div>

            {/* Top courses */}
            <TopCoursesTable topCourses={topCourses} />
        </div>
    );
}

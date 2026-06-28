import { Outlet, type RouteObject } from 'react-router-dom';
import { AdminGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { PlatformSettings } from '../pages/admin/PlatformSettings';
import { PlatformSetup } from '../pages/admin/PlatformSetup';
import { UserManagement } from '../pages/admin/UserManagement';
import { Dashboard } from '../pages/admin/AdminDashBoard';
import { AnalyticsDashboard } from '../pages/admin/AdminAnalytics';
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage';

export const adminRoutes: RouteObject = {
    path: '/admin',
    element: (
        <AdminGuard>
            <Outlet />
        </AdminGuard>
    ),
    children: [
        {
            element: <DashboardLayout role="admin" />,
            children: [
                { index: true, element: <Dashboard /> },
                { path: 'usermanagement', element: <UserManagement /> },
                { path: 'analytics', element: <AnalyticsDashboard /> },
                { path: 'adminprofile', element: <AdminProfile /> },
                { path: 'settings', element: <PlatformSettings /> },
                { path: 'leaderboard', element: <LeaderboardPage /> },
            ],
        },
        { path: 'setup', element: <PlatformSetup /> },
    ],
};

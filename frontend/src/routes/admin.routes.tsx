import type { RouteObject } from 'react-router-dom';
import { AdminGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { PlatformSettings } from '../pages/admin/PlatformSettings';
import { PlatformSetup } from '../pages/admin/PlatformSetup';
import { UserManagement } from '../pages/admin/UserManagement';
import { LessonPage } from '../pages/lesson/LessonPage';
import { ProviderProfile } from '../pages/user/ProviderProfile';
import { Dashboard } from '../pages/admin/AdminDashBoard';
import { AnalyticsDashboard } from '../pages/admin/AdminAnalytics';

export const adminRoutes: RouteObject = {
    path: '/admin',
    element: (
        <AdminGuard>
            <DashboardLayout role="admin" />
        </AdminGuard>
    ),
    children: [
        { index: true, element: <Dashboard /> },
        { path: 'usermanagement', element: <UserManagement /> },
        { path: 'analytics', element: <AnalyticsDashboard /> },
        { path: 'adminprofile', element: <AdminProfile /> },
        { path: 'settings', element: <PlatformSettings /> },
        { path: 'lesson', element: <LessonPage /> },
        { path: 'providers/:id', element: <ProviderProfile /> },
        { path: 'setup', element: <PlatformSetup /> },
    ],
};

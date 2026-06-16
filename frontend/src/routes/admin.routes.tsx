import type { RouteObject } from 'react-router-dom';
import { AdminGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { PlatformSettings } from '../pages/admin/PlatformSettings';
import { PlatformSetup } from '../pages/admin/PlatformSetup';
import { UserManagement } from '../pages/admin/UserManagement';
import { ProviderProfile } from '../pages/user/ProviderProfile';

export const adminRoutes: RouteObject = {
    path: '/admin',
    element: (
        <AdminGuard>
            <DashboardLayout role="admin" />
        </AdminGuard>
    ),
    children: [
        { index: true, element: <h1>Home Admin</h1> },
        { path: 'usermanagement', element: <UserManagement /> },
        { path: 'analytics', element: <h1>Analytics Admin</h1> },
        { path: 'adminprofile', element: <AdminProfile /> },
        { path: 'settings', element: <PlatformSettings /> },
        { path: 'providers/:id', element: <ProviderProfile /> },
        { path: 'setup', element: <PlatformSetup /> },
    ],
};

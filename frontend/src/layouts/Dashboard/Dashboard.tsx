import { Outlet, useLocation } from 'react-router-dom';
import { RoleHeader } from '../../components/RoleHeader';
import type { Role } from '../../types/role/roleNav.types';

interface DashboardLayoutProps {
    role: Role;
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
    const { pathname } = useLocation();
    const isFullWidthPage = pathname.includes('/learning-path/');

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <RoleHeader role={role} />

            <main className={isFullWidthPage ? "" : "max-w-[1440px] mx-auto px-6 py-6"}>
                <Outlet />
            </main>
        </div>
    );
}
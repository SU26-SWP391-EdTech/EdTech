import { Outlet, useLocation } from 'react-router-dom';
import { RoleHeader } from '../../components/RoleHeader';
import { ScrollToTop } from '../../components/shared/ScrollToTop';
import type { Role } from '../../types/role/roleNav.types';
import { PvpProvider } from '../../context/PvpContext';

interface DashboardLayoutProps {
    role: Role;
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
    const { pathname } = useLocation();
    const isFullWidthPage = pathname.includes('/learning-path/');

    const content = (
        <div className="min-h-screen bg-[#F8FAFC]">
            <ScrollToTop />
            <div className="sticky top-0 z-50">
                <RoleHeader role={role} />
            </div>

            <main className={isFullWidthPage ? "" : "max-w-[1440px] mx-auto px-6 py-6"}>
                <Outlet />
            </main>
        </div>
    );

    if (role === 'learner') {
        return <PvpProvider>{content}</PvpProvider>;
    }

    return content;
}

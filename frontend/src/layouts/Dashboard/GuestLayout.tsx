import { Outlet } from 'react-router-dom';
import { GuestHeader } from '../../components';
import { ScrollToTop } from '../../components/shared/ScrollToTop';

export function GuestLayout() {
    return (
        <div className="min-h-screen bg-white">
            <ScrollToTop />
            <div className="sticky top-0 z-50">
                <GuestHeader />
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

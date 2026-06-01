import { Outlet } from 'react-router-dom';
import { GuestHeader } from '../../components';

export function GuestLayout() {
    return (
        <div className="min-h-screen bg-white">
            <GuestHeader />

            <main>
                <Outlet />
            </main>
        </div>
    );
}
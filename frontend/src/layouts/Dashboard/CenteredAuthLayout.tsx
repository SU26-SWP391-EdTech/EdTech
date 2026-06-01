import { Outlet } from 'react-router-dom';

export function CenteredAuthLayout() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                <Outlet />
            </div>
        </div>
    );
}

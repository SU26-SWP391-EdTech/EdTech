import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle, Settings, BarChart2 } from 'lucide-react';

import { Logo } from '../shared/Logo';
import { NotifBell } from '../shared/NotifBell';
import { NavItem } from '../shared/NavItem';
import { ACADEMIC_MANAGER_NAV } from '../config/nav-config';
import { useAuthStore } from '../../../stores/auth/auth.stores';

export function AcademicManagerHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [open, setOpen] = useState(false);

    // Determine active item based on current URL path
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/academic') return 'dashboard';
        if (path === '/academic/pending-courses') return 'pending-courses';
        if (path === '/academic/courses') return 'courses';
        if (path === '/academic/learning-paths') return 'learning-paths';
        return '';
    };

    const active = getActiveTab();

    const ACC = '#D97706'; // Academic Manager Accent: Amber
    const ACTIVE_BG = '#FEF3C7';

    return (
        <div className="bg-white border-b border-[#E5E7EB] shadow-sm">
            <div className="w-full px-8 h-[72px] flex items-center gap-4">
                <Logo variant="academic" />

                <div className="w-px h-5 bg-[#E5E7EB] mx-1 flex-shrink-0" />

                <nav className="flex items-center gap-1">
                    {ACADEMIC_MANAGER_NAV.map((item) => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            active={active === item.id}
                            accentColor={ACC}
                            activeBg={ACTIVE_BG}
                            badge={(item as any).badge}
                            count={(item as any).count}
                            onClick={() => {
                                if (item.id === 'courses') {
                                    navigate('/academic/courses');
                                } else if (item.id === 'pending-courses') {
                                    navigate('/academic/pending-courses');
                                } else if (item.id === 'learning-paths') {
                                    navigate('/academic/learning-paths');
                                } else if (item.id === 'dashboard') {
                                    navigate('/academic');
                                }
                            }}
                        />
                    ))}
                </nav>

                <div className="flex-1" />

                {/* <NotifBell count={8} accentColor={ACC} /> */}

                <div className="w-px h-5 bg-[#E5E7EB] flex-shrink-0" />

                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                    >
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#D97706] flex items-center justify-center text-white text-xs font-bold">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'M'}
                            </div>
                        )}

                        <div className="hidden xl:block text-left">
                            <p className="text-xs text-[#111827] leading-none font-medium">
                                {user?.fullName || 'Manager'}
                            </p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none">
                                Academic Manager
                            </p>
                        </div>

                        <ChevronDown
                            className={`w-3 h-3 text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {open && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                                <div className="px-4 py-3 border-b border-[#F3F4F6] bg-[#FEFDF0]">
                                    <p className="text-sm text-[#111827] font-semibold">{user?.fullName || 'Academic Manager'}</p>
                                    <p className="text-xs text-[#9CA3AF]">{user?.email || 'manager@learningpath.com'}</p>
                                </div>

                                {[
                                    { icon: <UserCircle className="w-4 h-4" />, label: 'My Profile', onClick: () => navigate('/academic/userprofile') },
                                    { icon: <UserCircle className="w-4 h-4" />, label: 'My Dashboard' },
                                    { icon: <BarChart2 className="w-4 h-4" />, label: 'Analytics' },
                                    { icon: <Settings className="w-4 h-4" />, label: 'Review Rules' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => {
                                            if (item.onClick) item.onClick();
                                            setOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC] transition-colors"
                                    >
                                        <span className="text-[#9CA3AF]">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}

                                <div className="border-t border-[#F3F4F6] mt-1">
                                    <button 
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#E11D48] hover:bg-[#FFF1F3] transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

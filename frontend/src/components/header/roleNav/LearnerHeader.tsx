import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Play, Flame, ChevronDown, LogOut, UserCircle, BookOpen, Settings } from 'lucide-react';

import { Logo } from '../shared/Logo';
import { SearchBar } from '../shared/SearchBar';
import { NotifBell } from '../shared/NotifBell';
import { NavItem } from '../shared/NavItem';
import { LEARNER_NAV } from '../config/nav-config';
import { useAuthStore } from '../../../stores/auth.stores';

export function LearnerHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [open, setOpen] = useState(false);

    // Determine active item based on current URL path
    const getActiveTab = () => {
        if (location.pathname.includes('/my-learning')) return 'my-learning';
        if (location.pathname.includes('/explore')) return 'explore';
        if (location.pathname.includes('/paths')) return 'paths';
        return 'dashboard';
    };

    const active = getActiveTab();

    const ACC = '#E11D48';
    const ACTIVE_BG = '#FFF1F3';

    return (
        <div className="bg-white border-b border-[#E5E7EB] shadow-sm">
            <div className="w-full px-8 h-[72px] flex items-center gap-4">
                <Logo variant="default" />

                <div className="w-px h-5 bg-[#E5E7EB] mx-1 flex-shrink-0" />

                <nav className="flex items-center gap-1">
                    {LEARNER_NAV.map((item) => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            active={active === item.id}
                            accentColor={ACC}
                            activeBg={ACTIVE_BG}
                            badge={item.badge}
                            onClick={() => {
                                if (item.id === 'my-learning') {
                                    navigate('/learner/my-learning');
                                } else if (item.id === 'explore') {
                                    navigate('/learner/explore');
                                } else if (item.id === 'paths') {
                                    navigate('/learner/explore');
                                }
                            }}
                        />
                    ))}
                </nav>

                <div className="flex-1" />

                <SearchBar placeholder="Search courses, paths..." accentColor={ACC} />

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex-shrink-0">
                    <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                    <span className="text-xs text-[#D97706] font-bold">7</span>
                </div>

                <NotifBell count={3} accentColor={ACC} />

                <button className="p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                    <MessageSquare style={{ width: 18, height: 18, color: '#6B7280' }} />
                </button>

                <div className="w-px h-5 bg-[#E5E7EB] flex-shrink-0" />

                <button
                    onClick={() => navigate('/learner/my-learning')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm flex-shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        backgroundColor: ACC,
                        fontWeight: 500,
                        boxShadow: `0 2px 8px ${ACC}35`,
                    }}
                >
                    <Play className="w-3.5 h-3.5" />
                    Continue Learning
                </button>

                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#E11D48] flex items-center justify-center text-white text-xs font-bold">
                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'L'}
                        </div>

                        <div className="hidden xl:block text-left">
                            <p className="text-xs text-[#111827] leading-none font-medium">
                                {user?.fullName || 'Your User Name'}
                            </p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none">
                                Level 4 · 40%
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
                                <div className="px-4 py-3 border-b border-[#F3F4F6] bg-[#FFF8F9]">
                                    <p className="text-sm text-[#111827] font-semibold">{user?.fullName || 'Your User Name'}</p>
                                    <p className="text-xs text-[#9CA3AF]">{user?.email || 'user@student.vn'}</p>
                                </div>

                                {[
                                    { icon: <UserCircle className="w-4 h-4" />, label: 'My Profile', onClick: () => navigate('/learner/learnerprofile') },
                                    { icon: <BookOpen className="w-4 h-4" />, label: 'My Learning', onClick: () => navigate('/learner/my-learning') },
                                    { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
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
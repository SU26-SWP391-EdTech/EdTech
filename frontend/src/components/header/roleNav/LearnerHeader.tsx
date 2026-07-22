import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle, BookOpen, Settings } from 'lucide-react';

import { Logo } from '../shared/Logo';
import { NotifBell } from '../shared/NotifBell';
import { NavItem } from '../shared/NavItem';
import { LEARNER_NAV } from '../config/nav-config';
import { useAuthStore } from '../../../stores/auth/auth.stores';
import { getUserRoleLabel } from '../../../utils/user/roleUtils';
import { getLearnerProfile } from '../../../services/learner/learner.services';
import StreakFlame from '../../user/dashboard/learner/StreakFlame';

export function LearnerHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [open, setOpen] = useState(false);
    const roleLabel = getUserRoleLabel(user, 'Learner');

    // Determine active item based on current URL path
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/learner/my-learning') return 'my-learning';
        if (path === '/learner/explore') return 'explore';
        if (path === '/learner/leaderboard') return 'leaderboard';
        if (path.includes('/learner/pvp')) return 'pvp';
        return '';
    };

    const active = getActiveTab();

    const ACC = '#E11D48';
    const ACTIVE_BG = '#FFF1F3';

    const [streak, setStreak] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            getLearnerProfile(user.userId)
                .then((profileData) => {
                    setStreak(profileData.currentStreak ?? 0);
                })
                .catch(() => {
                    setStreak(0);
                });
        }
    }, [user]);


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
                            onClick={() => {
                                if (item.id === 'my-learning') {
                                    navigate('/learner/my-learning');
                                } else if (item.id === 'explore') {
                                    navigate('/learner/explore');
                                } else if (item.id === 'leaderboard') {
                                    navigate('/learner/leaderboard');
                                } else if (item.id === 'pvp') {
                                    navigate('/learner/pvp');
                                }
                            }}
                        />
                    ))}
                </nav>

                <div className="flex-1" />

                {streak !== null && (
                    <div 
                        onClick={() => navigate('/learner')}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF8F9] border border-[#FFE4E6] rounded-xl flex-shrink-0 cursor-pointer hover:bg-[#FFF1F3] transition-colors"
                        title="Xem chi tiết Streak của bạn"
                    >
                        <StreakFlame streak={streak} size="sm" />
                        <span className="text-xs text-[#374151] font-extrabold select-none">{streak}</span>
                    </div>
                )}

                {/* <NotifBell count={3} accentColor={ACC} /> */}

                <div className="w-px h-5 bg-[#E5E7EB] flex-shrink-0" />

                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                    >
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#E11D48] flex items-center justify-center text-white text-xs font-bold">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'L'}
                            </div>
                        )}

                        <div className="hidden xl:block text-left">
                            <p className="text-xs text-[#111827] leading-none font-medium">
                                {user?.fullName || 'Your User Name'}
                            </p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none">
                                {roleLabel}
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

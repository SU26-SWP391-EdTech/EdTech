import { useNavigate, useLocation } from 'react-router-dom';
import { Play } from 'lucide-react';

import { Logo } from '../shared/Logo';
import { NavItem } from '../shared/NavItem';
import { GUEST_NAV } from '../config/nav-config';

export function GuestHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/explore') return 'explore';
        if (path === '/about') return 'about';
        if (path === '/leaderboard') return 'leaderboard';
        return '';
    };

    const active = getActiveTab();

    const ACC = '#E11D48'; // Guest/Default Accent: Crimson
    const ACTIVE_BG = '#FFF1F3';

    return (
        <div className="bg-white border-b border-[#E5E7EB] shadow-sm">
            <div className="w-full px-8 h-[72px] flex-row flex items-center gap-4">
                <Logo variant="default" />

                <div className="w-px h-5 bg-[#E5E7EB] mx-1 flex-shrink-0" />

                <nav className="flex items-center gap-1">
                    {GUEST_NAV.map((item) => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            active={active === item.id}
                            accentColor={ACC}
                            activeBg={ACTIVE_BG}
                            onClick={() => {
                                if (item.id === 'explore') {
                                    navigate('/explore');
                                } else if (item.id === 'leaderboard') {
                                    navigate('/leaderboard');
                                }
                            }}
                        />
                    ))}
                </nav>

                <div className="flex-1" />

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-4 py-2 border border-[#E5E7EB] bg-white rounded-xl text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        Sign In
                    </button>
                    
                    <button
                        onClick={() => window.location.href = '/register'}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        style={{
                            backgroundColor: ACC,
                            fontWeight: 600,
                            boxShadow: `0 2px 8px ${ACC}35`,
                        }}
                    >
                        <Play className="w-3.5 h-3.5 fill-current text-white" />
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}

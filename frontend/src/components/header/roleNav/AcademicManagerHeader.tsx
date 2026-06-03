import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle, Settings, BarChart2 } from 'lucide-react';

import { Logo } from '../shared/Logo';
import { SearchBar } from '../shared/SearchBar';
import { NotifBell } from '../shared/NotifBell';
import { NavItem } from '../shared/NavItem';
import { ACADEMIC_MANAGER_NAV } from '../config/nav-config';

export function AcademicManagerHeader() {
    const navigate = useNavigate();
    const [active, setActive] = useState('dashboard');
    const [open, setOpen] = useState(false);

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
                            onClick={() => setActive(item.id)}
                        />
                    ))}
                </nav>

                <div className="flex-1" />

                <SearchBar placeholder="Search submissions, paths..." accentColor={ACC} />

                <NotifBell count={8} accentColor={ACC} />

                <div className="w-px h-5 bg-[#E5E7EB] flex-shrink-0" />

                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#D97706] flex items-center justify-center text-white text-xs font-bold">
                            M
                        </div>

                        <div className="hidden xl:block text-left">
                            <p className="text-xs text-[#111827] leading-none font-medium">
                                Manager
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
                                    <p className="text-sm text-[#111827] font-semibold">Academic Manager</p>
                                    <p className="text-xs text-[#9CA3AF]">manager@learningpath.com</p>
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
                                        onClick={() => window.location.href = '/login'}
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

import type { ReactNode } from 'react';

interface NavItemProps {
    id: string;
    label: string;
    icon: ReactNode;
    active: boolean;
    accentColor: string;
    activeBg: string;
    badge?: string | number;
    count?: string | number;
    countColor?: string;
    onClick: () => void;
}

export function NavItem({
    label,
    icon,
    active,
    accentColor,
    activeBg,
    badge,
    count,
    countColor,
    onClick,
}: NavItemProps) {
    const displayCount = badge ?? count;

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all group ${active
                    ? ''
                    : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F8FAFC]'
                }`}
            style={{
                backgroundColor: active ? activeBg : undefined,
                color: active ? accentColor : undefined,
                fontWeight: active ? 600 : 400,
            }}
        >
            <span
                style={{
                    color: active ? accentColor : '#9CA3AF',
                }}
                className="group-hover:text-[#6B7280]"
            >
                {icon}
            </span>

            {label}

            {displayCount !== undefined && (
                <span
                    className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px]"
                    style={{
                        backgroundColor: countColor ?? accentColor,
                        fontWeight: 700,
                    }}
                >
                    {displayCount}
                </span>
            )}
        </button>
    );
}
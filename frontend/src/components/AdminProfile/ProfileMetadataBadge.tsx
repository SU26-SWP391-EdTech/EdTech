import React from 'react';

interface ProfileMetadataBadgeProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    variant?: 'sky' | 'emerald' | 'gray';
}

export function ProfileMetadataBadge({ icon, label, value, variant = 'gray' }: ProfileMetadataBadgeProps) {
    const themeClasses = {
        sky: 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]',
        emerald: 'bg-[#D1FAE5] border-[#A7F3D0] text-[#047857]',
        gray: 'bg-[#F1F5F9] border-[#CBD5E1] text-[#1E293B]',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${themeClasses[variant]}`}>
            {icon}
            {label}: {value}
        </span>
    );
}

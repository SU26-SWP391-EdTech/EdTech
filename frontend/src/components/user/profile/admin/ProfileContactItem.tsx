import React from 'react';

interface ProfileContactItemProps {
    icon: React.ReactNode;
    value: string;
}

export function ProfileContactItem({ icon, value }: ProfileContactItemProps) {
    return (
        <span className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
            {icon}
            {value}
        </span>
    );
}

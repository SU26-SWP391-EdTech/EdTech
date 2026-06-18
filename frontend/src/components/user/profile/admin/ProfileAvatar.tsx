import React from 'react';

interface ProfileAvatarProps {
    avatar?: string;
    name: string;
    size?: 'sm' | 'lg';
}

export function ProfileAvatar({ avatar, name, size = 'lg' }: ProfileAvatarProps) {
    const isImg = avatar && (avatar.startsWith('http') || avatar.startsWith('data:image') || avatar.startsWith('data:'));
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    if (size === 'sm') {
        return (
            <div className="relative shrink-0">
                {isImg ? (
                    <img 
                        src={avatar} 
                        alt="Avatar" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#E11D48]/20 shadow-sm" 
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold bg-[#E11D48] shadow-sm">
                        {initials}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#E11D48] flex items-center justify-center border-4 border-white shadow-lg">
                {isImg ? (
                    <img 
                        src={avatar} 
                        alt={name} 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <span className="text-white font-extrabold text-3xl">
                        {initials}
                    </span>
                )}
            </div>
            <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-white shadow-sm" 
                title="Online" 
            />
        </div>
    );
}

import React from 'react';

export function ProfileCover() {
    return (
        <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 45%, #312E81 75%, #4C1D95 100%)' }}>
            {/* Dot grid overlay */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {/* Glows */}
            <div className="absolute top-4 right-16 w-32 h-32 rounded-full opacity-20" style={{ background: '#E11D48', filter: 'blur(40px)' }} />
            <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full opacity-15" style={{ background: '#6366F1', filter: 'blur(35px)' }} />
        </div>
    );
}

import React from 'react';

interface StreakFlameProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export default function StreakFlame({ streak, size = 'md', showText = true }: StreakFlameProps) {
    // Determine level
    let level = 1;
    if (streak >= 8) {
        level = 3;
    } else if (streak >= 4) {
        level = 2;
    }

    // Dimension styles
    const dimensions = {
        sm: { icon: 'w-5 h-5', text: 'text-sm font-semibold' },
        md: { icon: 'w-10 h-10', text: 'text-lg font-bold' },
        lg: { icon: 'w-20 h-20', text: 'text-3xl font-extrabold' },
    }[size];

    // Theme values (All English labels)
    const themes = {
        1: {
            gradientId: 'flame-gradient-amber',
            stops: (
                <>
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EF4444" />
                </>
            ),
            glowClass: 'drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]',
            animationClass: 'animate-amber-flicker',
            label: 'Warm Ember',
            labelColor: 'text-amber-500',
        },
        2: {
            gradientId: 'flame-gradient-blaze',
            stops: (
                <>
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="50%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#E11D48" />
                </>
            ),
            glowClass: 'drop-shadow-[0_4px_12px_rgba(239,68,68,0.6)]',
            animationClass: 'animate-blaze-flicker',
            label: 'Blazing Flame',
            labelColor: 'text-rose-500',
        },
        3: {
            gradientId: 'flame-gradient-cosmic',
            stops: (
                <>
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#D946EF" />
                </>
            ),
            glowClass: 'drop-shadow-[0_6px_20px_rgba(168,85,247,0.8)]',
            animationClass: 'animate-cosmic-flicker',
            label: 'Cosmic Flame',
            labelColor: 'text-indigo-500',
        },
    }[level];

    return (
        <div className="flex flex-col items-center justify-center">
            {/* Custom inline styles for flame flickers */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes amber-flicker {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.04); filter: brightness(1.08); }
                }
                @keyframes blaze-flicker {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.06) rotate(-1deg); }
                    75% { transform: scale(0.96) rotate(1deg); }
                }
                @keyframes cosmic-flicker {
                    0%, 100% { transform: scale(1) translateY(0); filter: hue-rotate(0deg); }
                    50% { transform: scale(1.1) translateY(-2px); filter: hue-rotate(15deg); }
                }
                .animate-amber-flicker {
                    animation: amber-flicker 2s infinite ease-in-out;
                }
                .animate-blaze-flicker {
                    animation: blaze-flicker 1.2s infinite ease-in-out;
                }
                .animate-cosmic-flicker {
                    animation: cosmic-flicker 1.5s infinite ease-in-out;
                }
            `}} />

            <div className={`relative ${themes.animationClass} ${themes.glowClass}`}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${dimensions.icon}`}
                >
                    <defs>
                        <linearGradient id={themes.gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
                            {themes.stops}
                        </linearGradient>
                    </defs>
                    <path
                        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
                        fill={`url(#${themes.gradientId})`}
                        stroke="none"
                    />
                </svg>

                {/* Floating particle embers for tier 3 */}
                {level === 3 && size !== 'sm' && (
                    <div className="absolute inset-0 pointer-events-none">
                        <span className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-75 left-[15%] top-[20%]"></span>
                        <span className="absolute w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-ping opacity-60 right-[10%] top-[40%]"></span>
                        <span className="absolute w-1 h-1 bg-indigo-300 rounded-full animate-pulse left-[45%] top-[10%]"></span>
                    </div>
                )}
            </div>
            
            {showText && size !== 'sm' && (
                <div className="mt-1.5 text-center select-none">
                    <span className={`${dimensions.text} text-[#111827]`}>
                        {streak} {streak === 1 ? 'Day' : 'Days'}
                    </span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${themes.labelColor}`}>
                        {themes.label}
                    </p>
                </div>
            )}
        </div>
    );
}

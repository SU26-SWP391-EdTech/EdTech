import { Clock } from 'lucide-react';

interface QuizTimerProps {
    timeLeft: number;
    totalTime: number;
    title: string;
}

export function QuizTimer({ timeLeft, totalTime, title }: QuizTimerProps) {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeRatio = totalTime > 0 ? timeLeft / totalTime : 1;

    // Transition color from green -> amber -> red
    const timerColor = timeRatio > 0.33 
        ? '#16A34A' // Green
        : timeRatio > 0.15 
            ? '#D97706' // Amber
            : '#E11D48'; // Red

    const timerBg = timeRatio > 0.33 
        ? '#F0FDF4' 
        : timeRatio > 0.15 
            ? '#FFFBEB' 
            : '#FFF1F3';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Clock Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div 
                    style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 8, 
                        background: timerBg, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}
                >
                    <Clock size={15} style={{ color: timerColor }} />
                </div>
                <span 
                    style={{ 
                        fontSize: 20, 
                        fontWeight: 700, 
                        color: timerColor, 
                        fontVariantNumeric: 'tabular-nums', 
                        letterSpacing: '-0.5px' 
                    }}
                >
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
            </div>

            {/* Slide track progress line */}
            <div style={{ width: 100, height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                <div 
                    style={{ 
                        height: '100%', 
                        width: `${timeRatio * 100}%`, 
                        background: timerColor, 
                        borderRadius: 2, 
                        transition: 'width 1s linear' 
                    }} 
                />
            </div>

            <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
            <span style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                {title}
            </span>
        </div>
    );
}

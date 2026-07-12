import { Clock, Target, FileQuestion, Zap } from 'lucide-react';

interface AssessmentStatsGridProps {
    timeLimit: number;
    questionCount: number;
    pointsReward: number;
}

export function AssessmentStatsGrid({ timeLimit, questionCount, pointsReward }: AssessmentStatsGridProps) {
    const stats = [
        { 
            icon: <Clock size={20} />, 
            label: 'Thời gian', 
            value: timeLimit === 0 ? 'Không giới hạn' : `${timeLimit} phút`, 
            color: '#D97706', 
            bg: '#FFFBEB' 
        },
        { 
            icon: <FileQuestion size={20} />, 
            label: 'Số câu', 
            value: `${questionCount} câu`, 
            color: '#E11D48', 
            bg: '#FEF2F2' 
        },
        { 
            icon: <Zap size={20} />, 
            label: 'Tổng điểm', 
            value: `${pointsReward} Points`, 
            color: '#4F46E5', 
            bg: '#EEF2FF' 
        },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {stats.map((stat, i) => (
                <div 
                    key={i} 
                    style={{ 
                        background: '#FFFFFF', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: 16, 
                        padding: '20px 18px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 8, 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
                    }}
                >
                    <div 
                        style={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 10, 
                            background: stat.bg, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: stat.color 
                        }}
                    >
                        {stat.icon}
                    </div>
                    <div 
                        style={{ 
                            fontSize: 11, 
                            color: '#64748B', 
                            fontWeight: 600, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px', 
                            marginTop: 4 
                        }}
                    >
                        {stat.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

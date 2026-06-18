import { BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';
import type { MyLearningStats as MyLearningStatsValue } from '../../../types/learner/my-learning.types';

interface MyLearningStatsProps {
    stats: MyLearningStatsValue;
}

export function MyLearningStats({ stats }: MyLearningStatsProps) {
    const items = [
        { label: 'Enrolled', value: stats.enrolled, Icon: BookOpen, color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'In Progress', value: stats.inProgress, Icon: PlayCircle, color: '#E11D48', bg: '#FFF1F3' },
        { label: 'Completed', value: stats.completed, Icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7' },
    ];

    return (
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {items.map(({ label, value, Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: bg }}>
                        <Icon className="h-[18px] w-[18px]" style={{ color }} />
                    </div>
                    <div>
                        <p className="text-[22px] font-bold text-[#111827]">{value}</p>
                        <p className="text-xs text-[#6B7280]">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

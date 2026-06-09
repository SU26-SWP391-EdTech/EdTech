import { BookOpen } from 'lucide-react';

export type CourseStatus = 'in-progress' | 'completed' | 'not-started' | 'archived';

interface CourseCardProps {
    title: string;
    provider: string;
    category: string;
    duration: string;
    done: number;
    total: number;
    progress: number;
    lastAccessed: string;
    status: CourseStatus;
    thumb: string;
    onCtaClick?: () => void;
}

const statusMap: Record<CourseStatus, { label: string; tint: string; color: string }> = {
    'in-progress': { label: 'In Progress', tint: '#FFFBEB', color: '#B45309' },
    completed: { label: 'Completed', tint: '#ECFDF5', color: '#047857' },
    'not-started': { label: 'Not Started', tint: '#F8FAFC', color: '#6B7280' },
    archived: { label: 'Archived', tint: '#F1F5F9', color: '#475569' },
};

export default function CourseCard({
    title,
    provider,
    category,
    duration,
    done,
    total,
    progress,
    lastAccessed,
    status,
    thumb,
    onCtaClick
}: CourseCardProps) {
    const s = statusMap[status];
    const cta = status === 'completed' ? 'View Certificate' : status === 'archived' ? 'Review' : 'Continue';
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex gap-4 hover:shadow-md hover:border-[#E11D48]/20 transition-all">
            <div className={`flex-shrink-0 w-[88px] h-[88px] rounded-xl bg-gradient-to-br ${thumb} flex items-center justify-center`}>
                <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[14px] text-[#111827] line-clamp-1" style={{ fontWeight: 600 }}>{title}</h3>
                    <span className="px-1.5 py-0.5 text-[10px] rounded whitespace-nowrap" style={{ background: s.tint, color: s.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-2">
                    <span>{provider}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                    <span>{category}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                    <span>{duration}</span>
                </div>
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#6B7280]">{done}/{total} lessons</span>
                        <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${status === 'completed' ? 'bg-[#10B981]' : 'bg-[#E11D48]'}`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[11px] text-[#9CA3AF]">Last accessed {lastAccessed}</span>
                    <button onClick={onCtaClick} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${status === 'completed' ? 'bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]' : 'bg-[#111827] text-white hover:bg-black'}`} style={{ fontWeight: 500 }}>
                        {cta}
                    </button>
                </div>
            </div>
        </div>
    );
}

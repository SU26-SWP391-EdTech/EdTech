import { Clock, MoreHorizontal } from 'lucide-react';

export type PathStatus = 'in-progress' | 'completed' | 'saved' | 'not-started';

interface PathCardProps {
    title: string;
    description: string;
    progress: number;
    coursesDone: number;
    coursesTotal: number;
    remaining: string;
    difficulty: string;
    status: PathStatus;
    accent: string;
    onClick?: () => void;
}

const statusMap: Record<PathStatus, { label: string; tint: string; color: string }> = {
    'in-progress': { label: 'In Progress', tint: '#FFFBEB', color: '#B45309' },
    completed: { label: 'Completed', tint: '#ECFDF5', color: '#047857' },
    saved: { label: 'Saved', tint: '#F1F5F9', color: '#475569' },
    'not-started': { label: 'Not Started', tint: '#F8FAFC', color: '#6B7280' },
};

export default function PathCard({
    title,
    description,
    progress,
    coursesDone,
    coursesTotal,
    remaining,
    difficulty,
    status,
    accent,
    onClick
}: PathCardProps) {
    const s = statusMap[status];
    return (
        <div onClick={onClick} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all cursor-pointer">
            <div className="h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                <div className="absolute inset-0 flex items-center justify-center gap-2 px-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${i < Math.round((progress / 100) * 4) ? 'bg-white' : 'bg-white/30'}`} />
                            {i < 3 && <div className={`w-6 h-px ${i < Math.round((progress / 100) * 4) - 1 ? 'bg-white' : 'bg-white/30'}`} />}
                        </div>
                    ))}
                </div>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] rounded" style={{ color: accent, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    {difficulty}
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: s.tint, color: s.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{s.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1 -m-1 text-[#9CA3AF] hover:text-[#111827]"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h3 className="text-[15px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>{title}</h3>
                <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{description}</p>
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-[#6B7280]">{coursesDone}/{coursesTotal} courses</span>
                        <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: accent }} />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mb-3">
                    <Clock className="w-3 h-3" />
                    {remaining} remaining
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="flex-1 py-1.5 bg-[#111827] text-white rounded-lg text-xs hover:bg-black transition-colors" style={{ fontWeight: 500 }}>
                        {status === 'saved' || status === 'not-started' ? 'Start Path' : 'Continue Path'}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-xs hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                        Roadmap
                    </button>
                </div>
            </div>
        </div>
    );
}

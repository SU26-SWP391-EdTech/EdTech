import { BookOpen, Star, Users, Clock } from 'lucide-react';

interface ExploreCourseCardProps {
    title: string;
    provider: string;
    rating: number;
    students: string;
    duration: string;
    difficulty: string;
    tags: string[];
    thumb: string;
    badge?: string;
    isEnrolled: boolean;
    onEnroll: () => void;
    enrolling: boolean;
}

export function DifficultyBadge({ level }: { level: string }) {
    const map: Record<string, { tint: string; color: string }> = {
        Beginner: { tint: '#ECFDF5', color: '#047857' },
        Intermediate: { tint: '#FFFBEB', color: '#B45309' },
        Advanced: { tint: '#FEF2F2', color: '#B91C1C' },
    };
    const m = map[level] || map.Beginner;
    return (
        <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: m.tint, color: m.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {level}
        </span>
    );
}

export default function ExploreCourseCard({
    title,
    provider,
    rating,
    students,
    duration,
    difficulty,
    tags,
    thumb,
    badge,
    isEnrolled,
    onEnroll,
    enrolling
}: ExploreCourseCardProps) {
    const badgeMap: Record<string, { color: string; tint: string }> = {
        Popular: { color: '#E11D48', tint: '#FEF2F2' },
        Trending: { color: '#F59E0B', tint: '#FFFBEB' },
        New: { color: '#0EA5E9', tint: '#F0F9FF' },
        Recommended: { color: '#10B981', tint: '#ECFDF5' },
    };
    const b = badge ? badgeMap[badge] : null;

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all flex flex-col justify-between">
            <div>
                <div className={`h-28 relative bg-gradient-to-br ${thumb} flex items-center justify-center`}>
                    <BookOpen className="w-9 h-9 text-white" />
                    {b && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px]" style={{ background: b.tint, color: b.color, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{badge}</span>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-[14px] text-[#111827] mb-1 line-clamp-1" style={{ fontWeight: 600 }}>{title}</h3>
                    <p className="text-xs text-[#6B7280] mb-2">{provider}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-3">
                        <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                            <span className="text-[#111827]" style={{ fontWeight: 600 }}>{rating}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{students}</span>
                        <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <DifficultyBadge level={difficulty} />
                        {tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 text-[10px] bg-[#F8FAFC] text-[#6B7280] rounded capitalize" style={{ fontWeight: 500 }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 pt-0">
                {isEnrolled ? (
                    <div className="w-full text-center py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                        Already Enrolled
                    </div>
                ) : (
                    <button
                        onClick={onEnroll}
                        disabled={enrolling}
                        className="w-full py-2 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] disabled:bg-slate-200 disabled:text-slate-400 transition-colors font-semibold"
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll'}
                    </button>
                )}
            </div>
        </div>
    );
}

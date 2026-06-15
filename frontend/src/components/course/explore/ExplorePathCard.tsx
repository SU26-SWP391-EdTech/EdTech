import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users } from 'lucide-react';

interface ExplorePathCardProps {
    learningPathId: number;
    title: string;
    description: string;
    courses: number;
    duration: string;
    difficulty: string;
    enrolled: string;
    completion: number;
    accent: string;
    isPathEnrolled: boolean;
    personalProgress: number;
}

export default function ExplorePathCard({
    learningPathId,
    title,
    description,
    courses,
    duration,
    difficulty,
    enrolled,
    completion,
    accent,
    isPathEnrolled,
    personalProgress
}: ExplorePathCardProps) {
    const navigate = useNavigate();
    const showProgress = isPathEnrolled ? personalProgress : completion;
    const progressLabel = isPathEnrolled ? 'My Progress' : 'Avg. Completion';

    const segments = window.location.pathname.split('/');
    const rolePrefix = segments[1];
    const isDashboardRoute = ['learner', 'provider', 'admin', 'academic'].includes(rolePrefix);
    const detailUrl = isDashboardRoute
        ? `/${rolePrefix}/learning-path/${learningPathId}`
        : `/learning-path/${learningPathId}`;

    return (
        <div 
            onClick={() => navigate(detailUrl)} 
            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all flex flex-col justify-between cursor-pointer"
        >
            <div>
                <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                    <div className="absolute inset-0 flex items-center justify-center gap-2 px-6">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                {i < 4 && <div className="w-8 h-px bg-white/60" />}
                            </div>
                        ))}
                    </div>
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] rounded capitalize" style={{ color: accent, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                        {difficulty}
                    </span>
                </div>
                <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-[15px] text-[#111827]" style={{ fontWeight: 600 }}>{title}</h3>
                    </div>
                    <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mb-3">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{courses} courses</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-[#6B7280]" style={{ fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{progressLabel}</span>
                                <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{showProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${isPathEnrolled ? 'bg-[#E11D48]' : 'bg-[#10B981]'}`} style={{ width: `${showProgress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); navigate(detailUrl); }}
                    className="flex-1 py-2 bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors text-center"
                >
                    View Detail
                </button>
                {isPathEnrolled && personalProgress === 100 && (
                    <div className="py-2 px-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 text-center flex items-center justify-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        Completed ✓
                    </div>
                )}
            </div>
        </div>
    );
}

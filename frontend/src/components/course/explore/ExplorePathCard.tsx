import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Map } from 'lucide-react';

interface ExplorePathCardProps {
    learningPathId: number;
    title: string;
    description: string;
    courses: number;
    duration: string;
    difficulty: string;
    accent: string;
    thumbnailUrl?: string | null;
    isFollowed: boolean;
    personalProgress: number;
    onFollow?: () => void;
    onUnfollow?: () => void;
}

export default function ExplorePathCard({
    learningPathId,
    title,
    description,
    courses,
    duration,
    difficulty,
    accent,
    thumbnailUrl,
    isFollowed,
    personalProgress,
    onFollow,
    onUnfollow
}: ExplorePathCardProps) {
    const navigate = useNavigate();

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
                <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                    {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Map className="w-9 h-9 text-white" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
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
                    </div>
                    {isFollowed && (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-[#6B7280]" style={{ fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>My Progress</span>
                                <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{personalProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#E11D48]" style={{ width: `${personalProgress}%` }} />
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); navigate(detailUrl); }}
                    className="flex-1 py-2 bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors text-center"
                >
                    View Detail
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isFollowed) {
                            onUnfollow?.();
                        } else {
                            onFollow?.();
                        }
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-center ${
                        isFollowed 
                            ? 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]' 
                            : 'bg-[#E11D48] text-white hover:bg-[#BE123C]'
                    }`}
                >
                    {isFollowed ? 'Following' : 'Follow'}
                </button>
                {isFollowed && personalProgress === 100 && (
                    <div className="py-2 px-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 text-center flex items-center justify-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        Completed ✓
                    </div>
                )}
            </div>
        </div>
    );
}

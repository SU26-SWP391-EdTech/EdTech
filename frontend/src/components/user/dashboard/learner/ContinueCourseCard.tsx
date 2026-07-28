import CircularMini from './CircularMini';
import ProgressBar from './ProgressBar';

interface ContinueCourseCardProps {
    title: string;
    path: string;
    progress: number;
    gradient: string;
    initials: string;
    idx: number;
    thumbnailUrl?: string;
    onClick?: () => void;
}

export default function ContinueCourseCard({
    title,
    path,
    progress,
    gradient,
    initials,
    idx,
    thumbnailUrl,
    onClick
}: ContinueCourseCardProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#E11D48]/30 hover:shadow-md transition-all group cursor-pointer"
        >
            <div className="flex items-start gap-4 mb-4" >
                <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm shadow-sm" style={!thumbnailUrl ? { background: gradient, fontWeight: 700 } : undefined}>
                    {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover rounded-xl" />
                    ) :
                        (initials)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 600 }}>{title}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{path}</p>
                </div>
                <CircularMini value={progress} color={idx === 0 ? '#E11D48' : idx === 1 ? '#3B82F6' : '#10B981'} />
            </div>

            <ProgressBar
                value={progress}
                color={idx === 0 ? '#E11D48' : idx === 1 ? '#3B82F6' : '#10B981'}
            />
        </div>
    );
}

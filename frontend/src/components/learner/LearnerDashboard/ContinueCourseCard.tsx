import { Play } from 'lucide-react';
import CircularMini from './CircularMini';
import ProgressBar from './ProgressBar';

interface ContinueCourseCardProps {
    title: string;
    path: string;
    progress: number;
    lesson: string;
    remaining: number;
    duration: string;
    gradient: string;
    initials: string;
    idx: number;
    onContinue: () => void;
    onClick?: () => void;
}

export default function ContinueCourseCard({
    title,
    path,
    progress,
    lesson,
    remaining,
    duration,
    gradient,
    initials,
    idx,
    onContinue,
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
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm shadow-sm" style={{ background: gradient, fontWeight: 700 }}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 600 }}>{title}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{path}</p>
                </div>
                <CircularMini value={progress} color={idx === 0 ? '#E11D48' : idx === 1 ? '#3B82F6' : '#10B981'} />
            </div>

            <div className="mb-3">
                <p className="text-xs text-[#6B7280] truncate mb-2">
                    <span className="text-[#9CA3AF]">Now: </span>{lesson}
                </p>
                <ProgressBar
                    value={progress}
                    color={idx === 0 ? '#E11D48' : idx === 1 ? '#3B82F6' : '#10B981'}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span>{remaining} lessons left</span>
                    <span>·</span>
                    <span>{duration}</span>
                </div>
                <button 
                    onClick={(event) => {
                        event.stopPropagation();
                        onContinue();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] group-hover:bg-[#E11D48] text-[#374151] group-hover:text-white rounded-lg text-xs transition-all" 
                    style={{ fontWeight: 500 }}
                >
                    <Play className="w-3 h-3 fill-current" />
                    Continue
                </button>
            </div>
        </div>
    );
}

import { Play } from 'lucide-react';

interface MyLearningHeaderProps {
    hasEnrollments: boolean;
    onExploreMoreClick: () => void;
    onContinueClick: () => void;
}

export default function MyLearningHeader({
    hasEnrollments,
    onExploreMoreClick,
    onContinueClick,
}: MyLearningHeaderProps) {
    return (
        <div className="flex items-end justify-between mb-8">
            <div>
                <h1 className="text-[32px] text-[#111827] mb-1.5" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                    My Learning
                </h1>
                <p className="text-[#6B7280] text-[15px]">
                    Track your enrolled courses, learning paths, progress, and saved content.
                </p>
            </div>
            <div className="flex items-center gap-2.5">
                <button
                    onClick={onExploreMoreClick}
                    className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
                    style={{ fontWeight: 500 }}
                >
                    Explore More
                </button>
                {hasEnrollments && (
                    <button 
                        onClick={onContinueClick}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" 
                        style={{ fontWeight: 500 }}
                    >
                        <Play className="w-4 h-4 fill-white" />
                        Continue Learning
                    </button>
                )}
            </div>
        </div>
    );
}

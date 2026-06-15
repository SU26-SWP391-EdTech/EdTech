interface MyLearningHeaderProps {
    hasEnrollments: boolean;
    onExploreMoreClick: () => void;
}

export default function MyLearningHeader({
    hasEnrollments,
    onExploreMoreClick,
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
            </div>
        </div>
    );
}

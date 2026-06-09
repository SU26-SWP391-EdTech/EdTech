import { ChevronRight, Sparkles } from 'lucide-react';
import ContinueCourseCard from './ContinueCourseCard';

interface CourseData {
    id: number;
    title: string;
    path: string;
    progress: number;
    lesson: string;
    remaining: number;
    duration: string;
    gradient: string;
    initials: string;
}

interface ContinueLearningSectionProps {
    continueCourses: CourseData[];
    onViewAllClick: () => void;
    onContinueClick: () => void;
    onBrowseClick: () => void;
}

export default function ContinueLearningSection({
    continueCourses,
    onViewAllClick,
    onContinueClick,
    onBrowseClick
}: ContinueLearningSectionProps) {
    return (
        <div className="col-span-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Continue Learning</h2>
                <button 
                    onClick={onViewAllClick}
                    className="flex items-center gap-1 text-xs text-[#E11D48] hover:text-[#BE123C] transition-colors" 
                    style={{ fontWeight: 500 }}
                >
                    All courses <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-3">
                {continueCourses.length > 0 ? (
                    continueCourses.map((course, idx) => (
                        <ContinueCourseCard
                            key={course.id}
                            title={course.title}
                            path={course.path}
                            progress={course.progress}
                            lesson={course.lesson}
                            remaining={course.remaining}
                            duration={course.duration}
                            gradient={course.gradient}
                            initials={course.initials}
                            idx={idx}
                            onContinue={onContinueClick}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E5E7EB] rounded-2xl min-h-[300px]">
                        <Sparkles className="w-10 h-10 text-[#E11D48] mb-3 animate-pulse" />
                        <h3 className="text-base font-bold text-[#111827] mb-1">Start Your Learning Journey</h3>
                        <p className="text-xs text-[#6B7280] max-w-sm mb-5">
                            You are not enrolled in any courses. Explore our roadmaps to begin.
                        </p>
                        <button
                            onClick={onBrowseClick}
                            className="px-4 py-2 bg-[#E11D48] text-white rounded-xl text-xs hover:bg-[#BE123C] transition-colors font-medium"
                        >
                            Browse Courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

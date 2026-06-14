import { Play, BookOpen, Clock, Route, Sparkles } from 'lucide-react';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';

interface ContinueHighlightProps {
    displayEnrollment: Enrollment | null;
    parentPathTitle: string;
    onContinueClick: () => void;
    onViewCourseClick: () => void;
    onBrowseClick: () => void;
}

export default function ContinueHighlight({
    displayEnrollment,
    parentPathTitle,
    onContinueClick,
    onViewCourseClick,
    onBrowseClick
}: ContinueHighlightProps) {
    if (!displayEnrollment) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#FFF1F2] p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
                <Sparkles className="w-10 h-10 text-[#E11D48] mb-3 animate-pulse" />
                <h2 className="text-xl font-bold text-[#111827] mb-1">Start Your Learning Journey</h2>
                <p className="text-sm text-[#6B7280] max-w-md mb-6">
                    You are not enrolled in any courses yet. Explore our curated courses and roadmap to begin learning.
                </p>
                <button
                    onClick={onBrowseClick}
                    className="px-6 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors font-medium"
                >
                    Browse Courses
                </button>
            </div>
        );
    }

    const completedLessons = Math.round(displayEnrollment.course.totalLessons * (displayEnrollment.progress / 100));
    const remainingLessons = displayEnrollment.course.totalLessons - completedLessons;
    const remainingHours = Math.round(displayEnrollment.course.duration * (1 - displayEnrollment.progress / 100));

    return (
        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#FFF1F2]">
            <div className="grid grid-cols-5">
                <div className="col-span-2 relative bg-gradient-to-br from-[#1F2937] to-[#111827] p-6 flex flex-col justify-between min-h-[260px]">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur text-white text-[11px] rounded-md" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                            {displayEnrollment.status === 'active' ? 'Now Playing' : 'Review'}
                        </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            onClick={onContinueClick}
                            className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/25 transition-colors"
                        >
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                    </div>
                    <div className="relative">
                        <p className="text-white/60 text-xs mb-1" style={{ fontWeight: 500 }}>
                            Lesson {completedLessons} of {displayEnrollment.course.totalLessons}
                        </p>
                        <p className="text-white text-sm truncate" style={{ fontWeight: 500 }}>
                            {displayEnrollment.course.title}
                        </p>
                    </div>
                </div>
                <div className="col-span-3 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <Route className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600 }}>{parentPathTitle}</span>
                    </div>
                    <h2 className="text-[22px] text-[#111827] mb-1 truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {displayEnrollment.course.title}
                    </h2>
                    <p className="text-sm text-[#6B7280] mb-5 line-clamp-2">
                        {displayEnrollment.course.description || 'Master this course with comprehensive materials.'}
                    </p>

                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[#6B7280]" style={{ fontWeight: 500 }}>Course progress</span>
                            <span className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>{displayEnrollment.progress}%</span>
                        </div>
                        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#E11D48] to-[#F43F5E] rounded-full" style={{ width: `${displayEnrollment.progress}%` }} />
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280]">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                {remainingLessons} lessons left
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {remainingHours}h remaining
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                        <button
                            onClick={onContinueClick}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            <Play className="w-4 h-4 fill-white" />
                            {displayEnrollment.status === 'completed' ? 'Review Course' : 'Continue Lesson'}
                        </button>
                        <button
                            onClick={onViewCourseClick}
                            className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            View Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

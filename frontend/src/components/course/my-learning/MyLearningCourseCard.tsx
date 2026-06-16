import { BookOpen, CheckCircle2, Clock, Play, PlayCircle } from 'lucide-react';
import type { MyLearningCourse } from '../../../types/learner/my-learning.types';
import { formatLearningDate } from '../../../utils/learner/myLearningFormatters';
import { isCompletedCourse } from '../../../utils/learner/myLearningMappers';

interface MyLearningCourseCardProps {
    course: MyLearningCourse;
    onOpenCourse: (courseId: number) => void;
    onContinueCourse: (courseId: number) => void;
}

export function MyLearningCourseCard({ course, onOpenCourse, onContinueCourse }: MyLearningCourseCardProps) {
    const completed = isCompletedCourse(course);

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 md:flex-row md:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1F2937] to-[#374151]">
                {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                ) : completed ? (
                    <CheckCircle2 className="h-6 w-6 text-[#4ADE80]" />
                ) : (
                    <PlayCircle className="h-6 w-6 text-white/70" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => onOpenCourse(course.courseId)}
                        className="truncate text-left text-[15px] font-semibold text-[#111827] hover:text-[#E11D48]"
                    >
                        {course.title}
                    </button>
                    {completed && (
                        <span className="rounded-full border border-[#86EFAC] bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                            Completed
                        </span>
                    )}
                </div>

                <div className="mb-2 flex flex-wrap gap-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-[#9CA3AF]" />
                        {course.totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#9CA3AF]" />
                        {course.duration || 0}h
                    </span>
                    <span>{course.language}</span>
                    <span>Last: {formatLearningDate(course.lastAccessedAt)}</span>
                </div>

                {!completed ? (
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 max-w-[320px] flex-1 rounded-full bg-[#F3F4F6]">
                            <div
                                className="h-full rounded-full bg-[#E11D48]"
                                style={{ width: `${course.progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-[#E11D48]">{course.progress}%</span>
                    </div>
                ) : (
                    <p className="text-xs text-[#9CA3AF]">Completed {formatLearningDate(course.completedAt)}</p>
                )}
            </div>

            <div className="shrink-0">
                {completed ? (
                    <button
                        onClick={() => onOpenCourse(course.courseId)}
                        className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F8FAFC]"
                    >
                        Review
                    </button>
                ) : (
                    <button
                        onClick={() => onContinueCourse(course.courseId)}
                        className="flex items-center gap-2 rounded-lg bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C]"
                    >
                        <Play className="h-3.5 w-3.5 fill-white" />
                        {course.progress > 0 ? 'Continue' : 'Start'}
                    </button>
                )}
            </div>
        </div>
    );
}

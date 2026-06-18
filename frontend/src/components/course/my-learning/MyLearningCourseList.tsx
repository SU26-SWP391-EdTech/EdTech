import type { MyLearningCourse } from '../../../types/learner/my-learning.types';
import { MyLearningCourseCard } from './MyLearningCourseCard';

interface MyLearningCourseListProps {
    courses: MyLearningCourse[];
    isLoading: boolean;
    onOpenCourse: (courseId: number) => void;
    onContinueCourse: (courseId: number) => void;
}

export function MyLearningCourseList({
    courses,
    isLoading,
    onOpenCourse,
    onContinueCourse,
}: MyLearningCourseListProps) {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#6B7280]">
                Loading your courses...
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-8 text-center">
                <p className="text-sm font-semibold text-[#111827]">No courses found</p>
                <p className="mt-1 text-sm text-[#6B7280]">Your enrolled courses will appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {courses.map(course => (
                <MyLearningCourseCard
                    key={course.enrollmentId}
                    course={course}
                    onOpenCourse={onOpenCourse}
                    onContinueCourse={onContinueCourse}
                />
            ))}
        </div>
    );
}

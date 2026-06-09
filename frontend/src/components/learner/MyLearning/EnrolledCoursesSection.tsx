import SectionHeader from './SectionHeader';
import CourseCard from './CourseCard';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';

interface EnrolledCoursesSectionProps {
    filteredEnrollmentsCount: number;
    sortedEnrollments: Enrollment[];
    timeAgo: (dateString?: string | null) => string;
    getCourseGradient: (index: number) => string;
    onViewAll: () => void;
    onCtaClick: () => void;
}

export default function EnrolledCoursesSection({
    filteredEnrollmentsCount,
    sortedEnrollments,
    timeAgo,
    getCourseGradient,
    onViewAll,
    onCtaClick,
}: EnrolledCoursesSectionProps) {
    return (
        <section>
            <SectionHeader
                title="Enrolled Courses"
                subtitle={`${filteredEnrollmentsCount} courses`}
                actionLabel="See all courses"
                onAction={onViewAll}
            />
            <div className="grid grid-cols-2 gap-4">
                {sortedEnrollments.length > 0 ? (
                    sortedEnrollments.slice(0, 4).map((enrollment, index) => {
                        const total = enrollment.course.totalLessons;
                        const done = Math.round(total * (enrollment.progress / 100));
                        const status = enrollment.status === 'completed' || enrollment.progress === 100
                            ? 'completed'
                            : (enrollment.status === 'active' ? 'in-progress' : 'archived');

                        return (
                            <CourseCard
                                key={enrollment.enrollmentId}
                                title={enrollment.course.title}
                                provider={enrollment.course.user?.fullName || 'Senior Instructor'}
                                category={enrollment.course.language || 'Programming'}
                                duration={`${enrollment.course.duration}h`}
                                done={done}
                                total={total}
                                progress={enrollment.progress}
                                lastAccessed={timeAgo(enrollment.lastAccessedAt)}
                                status={status}
                                thumb={getCourseGradient(index)}
                                onCtaClick={onCtaClick}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-2 text-center py-12 bg-white border border-[#E5E7EB] rounded-2xl">
                        <p className="text-sm text-[#6B7280]">No courses found for this tab.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

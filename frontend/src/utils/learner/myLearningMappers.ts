import type { Enrollment } from '../../services/enrollment/enrollment.service';
import type { MyLearningCourse, MyLearningStats, MyLearningTab } from '../../types/learner/my-learning.types';
import { normalizeProgress } from './myLearningFormatters';

export function mapEnrollmentToMyLearningCourse(enrollment: Enrollment): MyLearningCourse {
    const course = enrollment.course;

    return {
        enrollmentId: enrollment.enrollmentId,
        courseId: course.courseId,
        title: course.title,
        language: course.language || 'English',
        totalLessons: course.totalLessons || 0,
        duration: course.duration || 0,
        progress: normalizeProgress(enrollment.progress),
        status: enrollment.status,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
        thumbnailUrl: course.thumbnailUrl,
    };
}

export function isCompletedCourse(course: MyLearningCourse): boolean {
    return course.status === 'completed' || Boolean(course.completedAt) || course.progress >= 100;
}

export function getMyLearningStats(courses: MyLearningCourse[]): MyLearningStats {
    const completed = courses.filter(isCompletedCourse).length;

    return {
        enrolled: courses.length,
        completed,
        inProgress: courses.length - completed,
    };
}

export function filterMyLearningCourses(courses: MyLearningCourse[], tab: MyLearningTab): MyLearningCourse[] {
    if (tab === 'completed') return courses.filter(isCompletedCourse);
    if (tab === 'in-progress') return courses.filter(course => !isCompletedCourse(course));
    return courses;
}

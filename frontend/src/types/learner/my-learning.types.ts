import type { Enrollment } from '../../services/enrollment/enrollment.service';

export type MyLearningTab = 'all' | 'in-progress' | 'completed';

export interface MyLearningCourse {
    enrollmentId: number;
    courseId: number;
    title: string;
    language: string;
    totalLessons: number;
    duration: number;
    progress: number;
    status: Enrollment['status'];
    lastAccessedAt: string | null;
    completedAt: string | null;
    thumbnailUrl?: string | null;
}

export interface MyLearningStats {
    enrolled: number;
    inProgress: number;
    completed: number;
}

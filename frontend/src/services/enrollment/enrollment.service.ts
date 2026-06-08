import api from '../../lib/axios';
import type { Course } from '../course/course.service';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'expired';

export interface Enrollment {
    enrollmentId: number;
    enrolledAt: string;
    status: EnrollmentStatus;
    progress: number;
    lastAccessedAt: string | null;
    completedAt: string | null;
    expiresAt: string | null;
    user?: {
        userId: number;
        fullName: string;
        email: string;
    };
    course: Course;
}

// 1. Đăng ký tham gia một khóa học
export async function enrollCourse(courseId: number): Promise<Enrollment> {
    const response = await api.post(`/enrollments/enroll/${courseId}`);
    return response.data;
}

// 2. Lấy danh sách các khóa học hiện tại người dùng đang học
export async function getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/myenrollments');
    return response.data;
}

// 3. Lấy chi tiết tiến độ đăng ký của một khóa học cụ thể
export async function getEnrollmentDetail(courseId: number): Promise<Enrollment> {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response.data;
}

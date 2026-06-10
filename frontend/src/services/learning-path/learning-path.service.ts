import api from '../../lib/axios';
import type { Course } from '../course/course.service';

export type LearningPathLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningPathCourse {
    learningPathId: number;
    courseId: number;
    position: number;
    course: Course;
}

export interface LearningPath {
    learningPathId: number;
    title: string;
    description: string | null;
    slug: string;
    bannerUrl: string | null;
    level: LearningPathLevel;
    createdAt: string;
    edittedBy?: {
        userId: number;
        fullName: string;
        email: string;
    };
    learningPathCourses?: LearningPathCourse[];
}

export interface CreateLearningPathDto {
    title: string;
    description?: string;
    bannerUrl?: string;
    level?: LearningPathLevel;
}

export interface AddCourseToLearningPathDto {
    courseId: number;
    position: number;
}

// 1. Tạo mới một lộ trình học tập (Learning Path)
export async function createLearningPath(data: CreateLearningPathDto): Promise<LearningPath> {
    const response = await api.post('/learning-paths', data);
    return response.data;
}

// 2. Thêm một khóa học vào lộ trình học tập tại vị trí xác định
export async function addCourseToLearningPath(
    learningPathId: number,
    data: AddCourseToLearningPathDto
): Promise<any> {
    const response = await api.post(`/learning-paths/${learningPathId}/courses`, data);
    return response.data;
}

// 3. Xóa một khóa học khỏi lộ trình học tập
export async function removeCourseFromLearningPath(
    learningPathId: number,
    courseId: number
): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/learning-paths/${learningPathId}/courses/${courseId}`);
    return response.data;
}

// 4. Lấy danh sách tất cả khóa học nằm trong lộ trình học tập
export async function getCoursesInLearningPath(learningPathId: number): Promise<Course[]> {
    const response = await api.get(`/learning-paths/${learningPathId}/courses`);
    return response.data;
}

// 5. Lấy danh sách tất cả lộ trình học tập
export async function getLearningPaths(): Promise<LearningPath[]> {
    const response = await api.get('/learning-paths');
    return response.data;
}

// 6. Lấy chi tiết lộ trình học tập bằng ID
export async function getLearningPathById(learningPathId: number): Promise<LearningPath> {
    const response = await api.get(`/learning-paths/${learningPathId}`);
    return response.data;
}

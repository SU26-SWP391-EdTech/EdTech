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
        avatar?: string | null;
        avatarUrl?: string | null;
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

// 7. Cập nhật lộ trình học tập bằng ID
export async function updateLearningPath(
    learningPathId: number,
    data: Partial<CreateLearningPathDto>
): Promise<LearningPath> {
    const response = await api.patch(`/learning-paths/${learningPathId}`, data);
    return response.data;
}

// 8. Xóa lộ trình học tập bằng ID
export async function deleteLearningPath(learningPathId: number): Promise<{ message: string }> {
    const response = await api.delete(`/learning-paths/${learningPathId}`);
    return response.data;
}

// 9. Follow một lộ trình học tập
export async function followLearningPath(learningPathId: number): Promise<{ message: string }> {
    // const response = await api.post(`/learning-paths/${learningPathId}/follow`);
    // return response.data;
    
    // MOCK: Sử dụng localStorage do backend chưa hỗ trợ API follow
    const followed = JSON.parse(localStorage.getItem('followed_paths') || '[]');
    if (!followed.includes(learningPathId)) {
        followed.push(learningPathId);
        localStorage.setItem('followed_paths', JSON.stringify(followed));
    }
    return { message: 'Followed learning path successfully (mocked)' };
}

// 10. Unfollow một lộ trình học tập
export async function unfollowLearningPath(learningPathId: number): Promise<{ message: string }> {
    // const response = await api.delete(`/learning-paths/${learningPathId}/follow`);
    // return response.data;

    // MOCK: Sử dụng localStorage do backend chưa hỗ trợ API follow
    let followed = JSON.parse(localStorage.getItem('followed_paths') || '[]');
    followed = followed.filter((id: number) => id !== learningPathId);
    localStorage.setItem('followed_paths', JSON.stringify(followed));
    return { message: 'Unfollowed learning path successfully (mocked)' };
}

// 11. Lấy danh sách ID các lộ trình học tập đã follow
export async function getFollowedLearningPathIds(): Promise<number[]> {
    // const response = await api.get('/learning-paths/followed/ids');
    // return response.data;

    // MOCK: Sử dụng localStorage do backend chưa hỗ trợ API follow
    const followed = JSON.parse(localStorage.getItem('followed_paths') || '[]');
    return followed;
}

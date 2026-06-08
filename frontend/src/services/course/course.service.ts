import api from '../../lib/axios';

export type CourseStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Course {
    courseId: number;
    title: string;
    status: CourseStatus;
    description: string | null;
    thumbnailUrl: string | null;
    projectUrl: string | null;
    language: string | null;
    duration: number | null;
    totalLessons: number;
    enrollmentCount: number;
    createdAt: string;
    updatedAt: string | null;
    user: {
        userId: number;
        fullName: string;
        email: string;
        avatar: string | null;
    };
    reviewedBy?: {
        userId: number;
        fullName: string;
        email: string;
    } | null;
}

export interface CreateCourseDto {
    title: string;
    description?: string;
    projectUrl?: string;
    language?: string;
    duration?: number;
}

export interface UpdateCourseDto {
    title?: string;
    description?: string;
    projectUrl?: string;
    language?: string;
    duration?: number;
    status?: CourseStatus;
}

export interface SearchCourseDto {
    search?: string;
    status?: CourseStatus;
    language?: string;
    minDuration?: number;
    maxDuration?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

// 1. Tạo khóa học mới (Có hỗ trợ upload ảnh thumbnail)
export async function createCourse(data: CreateCourseDto, file?: File): Promise<Course> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.projectUrl) formData.append('projectUrl', data.projectUrl);
    if (data.language) formData.append('language', data.language);
    if (data.duration !== undefined) formData.append('duration', String(data.duration));
    if (file) {
        formData.append('thumbnailUrl', file);
    }

    const response = await api.post('/courses', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// 2. Tìm kiếm / Lọc danh sách khóa học
export async function searchCourses(query?: SearchCourseDto): Promise<Course[]> {
    const response = await api.get('/courses', { params: query });
    return response.data.data?.items || [];
}

// 3. Lấy thông tin chi tiết một khóa học
export async function getCourseById(id: number): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
}

// 4. Cập nhật thông tin khóa học
export async function updateCourse(id: number, data: UpdateCourseDto): Promise<Course> {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
}

// 5. Xóa khóa học
export async function deleteCourse(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
}

// 6. Phê duyệt khóa học (Yêu cầu quyền Academic Manager)
export async function approveCourse(id: number): Promise<Course> {
    const response = await api.patch(`/courses/${id}/approve`);
    return response.data;
}

// 7. Từ chối khóa học (Yêu cầu quyền Academic Manager)
export async function rejectCourse(id: number): Promise<Course> {
    const response = await api.patch(`/courses/${id}/reject`);
    return response.data;
}

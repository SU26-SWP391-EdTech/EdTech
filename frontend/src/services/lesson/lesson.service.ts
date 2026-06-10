import api from '../../lib/axios';

export interface Lesson {
    lessonId: string; // backend primary key string/number
    title: string;
    description: string | null;
    videoUrl: string | null;
    videoDuration: number | null;
    content: string | null;
    createdAt: string;
    updatedAt: string | null;
    courseId?: number;
}

export interface CreateLessonDto {
    title: string;
    description?: string;
    videoDuration?: number;
    content?: string;
}

export interface UpdateLessonDto {
    title?: string;
    description?: string;
    videoDuration?: number;
    content?: string;
}

// 1. Tạo bài học mới trong một khóa học (Có hỗ trợ upload file video)
export async function createLesson(courseId: number, data: CreateLessonDto, file?: File): Promise<Lesson> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.videoDuration !== undefined) formData.append('videoDuration', String(data.videoDuration));
    if (data.content) formData.append('content', data.content);
    if (file) {
        formData.append('videoUrl', file);
    }

    const response = await api.post(`/lessons/${courseId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// 2. Lấy tất cả bài học thuộc về một khóa học cụ thể
export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data;
}

// 3. Lấy thông tin chi tiết một bài học
export async function getLessonById(id: number): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
}

// 4. Cập nhật bài học (Hỗ trợ thay thế/cập nhật file video)
export async function updateLesson(
    courseId: number,
    lessonId: number,
    data: UpdateLessonDto,
    file?: File
): Promise<Lesson> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.videoDuration !== undefined) formData.append('videoDuration', String(data.videoDuration));
    if (data.content) formData.append('content', data.content);
    if (file) {
        formData.append('videoUrl', file);
    }

    const response = await api.patch(`/lessons/${courseId}`, formData, {
        params: { lessonId },
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// 5. Xóa bài học
export async function deleteLesson(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
}

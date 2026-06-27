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
    prerequisites?: { prerequisiteLessonId: number; targetLessonId: number }[];
}

export interface CreateLessonDto {
    title: string;
    description?: string;
    videoDuration?: number;
    content?: string;
    videoUrl?: string;
    prerequisiteLessonIds?: number[];
}

export interface UpdateLessonDto {
    title?: string;
    description?: string;
    videoDuration?: number;
    content?: string;
    videoUrl?: string;
    prerequisiteLessonIds?: number[];
    clearPrerequisites?: boolean;
}

// 1. Tạo bài học mới trong một khóa học (Có hỗ trợ upload file video)
export async function createLesson(courseId: number, data: CreateLessonDto, file?: File): Promise<Lesson> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.videoDuration !== undefined) formData.append('videoDuration', String(data.videoDuration));
    if (data.content) formData.append('content', data.content);
    if (data.videoUrl !== undefined) formData.append('videoUrl', data.videoUrl);
    if (data.prerequisiteLessonIds) {
        formData.append('prerequisiteLessonIds', JSON.stringify(data.prerequisiteLessonIds));
    }
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

const ORDER_REGEX = /^\[Order:(\d+)\]\s*/;

export function parseLessonOrder(title: string): { order: number; cleanTitle: string } {
    const match = title.match(ORDER_REGEX);
    if (match) {
        return {
            order: parseInt(match[1], 10),
            cleanTitle: title.replace(ORDER_REGEX, ''),
        };
    }
    return {
        order: 999999,
        cleanTitle: title,
    };
}

// 2. Lấy tất cả bài học thuộc về một khóa học cụ thể
export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    const response = await api.get(`/lessons/course/${courseId}`);
    const data: Lesson[] = response.data || [];
    
    // Sort lessons by their order index prefix
    const sorted = [...data].sort((a, b) => {
        const orderA = parseLessonOrder(a.title || '').order;
        const orderB = parseLessonOrder(b.title || '').order;
        return orderA - orderB;
    });

    // Strip the order prefix from the titles
    return sorted.map(lesson => ({
        ...lesson,
        title: parseLessonOrder(lesson.title || '').cleanTitle,
    }));
}

// 3. Lấy thông tin chi tiết một bài học
export async function getLessonById(id: number): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}`);
    const lesson = response.data;
    if (lesson && lesson.title) {
        lesson.title = parseLessonOrder(lesson.title).cleanTitle;
    }
    return lesson;
}

// 4. Cập nhật bài học (Hỗ trợ thay thế/cập nhật file video)
export async function updateLesson(
    courseId: number,
    lessonId: number,
    data: UpdateLessonDto,
    file?: File
): Promise<Lesson> {
    // If the data has a title, we check if the existing lesson in the database had an order prefix and preserve it
    let finalTitle = data.title;
    if (finalTitle) {
        try {
            // Call raw API to get the database lesson directly (without stripping prefix)
            const rawResponse = await api.get(`/lessons/${lessonId}`);
            const match = rawResponse.data?.title?.match(ORDER_REGEX);
            if (match) {
                finalTitle = `[Order:${match[1]}] ${finalTitle.replace(ORDER_REGEX, '')}`;
            }
        } catch (e) {
            console.warn('Could not retrieve existing lesson title prefix:', e);
        }
    }

    const formData = new FormData();
    if (finalTitle) formData.append('title', finalTitle);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.videoDuration !== undefined) formData.append('videoDuration', String(data.videoDuration));
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.videoUrl !== undefined) formData.append('videoUrl', data.videoUrl);
    if (data.prerequisiteLessonIds) {
        formData.append('prerequisiteLessonIds', JSON.stringify(data.prerequisiteLessonIds));
    }
    if (data.clearPrerequisites !== undefined) {
        formData.append('clearPrerequisites', String(data.clearPrerequisites));
    }
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

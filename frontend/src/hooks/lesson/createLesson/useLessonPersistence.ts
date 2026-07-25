import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import api from '../../../lib/axios';
import {
    createLesson,
    type Lesson,
    updateLesson,
} from '../../../services/lesson/lesson.service';
import { updateCourse } from '../../../services/course/course.service';

import type {
    Assessment,
    LessonStatus,
} from '../../../types/lesson/create-lesson.types';

import {
    buildLessonApiPayload,
} from '../../../utils/lesson/lessonPayload';

import type { UseLessonFormReturn } from './useLessonForm';
import type { UseLessonDataReturn } from './useLessonData';
import type { UseLessonDraftFlowReturn } from './useLessonDraftFlow';

type UseLessonPersistenceParams = {
    searchParams: URLSearchParams;
    navigate: NavigateFunction;

    form: UseLessonFormReturn;
    data: UseLessonDataReturn;
    draftFlow: UseLessonDraftFlowReturn;

    showFeedback: (message: string) => void;
};

/**
 * Custom hook quản lý việc lưu trữ (Persistence) và đồng bộ thông tin bài học lên Backend.
 * Xử lý:
 * - Validate tiêu đề bài học.
 * - Gọi dịch vụ tạo bài học (`createLesson`) hoặc cập nhật bài học (`updateLesson`) kèm file video.
 * - Duyệt qua và lưu tuần tự các bài kiểm tra (Assessment), các câu hỏi (Questions), và các phương án trả lời (Options) tương ứng lên API.
 * - Lưu bản sao của Assessment đã lưu thành công vào localStorage để sử dụng ngoại tuyến / hiển thị nhanh.
 * - Điều hướng học viên quay trở lại trang trước đó qua tham số `redirectBack` của URL.
 */
export function useLessonPersistence({
    searchParams,
    navigate,
    form,
    data,
    draftFlow,
    showFeedback,
}: UseLessonPersistenceParams) {
    const [isSaving, setIsSaving] = useState(false); // Trạng thái đang gửi yêu cầu lưu lên máy chủ

    /**
     * Xác thực thông tin biểu mẫu bài học và gọi hàm lưu bài học lên API.
     * 
     * @param nextStatus - Trạng thái bài học tiếp theo ('draft' | 'published')
     * @returns Thông tin bài học đã lưu từ API hoặc null nếu thất bại
     */
    async function persistLesson(nextStatus: LessonStatus): Promise<Lesson | null> {
        if (!form.title.trim()) {
            form.setTitleError(true);
            showFeedback('Lesson title is required.');
            return null;
        }

        if (form.hasAssessment && form.assessments.length === 0) {
            showFeedback('Create a Lesson Quiz, Practice, or PvP assessment before saving.');
            return null;
        }

        const invalidPvpAssessment = form.assessments.find(a => a.type === 'PVP' && (!a.questions || a.questions.length < 5));
        if (invalidPvpAssessment) {
            showFeedback(`PvP Assessment "${invalidPvpAssessment.title}" must have at least 5 questions.`);
            return null;
        }

        return saveToApi(nextStatus);
    }

    /**
     * Thực hiện gửi yêu cầu API lưu bài học (Tạo mới hoặc Cập nhật) cùng các dữ liệu con liên quan.
     * 
     * @param nextStatus - Trạng thái mong muốn của bài học
     */
    async function saveToApi(nextStatus: LessonStatus) {
        const explicitCourseId = Number(
            searchParams.get('courseId') || searchParams.get('id')
        );

        // Kiểm tra nếu bài học đang được dựng từ Course Builder mà thiếu ID khóa học
        if (
            draftFlow.isCourseBuilder &&
            (!Number.isFinite(explicitCourseId) || explicitCourseId <= 0)
        ) {
            showFeedback('Missing course id. Go back to the course builder and create the lesson again.');
            return null;
        }

        if (!data.selectedCourseId) {
            showFeedback('Please select a course before saving the lesson.');
            return null;
        }

        setIsSaving(true);

        try {
            // Đóng gói payload bài học chuẩn
            const payload = buildLessonApiPayload({
                title: form.title,
                description: form.description,
                duration: form.duration,
                hasVideo: form.hasVideo,
                hasReading: form.hasReading,
                content: form.content,
                videoUrl: form.videoUrl,
                objectives: form.objectives,
                resources: form.resources,
                quizQuestions: form.quizQuestions,
                prerequisiteLessonIds: form.prerequisiteLessonIds,
            });

            const existingId = data.editingLessonId ?? data.savedLessonId;

            // Gọi API cập nhật hoặc tạo mới bài học kèm video file đính kèm nếu có
            const saved = existingId
                ? await updateLesson(
                    data.selectedCourseId,
                    existingId,
                    payload,
                    form.videoFile ?? undefined
                )
                : await createLesson(
                    data.selectedCourseId,
                    payload,
                    form.videoFile ?? undefined
                );

            const nextLessonId = Number(saved.lessonId);
            const treePayload = {
                assessments: form.assessments.map(assessment => {
                    const assessmentId = Number(
                        assessment.assessmentId ||
                        (!String(assessment.id).startsWith('ast-') ? assessment.id : 0)
                    );
                    return {
                        ...(assessmentId > 0 ? { assessmentId } : {}),
                        title: assessment.title,
                        type: assessment.type,
                        questions: assessment.questions.map((question, questionIndex) => {
                            const questionId = !String(question.id).startsWith('q-')
                                ? Number(question.id)
                                : 0;
                            return {
                                ...(questionId > 0 ? { questionId } : {}),
                                content: question.content,
                                type: question.type,
                                points: question.points || 10,
                                position: questionIndex + 1,
                                options: question.options.map((option, optionIndex) => {
                                    const optionId = !String(option.id).startsWith('opt-')
                                        ? Number(option.id)
                                        : 0;
                                    return {
                                        ...(optionId > 0 ? { optionId } : {}),
                                        content: option.content,
                                        isCorrect: option.isCorrect,
                                        position: optionIndex + 1,
                                    };
                                }),
                            };
                        }),
                    };
                }),
            };
            const treeResponse = await api.put(
                '/assessment/courses/' + data.selectedCourseId +
                '/lesson/' + nextLessonId + '/tree',
                treePayload,
            );
            const savedAssessments: Assessment[] = treeResponse.data.map((assessment: {
                assessmentId: number;
                title: string;
                type: Assessment['type'];
                questions?: Array<{
                    questionId: number;
                    content: string;
                    type: Assessment['questions'][number]['type'];
                    points: number;
                    options?: Array<{
                        optionId: number;
                        content: string;
                        isCorrect: boolean;
                    }>;
                }>;
            }) => ({
                id: String(assessment.assessmentId),
                assessmentId: assessment.assessmentId,
                title: assessment.title,
                type: assessment.type,
                questions: (assessment.questions || []).map(question => ({
                    id: String(question.questionId),
                    content: question.content,
                    type: question.type,
                    points: Number(question.points),
                    options: (question.options || []).map(option => ({
                        id: String(option.optionId),
                        content: option.content,
                        isCorrect: Boolean(option.isCorrect),
                    })),
                })),
            }));
            form.setAssessments(savedAssessments);
            // Lưu kết quả đồng bộ Assessment xuống localStorage để cache cục bộ
            localStorage.setItem(`assessments_lesson_${nextLessonId}`, JSON.stringify(savedAssessments));
            
            // Cập nhật lại state để có ID thật từ DB, tránh duplicate ở lần save tiếp theo
            form.setAssessments(savedAssessments);

            // Nếu cập nhật bài học cũ, tự động đưa khóa học về trạng thái 'draft' (cần phê duyệt lại)
            if (existingId) {
                await updateCourse(data.selectedCourseId, { status: 'draft' });
            }

            data.setSavedLessonId(nextLessonId);

            if (existingId) {
                data.setEditingLessonId(nextLessonId);
            }

            form.setStatus(nextStatus);
            form.setVideoFile(null);
            form.setVideoUploaded(Boolean(saved.videoUrl || form.videoUrl));

            // Tải lại danh sách bài học trên giao diện
            await data.reloadLessons(data.selectedCourseId);

            showFeedback('Lesson saved to database.');

            // Kiểm tra và chuyển hướng người dùng nếu có redirect URL
            const redirectBack = searchParams.get('redirectBack');
            if (redirectBack) {
                setTimeout(() => navigate(redirectBack), 1200);
            }

            return saved;
        } catch (error: unknown) {
            console.error('Failed to save lesson:', error);

            const message = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            showFeedback(message || 'Failed to save lesson.');

            return null;
        } finally {
            setIsSaving(false);
        }
    }

    // Đánh dấu lưu và xuất bản bài học (published)
    function handleSaveLesson() {
        persistLesson('published');
    }

    return {
        isSaving,
        persistLesson,
        handleSaveLesson,
    };
}

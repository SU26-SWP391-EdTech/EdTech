import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import api from '../../../lib/axios';
import {
    createLesson,
    updateLesson,
} from '../../../services/lesson/lesson.service';
import { updateCourse } from '../../../services/course/course.service';

import type {
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
    async function persistLesson(nextStatus: LessonStatus): Promise<any | null> {
        if (!form.title.trim()) {
            form.setTitleError(true);
            showFeedback('Lesson title is required.');
            return null;
        }

        // Validate PVP assessments if present
        for (const ass of form.assessments) {
            if (ass.type === 'PVP' && ass.questions.length < 5) {
                showFeedback(`PvP Arena Quiz "${ass.title}" must have at least 5 questions (currently has ${ass.questions.length}).`);
                return null;
            }
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

            // Persist the assessment tree without duplicating existing records.
            // IDs prefixed with ast-/q-/opt- only exist on the client.
            const savedAssessments = [];
            for (const ass of form.assessments) {
                let assessmentId = Number(
                    ass.assessmentId ||
                    (!String(ass.id).startsWith('ast-') ? ass.id : 0)
                );

                if (!assessmentId) {
                    const response = await api.post('/assessment', {
                        courseId: data.selectedCourseId,
                        lessonId: nextLessonId,
                        title: ass.title,
                        type: ass.type,
                    });
                    assessmentId = Number(response.data?.assessmentId);
                    if (!assessmentId) {
                        throw new Error('Assessment was created without an assessmentId');
                    }
                }

                const savedQuestions = [];
                for (let qIdx = 0; qIdx < (ass.questions || []).length; qIdx++) {
                    const q = ass.questions[qIdx];
                    let questionId = !String(q.id).startsWith('q-') ? Number(q.id) : 0;
                    const questionPayload = {
                        content: q.content,
                        type: q.type,
                        points: q.points || 10,
                        position: qIdx + 1,
                    };
                    const questionBasePath = '/question/courses/' + data.selectedCourseId +
                        '/lesson/' + nextLessonId + '/assessment/' + assessmentId;

                    if (questionId) {
                        await api.patch(questionBasePath + '/question/' + questionId, questionPayload);
                    } else {
                        const qResponse = await api.post(questionBasePath, questionPayload);
                        questionId = Number(qResponse.data?.questionId);
                        if (!questionId) {
                            throw new Error('Question was created without a questionId');
                        }
                    }

                    const savedOptions = [];
                    for (let oIdx = 0; oIdx < (q.options || []).length; oIdx++) {
                        const opt = q.options[oIdx];
                        let optionId = !String(opt.id).startsWith('opt-') ? Number(opt.id) : 0;

                        if (optionId) {
                            const optResponse = await api.patch('/question/option/' + optionId, {
                                content: opt.content,
                                isCorrect: opt.isCorrect,
                            });
                            savedOptions.push(optResponse.data);
                        } else {
                            const optResponse = await api.post('/question/' + questionId + '/option', {
                                content: opt.content,
                                isCorrect: opt.isCorrect,
                                position: oIdx + 1,
                            });
                            optionId = Number(optResponse.data?.optionId);
                            if (!optionId) {
                                throw new Error('Question option was created without an optionId');
                            }
                            savedOptions.push(optResponse.data);
                        }
                    }

                    const optionIds = savedOptions
                        .map(option => Number(option.optionId || option.id))
                        .filter(Number.isFinite);
                    if (optionIds.length > 0) {
                        await api.patch('/question/' + questionId + '/options/reorder', { optionIds });
                    }

                    savedQuestions.push({
                        ...q,
                        id: String(questionId),
                        questionId,
                        options: savedOptions.map(option => ({
                            id: String(option.optionId || option.id),
                            content: option.content,
                            isCorrect: Boolean(option.isCorrect),
                        })),
                    });
                }

                savedAssessments.push({
                    ...ass,
                    id: String(assessmentId),
                    assessmentId,
                    questions: savedQuestions,
                });
            }
            // Lưu kết quả đồng bộ Assessment xuống localStorage để cache cục bộ
            localStorage.setItem(`assessments_lesson_${nextLessonId}`, JSON.stringify(savedAssessments));

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
        } catch (error: any) {
            console.error('Failed to save lesson:', error);

            showFeedback(
                error.response?.data?.message || 'Failed to save lesson.'
            );

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

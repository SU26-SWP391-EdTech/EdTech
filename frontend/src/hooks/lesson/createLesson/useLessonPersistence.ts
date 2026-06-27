import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

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

export function useLessonPersistence({
    searchParams,
    navigate,
    form,
    data,
    draftFlow,
    showFeedback,
}: UseLessonPersistenceParams) {
    const [isSaving, setIsSaving] = useState(false);

    async function persistLesson(nextStatus: LessonStatus): Promise<any | null> {
        if (!form.title.trim()) {
            form.setTitleError(true);
            showFeedback('Lesson title is required.');
            return null;
        }

        return saveToApi(nextStatus);
    }

    async function saveToApi(nextStatus: LessonStatus) {
        const explicitCourseId = Number(
            searchParams.get('courseId') || searchParams.get('id')
        );

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
            const payload = buildLessonApiPayload({
                title: form.title,
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

            await data.reloadLessons(data.selectedCourseId);

            showFeedback('Lesson saved to database.');

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

    function handleSaveLesson() {
        persistLesson('published');
    }

    return {
        isSaving,
        persistLesson,
        handleSaveLesson,
    };
}

import type { NavigateFunction } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  createCourse,
  submitCourseToReview,
  submitNewCourseToReview,
  updateCourse,
} from '../../../services/course/course.service';
import {
  createLesson,
  deleteLesson as apiDeleteLesson,
  updateLesson,
} from '../../../services/lesson/lesson.service';
import type { CourseBuilderLesson, CourseDraft } from '../../../types/course/create-course.types';
import { clearCourseDraft } from '../../../utils/course/courseDraftStorage';
import { buildCourseFormData } from '../../../utils/course/courseFormData';
import { buildLessonSyncPayload } from '../../../utils/course/courseMappers';

interface UseCoursePersistenceOptions {
  deletedLessonIds: number[];
  editId: number | null;
  getCurrentCourseDraft: () => CourseDraft;
  lessons: CourseBuilderLesson[];
  navigate: NavigateFunction;
  setIsSubmitting: (isSubmitting: boolean) => void;
  thumbnailFile: File | null;
  title: string;
}

export function useCoursePersistence({
  deletedLessonIds,
  editId,
  getCurrentCourseDraft,
  lessons,
  navigate,
  setIsSubmitting,
  thumbnailFile,
  title,
}: UseCoursePersistenceOptions) {
  async function syncLessons(courseId: number) {
    for (const lessonId of deletedLessonIds) {
      try {
        await apiDeleteLesson(lessonId);
      } catch (err) {
        console.error(`Failed to delete lesson ${lessonId}:`, err);
      }
    }

    let index = 1;
    for (const lesson of lessons) {
      try {
        const payload = buildLessonSyncPayload(lesson, index++);
        const isNew = lesson.id.startsWith('l-');
        if (isNew) {
          await createLesson(courseId, payload);
        } else {
          await updateLesson(courseId, Number(lesson.id), payload);
        }
      } catch (err) {
        console.error('Failed to sync lesson:', err);
      }
    }
  }

  async function handleSubmit(status: 'draft' | 'pending') {
    if (!title.trim()) {
      toast.error('Course Title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = await buildCourseFormData({
        status,
        thumbnailFile,
        draft: getCurrentCourseDraft(),
      });

      let courseId = editId;
      if (editId) {
        await updateCourse(editId, formData);
        await updateCourse(editId, { status: 'draft' });
      } else {
        const newCourse = status === 'pending'
          ? await submitNewCourseToReview(formData)
          : await createCourse(formData);
        courseId = newCourse.courseId;
      }

      await syncLessons(courseId!);

      if (editId && status === 'pending') {
        await submitCourseToReview(editId);
      }

      if (!editId) {
        clearCourseDraft();
      }

      toast.success(editId ? 'Course updated successfully!' : 'Course created successfully!');
      navigate('/provider/courses');
    } catch (err: unknown) {
      console.error(err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function ensureCourseExistsForLesson() {
    if (editId) return editId;

    if (!title.trim()) {
      toast.error('Course Title is required before creating a lesson.');
      return null;
    }

    setIsSubmitting(true);
    try {
      const formData = await buildCourseFormData({
        status: 'draft',
        thumbnailFile,
        draft: getCurrentCourseDraft(),
      });

      const newCourse = await createCourse(formData);
      clearCourseDraft();
      toast.success('Course draft saved. You can now create lessons.');
      return newCourse.courseId;
    } catch (err: unknown) {
      console.error('Failed to create course draft before lesson:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || 'Failed to save course draft before creating lesson.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openLessonEditor(lessonId?: string) {
    const courseId = await ensureCourseExistsForLesson();
    if (!courseId) return;

    const backUrl = encodeURIComponent(`/provider/courses/create?id=${courseId}`);
    const lessonParam = lessonId ? `&lessonId=${lessonId}` : '';
    const courseTitleParam = !editId && title.trim() ? `&courseTitle=${encodeURIComponent(title.trim())}` : '';
    navigate(`/provider/lessons/create?redirectBack=${backUrl}&isCourseBuilder=true&courseId=${courseId}${lessonParam}${courseTitleParam}`);
  }

  return {
    handleSubmit,
    openLessonEditor,
  };
}

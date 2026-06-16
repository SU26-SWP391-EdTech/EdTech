import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  searchCourses,
  type BackendCourse,
} from '../../../services/course/course.service';

import {
  getLessonById,
  getLessonsByCourse,
  type Lesson,
} from '../../../services/lesson/lesson.service';

import type { UseLessonFormReturn } from './useLessonForm';

type UseLessonDataParams = {
  userId?: number;
  searchParams: URLSearchParams;
  showFeedback: (message: string) => void;
  hydrateFromApiLesson: UseLessonFormReturn['hydrateFromApiLesson'];
};

export function useLessonData({
  userId,
  searchParams,
  showFeedback,
  hydrateFromApiLesson,
}: UseLessonDataParams) {
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [savedLessonId, setSavedLessonId] = useState<number | null>(null);

  const selectedCourse = useMemo(() => {
    return courses.find(course => course.courseId === selectedCourseId) ?? null;
  }, [courses, selectedCourseId]);

  const lessonOrder = useMemo(() => {
    const targetId = editingLessonId ?? savedLessonId;

    if (targetId) {
      const index = lessons.findIndex(
        lesson => Number(lesson.lessonId) === targetId
      );

      if (index !== -1) {
        return index + 1;
      }
    }

    return lessons.length + 1;
  }, [lessons, editingLessonId, savedLessonId]);

  useEffect(() => {
    const queryCourseId = Number(
      searchParams.get('courseId') || searchParams.get('id')
    );

    const queryLessonIdStr = searchParams.get('lessonId');
    const queryLessonId = Number(queryLessonIdStr);

    if (Number.isFinite(queryCourseId) && queryCourseId > 0) {
      setSelectedCourseId(queryCourseId);
    }

    if (
      queryLessonIdStr &&
      !queryLessonIdStr.startsWith('l-') &&
      Number.isFinite(queryLessonId) &&
      queryLessonId > 0
    ) {
      setEditingLessonId(queryLessonId);
      setSavedLessonId(queryLessonId);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadCourses() {
      try {
        const params = userId ? { userId } : undefined;
        const response = await searchCourses(params);
        const items = response.data?.items || [];

        setCourses(items);

        setSelectedCourseId(current => {
          return current ?? items[0]?.courseId ?? null;
        });
      } catch (error) {
        console.error('Failed to load courses:', error);
        showFeedback('Could not load courses from database.');
      }
    }

    loadCourses();
  }, [userId, showFeedback]);

  const reloadLessons = useCallback(
    async (courseId = selectedCourseId) => {
      if (!courseId) {
        setLessons([]);
        return;
      }

      try {
        const data = await getLessonsByCourse(courseId);
        setLessons(data);
      } catch {
        setLessons([]);
      }
    },
    [selectedCourseId]
  );

  useEffect(() => {
    reloadLessons();
  }, [reloadLessons]);

  useEffect(() => {
    if (!editingLessonId) return;

    async function loadLessonDetail() {
      try {
        const lesson = await getLessonById(editingLessonId);
        hydrateFromApiLesson(lesson);
      } catch (error) {
        console.error('Failed to load lesson detail:', error);
        showFeedback('Could not load lesson detail.');
      }
    }

    loadLessonDetail();
  }, [editingLessonId, hydrateFromApiLesson, showFeedback]);

  function resetLessonIdentity() {
    setEditingLessonId(null);
    setSavedLessonId(null);
  }

  return {
    courses,

    selectedCourseId,
    setSelectedCourseId,
    selectedCourse,

    lessons,
    setLessons,
    reloadLessons,

    lessonOrder,

    editingLessonId,
    setEditingLessonId,

    savedLessonId,
    setSavedLessonId,

    resetLessonIdentity,
  };
}

export type UseLessonDataReturn = ReturnType<typeof useLessonData>;
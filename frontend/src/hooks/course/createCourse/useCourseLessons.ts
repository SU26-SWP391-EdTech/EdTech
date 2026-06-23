import { useState } from 'react';
import toast from 'react-hot-toast';

import { deleteLesson as apiDeleteLesson } from '../../../services/lesson/lesson.service';
import type { CourseBuilderLesson } from '../../../types/course/create-course.types';

interface UseCourseLessonsOptions {
  editId: number | null;
}

export function useCourseLessons({ editId }: UseCourseLessonsOptions) {
  const [deletedLessonIds, setDeletedLessonIds] = useState<number[]>([]);
  const [lessons, setLessons] = useState<CourseBuilderLesson[]>([]);
  const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);

  function toggleLessonLock(lessonId: string) {
    setLessons(prev => prev.map(lesson => (
      lesson.id === lessonId
        ? { ...lesson, locked: !lesson.locked }
        : lesson
    )));
  }

  async function deleteLesson(lessonId: string) {
    if (!lessonId.startsWith('l-') && editId) {
      try {
        await apiDeleteLesson(Number(lessonId));
        toast.success('Lesson removed.');
      } catch (err) {
        console.error(`Failed to delete lesson ${lessonId}:`, err);
        toast.error('Failed to remove lesson.');
        return;
      }
    } else if (!lessonId.startsWith('l-')) {
      setDeletedLessonIds(prev => [...prev, Number(lessonId)]);
    }

    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
  }

  function dragLesson(targetIndex: number) {
    if (draggedLessonIndex === null || draggedLessonIndex === targetIndex) return;

    const updated = [...lessons];
    const draggedItem = updated[draggedLessonIndex];
    updated.splice(draggedLessonIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    setLessons(updated);
    setDraggedLessonIndex(targetIndex);
  }

  function clearDraggedLesson() {
    setDraggedLessonIndex(null);
  }

  return {
    deletedLessonIds,
    lessons,
    setLessons,
    draggedLessonIndex,
    setDraggedLessonIndex,
    toggleLessonLock,
    deleteLesson,
    dragLesson,
    clearDraggedLesson,
  };
}

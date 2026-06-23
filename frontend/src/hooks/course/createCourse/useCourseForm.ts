import { useState } from 'react';

import type { BackendCourse } from '../../../services/course/course.service';
import type { CourseBuilderLesson, CourseDraft } from '../../../types/course/create-course.types';

export function useCourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [projectUrl, setProjectUrl] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [prerequisiteCourseIds, setPrerequisiteCourseIds] = useState<number[]>([]);

  function hydrateFromCourse(course: BackendCourse) {
    setTitle(course.title || '');
    setDescription(course.description || '');
    setLanguage(course.language || 'English');
    setProjectUrl(course.projectUrl || '');

    const totalDuration = course.duration || 0;
    setDurationHours(Math.floor(totalDuration / 60));
    setDurationMinutes(totalDuration % 60);
  }

  function getCurrentCourseDraft(lessons: CourseBuilderLesson[], thumbnailPreview: string | null): CourseDraft {
    return {
      title,
      description,
      language,
      durationHours,
      durationMinutes,
      projectUrl,
      outcomes,
      prerequisiteCourseIds,
      thumbnailPreview,
      lessons,
    };
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    language,
    setLanguage,
    durationHours,
    setDurationHours,
    durationMinutes,
    setDurationMinutes,
    projectUrl,
    setProjectUrl,
    outcomes,
    setOutcomes,
    prerequisiteCourseIds,
    setPrerequisiteCourseIds,
    hydrateFromCourse,
    getCurrentCourseDraft,
  };
}

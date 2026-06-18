import { TEMP_CREATED_LESSON_KEY } from '../../constants/courseDraft.constants';
import type { CourseBuilderLesson } from '../../types/course/create-course.types';

export function readTempCreatedLesson(): CourseBuilderLesson | null {
    const saved = localStorage.getItem(TEMP_CREATED_LESSON_KEY);
    if (!saved) return null;

    try {
        const parsed = JSON.parse(saved);
        return (parsed.lesson || parsed) as CourseBuilderLesson;
    } catch {
        return null;
    }
}

export function writeTempCreatedLesson(lesson: CourseBuilderLesson) {
    localStorage.setItem(TEMP_CREATED_LESSON_KEY, JSON.stringify({ lesson }));
}

export function clearTempCreatedLesson() {
    localStorage.removeItem(TEMP_CREATED_LESSON_KEY);
}

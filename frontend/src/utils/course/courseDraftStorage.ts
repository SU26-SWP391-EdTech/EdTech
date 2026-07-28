import { CREATE_COURSE_DRAFT_KEY } from '../../constants/courseDraft.constants';
import type { CourseBuilderLesson, CourseDraft } from '../../types/course/create-course.types';

export function readCourseDraft(): CourseDraft | null {
    const saved = localStorage.getItem(CREATE_COURSE_DRAFT_KEY);
    if (!saved) return null;

    try {
        return JSON.parse(saved) as CourseDraft;
    } catch {
        return null;
    }
}

export function writeCourseDraft(draft: CourseDraft) {
    localStorage.setItem(CREATE_COURSE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearCourseDraft() {
    localStorage.removeItem(CREATE_COURSE_DRAFT_KEY);
}

export function hasUsableCourseDraft(draft: CourseDraft | null): boolean {
    if (!draft) return false;
    return Boolean(draft.title || draft.description || (draft.lessons && draft.lessons.length > 0));
}

export function mergeLessonIntoCourseDraft(lesson: CourseBuilderLesson): CourseBuilderLesson[] {
    const draft = readCourseDraft();
    const existingLessons = draft?.lessons || [];
    const lessons = mergeLessonIntoList(existingLessons, lesson);

    if (draft) {
        writeCourseDraft({ ...draft, lessons });
    }

    return lessons;
}

export function mergeLessonIntoList(lessons: CourseBuilderLesson[], lesson: CourseBuilderLesson): CourseBuilderLesson[] {
    const exists = lessons.some((item) => item.id === lesson.id);
    return exists
        ? lessons.map((item) => (item.id === lesson.id ? lesson : item))
        : [...lessons, lesson];
}

export type CourseBuilderLessonType = 'Video' | 'Reading' | 'Quiz' | 'Assignment' | 'Video & Reading';

export interface CourseBuilderLesson {
    id: string;
    title: string;
    type: CourseBuilderLessonType;
    duration: string;
    locked: boolean;
    content?: string;
    videoUrl?: string;
    description?: string;
    hasVideo?: boolean;
    hasReading?: boolean;
}

export interface CourseDraft {
    title?: string;
    description?: string;
    language?: string;
    durationHours?: number | string;
    durationMinutes?: number | string;
    projectUrl?: string;
    outcomes?: string[];
    prerequisiteCourseIds?: number[];
    thumbnailPreview?: string | null;
    lessons?: CourseBuilderLesson[];
}

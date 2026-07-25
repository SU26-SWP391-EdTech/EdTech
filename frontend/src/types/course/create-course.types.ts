export type CourseBuilderLessonType = 'Video' | 'Reading' | 'Quiz' | 'Assignment' | 'Video & Reading' | 'Assessment';

export interface CourseBuilderLesson {
    id: string;
    position: number;
    title: string;
    type: CourseBuilderLessonType;
    duration: string;
    content?: string;
    videoUrl?: string;
    description?: string;
    hasVideo?: boolean;
    hasReading?: boolean;
    hasAssessment?: boolean;
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
    tags?: string[];
    thumbnailPreview?: string | null;
    lessons?: CourseBuilderLesson[];
}

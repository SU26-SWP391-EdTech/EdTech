import type { CourseBuilderLesson } from '../../types/course/create-course.types';
import type { LessonStatus, Objective, QuizQuestion, Resource } from '../../types/lesson/create-lesson.types';
import { buildLessonContent } from './lessonContentBuilder';

export function buildLocalLessonDraft(options: {
    localLessonId: string | null;
    title: string;
    duration: string;
    hasVideo: boolean;
    hasReading: boolean;
    content: string;
    videoUrl: string;
    objectives: Objective[];
    resources: Resource[];
    quizQuestions: QuizQuestion[];
}): CourseBuilderLesson {
    const hasVideoAndReading = options.hasVideo && options.hasReading;

    return {
        id: options.localLessonId || `l-${Date.now()}`,
        title: options.title.trim(),
        type: hasVideoAndReading ? 'Video & Reading' : options.hasVideo ? 'Video' : 'Reading',
        duration: options.duration ? `${options.duration} min` : '10 min',
        locked: false,
        content: buildLessonContent(options),
        videoUrl: options.hasVideo ? (options.videoUrl.trim() || undefined) : undefined,
        description: '',
        hasVideo: options.hasVideo,
        hasReading: options.hasReading,
    };
}

export function buildLessonApiPayload(options: {
    title: string;
    duration: string;
    hasVideo: boolean;
    hasReading: boolean;
    content: string;
    videoUrl: string;
    objectives: Objective[];
    resources: Resource[];
    quizQuestions: QuizQuestion[];
    prerequisiteLessonIds?: number[];
}) {
    let videoSec = 0;
    if (options.hasVideo) {
        const totalMin = Number(options.duration || 0);
        const videoMin = options.hasReading ? Math.max(0, totalMin - 10) : totalMin;
        videoSec = videoMin * 60;
    }
    return {
        title: options.title.trim(),
        description: '',
        videoDuration: options.hasVideo ? videoSec : undefined,
        content: buildLessonContent(options) || undefined,
        videoUrl: options.hasVideo ? options.videoUrl.trim() : '',
        prerequisiteLessonIds: options.prerequisiteLessonIds,
    };
}

export function getChecklistState(options: {
    title: string;
    hasVideo: boolean;
    videoUploaded: boolean;
    videoUrl: string;
    hasReading: boolean;
    content: string;
    objectives: Objective[];
    duration: string;
    resources: Resource[];
    completionRule: string;
    status: LessonStatus;
}): Record<string, boolean> {
    return {
        title: options.title.length > 0,
        type: true,
        content: (options.hasVideo ? (options.videoUploaded || options.videoUrl.length > 0) : true)
            && (options.hasReading ? options.content.trim().length > 0 : true),
        objectives: options.objectives.length > 0,
        duration: options.duration.length > 0,
        resources: options.resources.length > 0,
        completion: options.completionRule.length > 0,
        ready: options.status === 'published',
    };
}

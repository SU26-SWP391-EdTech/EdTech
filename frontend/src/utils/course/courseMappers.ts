import type { Lesson as BackendLesson } from '../../services/lesson/lesson.service';
import type { CourseBuilderLesson, CourseBuilderLessonType } from '../../types/course/create-course.types';

const ORDER_REGEX = /^\[Order:(\d+)\]\s*/;

export function mapBackendLessonToCourseBuilderLesson(lesson: BackendLesson): CourseBuilderLesson {
    const hasVideo = Boolean(lesson.videoUrl);
    
    const lessonContent = lesson.content || '';
    let cleanReadingContent = lessonContent;
    const firstSectionIndex = lessonContent.search(/\n*(Objectives|Resources|Quiz Questions):/);
    if (firstSectionIndex !== -1) {
        cleanReadingContent = lessonContent.substring(0, firstSectionIndex).trim();
    }
    const hasReading = Boolean(cleanReadingContent.trim());
    
    let type: CourseBuilderLessonType = 'Reading';
    if (hasVideo && hasReading) {
        type = 'Video & Reading';
    } else if (hasVideo) {
        type = 'Video';
    } else if (hasReading) {
        type = 'Reading';
    }

    const videoMin = lesson.videoDuration ? Math.round(lesson.videoDuration / 60) : 0;
    let mins = 10;
    if (hasVideo && hasReading) {
        mins = videoMin + 10;
    } else if (hasVideo) {
        mins = videoMin;
    } else if (hasReading) {
        mins = 10;
    }

    const cleanTitle = lesson.title.replace(ORDER_REGEX, '');

    return {
        id: String(lesson.lessonId),
        title: cleanTitle,
        type,
        duration: `${mins} min`,
        locked: false,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        description: lesson.description || '',
    };
}

export function buildLessonSyncPayload(lesson: CourseBuilderLesson, index?: number) {
    const cleanTitle = lesson.title.replace(ORDER_REGEX, '');
    const title = typeof index === 'number' ? `[Order:${index}] ${cleanTitle}` : cleanTitle;
    
    let videoSec = 0;
    const totalMin = lesson.duration ? parseInt(lesson.duration) : 0;
    if (lesson.type === 'Video & Reading') {
        videoSec = Math.max(0, totalMin - 10) * 60;
    } else if (lesson.type === 'Video') {
        videoSec = totalMin * 60;
    }

    return {
        title,
        description: lesson.description || '',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        videoDuration: videoSec > 0 ? videoSec : undefined,
    };
}

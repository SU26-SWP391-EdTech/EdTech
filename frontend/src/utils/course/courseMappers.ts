import type { Lesson as BackendLesson } from '../../services/lesson/lesson.service';
import type { CourseBuilderLesson, CourseBuilderLessonType } from '../../types/course/create-course.types';

export function mapBackendLessonToCourseBuilderLesson(lesson: BackendLesson): CourseBuilderLesson {
    return {
        id: String(lesson.lessonId),
        title: lesson.title,
        type: (lesson.videoUrl ? 'Video' : 'Reading') as CourseBuilderLessonType,
        duration: lesson.videoDuration ? `${Math.round(lesson.videoDuration / 60)} min` : '10 min',
        locked: false,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        description: lesson.description || '',
    };
}

export function buildLessonSyncPayload(lesson: CourseBuilderLesson) {
    return {
        title: lesson.title,
        description: lesson.description || '',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        videoDuration: lesson.duration ? parseInt(lesson.duration) * 60 : undefined,
    };
}

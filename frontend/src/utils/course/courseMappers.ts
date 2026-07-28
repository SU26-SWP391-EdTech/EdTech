import type { Lesson as BackendLesson } from '../../services/lesson/lesson.service';
import type { CourseBuilderLesson, CourseBuilderLessonType } from '../../types/course/create-course.types';

export function mapBackendLessonToCourseBuilderLesson(lesson: BackendLesson): CourseBuilderLesson {
    const hasVideo = Boolean(lesson.videoUrl);
    
    const lessonContent = lesson.content || '';
    let cleanReadingContent = lessonContent;
    const firstSectionIndex = lessonContent.search(/\n*(Objectives|Resources|Quiz Questions):/);
    if (firstSectionIndex !== -1) {
        cleanReadingContent = lessonContent.substring(0, firstSectionIndex).trim();
    }
    const hasReading = Boolean(cleanReadingContent.trim());
    
    let hasAssessment = Boolean(lesson.assessments && lesson.assessments.length > 0);
    if (!hasAssessment) {
      const savedAss = localStorage.getItem(`assessments_lesson_${lesson.lessonId}`);
      if (savedAss) {
        try {
          const parsed = JSON.parse(savedAss);
          hasAssessment = parsed && parsed.length > 0;
        } catch (e) {}
      }
    }

    let type: CourseBuilderLessonType = 'Reading';
    if (hasAssessment) {
        type = 'Assessment';
    } else if (hasVideo && hasReading) {
        type = 'Video & Reading';
    } else if (hasVideo) {
        type = 'Video';
    } else if (hasReading) {
        type = 'Reading';
    }

    const videoMin = lesson.videoDuration ? Math.round(lesson.videoDuration / 60) : 0;
    let mins = 10;
    if (hasAssessment) {
        mins = 15;
    } else if (hasVideo && hasReading) {
        mins = videoMin + 10;
    } else if (hasVideo) {
        mins = videoMin;
    } else if (hasReading) {
        mins = 10;
    }

    return {
        id: String(lesson.lessonId),
        position: lesson.position,
        title: lesson.title,
        type,
        duration: `${mins} min`,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        description: lesson.description || '',
        hasAssessment,
    };
}

export function buildLessonSyncPayload(lesson: CourseBuilderLesson) {
    let videoSec = 0;
    const totalMin = lesson.duration ? parseInt(lesson.duration) : 0;
    if (lesson.type === 'Video & Reading') {
        videoSec = Math.max(0, totalMin - 10) * 60;
    } else if (lesson.type === 'Video') {
        videoSec = totalMin * 60;
    }

    return {
        title: lesson.title,
        description: lesson.description || '',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        videoDuration: videoSec > 0 ? videoSec : undefined,
    };
}

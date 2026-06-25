import { useCallback, useState, useEffect } from 'react';

import type {
  LessonStatus,
  Objective,
  QuizQuestion,
  Resource,
} from '../../../types/lesson/create-lesson.types';

import type { Lesson } from '../../../services/lesson/lesson.service';

import {
  parseObjectivesFromContent,
  parseQuizQuestionsFromContent,
  parseResourcesFromContent,
} from '../../../utils/lesson/lessonContentParser';

export function useLessonForm() {
  const [hasVideo, setHasVideo] = useState(true);
  const [hasReading, setHasReading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [videoDurationInput, setVideoDurationInput] = useState('');
  const [status, setStatus] = useState<LessonStatus>('draft');

  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploaded, setVideoUploaded] = useState(false);

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [titleError, setTitleError] = useState(false);
  const [prerequisiteLessonIds, setPrerequisiteLessonIds] = useState<number[]>([]);

  // Auto-calculate lesson duration based on video duration and reading defaults
  useEffect(() => {
    let calculated = 0;
    if (hasVideo && hasReading) {
      calculated = Number(videoDurationInput || 0) + 10;
    } else if (hasVideo) {
      calculated = Number(videoDurationInput || 0);
    } else if (hasReading) {
      calculated = 10;
    } else {
      calculated = 10; // default fallback
    }
    setDuration(calculated > 0 ? String(calculated) : '');
  }, [hasVideo, hasReading, videoDurationInput]);

  const resetFormFields = useCallback(() => {
    setHasVideo(true);
    setHasReading(false);

    setTitle('');
    setDescription('');
    setDuration('');
    setVideoDurationInput('');
    setStatus('draft');

    setVideoUrl('');
    setContent('');
    setVideoFile(null);
    setVideoUploaded(false);

    setObjectives([]);
    setResources([]);
    setQuizQuestions([]);
    setAssessments([]);

    setTitleError(false);
    setPrerequisiteLessonIds([]);
  }, []);

  const hydrateFromApiLesson = useCallback((lesson: Lesson) => {
    const lessonContent = lesson.content || '';

    setTitle(lesson.title || '');
    setDescription(lesson.description || '');

    const hasVid = Boolean(lesson.videoUrl);
    
    // Extract clean reading content
    let cleanReadingContent = lessonContent;
    const firstSectionIndex = lessonContent.search(/\n*(Objectives|Resources|Quiz Questions):/);
    if (firstSectionIndex !== -1) {
        cleanReadingContent = lessonContent.substring(0, firstSectionIndex).trim();
    }
    const hasRead = Boolean(cleanReadingContent.trim());

    setHasVideo(hasVid || (!hasVid && !hasRead));
    setHasReading(hasRead);

    const vidMin = lesson.videoDuration ? Math.round(lesson.videoDuration / 60) : 0;
    setVideoDurationInput(vidMin ? String(vidMin) : '');

    setContent(cleanReadingContent);
    setVideoUrl(lesson.videoUrl || '');
    setVideoUploaded(Boolean(lesson.videoUrl));

    setObjectives(
      lessonContent ? parseObjectivesFromContent(lessonContent) : []
    );

    setResources(
      lessonContent ? parseResourcesFromContent(lessonContent) : []
    );

    setQuizQuestions(
      lessonContent ? parseQuizQuestionsFromContent(lessonContent) : []
    );

    const savedAss = localStorage.getItem(`assessments_lesson_${lesson.lessonId}`);
    if (savedAss) {
      try {
        setAssessments(JSON.parse(savedAss));
      } catch (e) {
        setAssessments([]);
      }
    } else {
      setAssessments([]);
    }

    if (lesson.prerequisites) {
      setPrerequisiteLessonIds(lesson.prerequisites.map(p => Number(p.prerequisiteLessonId)));
    } else {
      setPrerequisiteLessonIds([]);
    }
  }, []);

  const handleVideoFileChange = useCallback((file?: File) => {
    if (!file) return;

    setVideoFile(file);
    setVideoUploaded(true);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const minutes = Math.round(video.duration / 60) || 1;
      setVideoDurationInput(String(minutes));
    };
    video.src = URL.createObjectURL(file);
  }, []);

  const clearVideo = useCallback(() => {
    setVideoUrl('');
    setVideoFile(null);
    setVideoUploaded(false);
    setVideoDurationInput('');
  }, []);

  return {
    hasVideo,
    setHasVideo,

    hasReading,
    setHasReading,

    title,
    setTitle,

    description,
    setDescription,

    duration,
    setDuration,

    videoDurationInput,
    setVideoDurationInput,

    status,
    setStatus,

    videoUrl,
    setVideoUrl,

    content,
    setContent,

    videoFile,
    setVideoFile,

    videoUploaded,
    setVideoUploaded,

    objectives,
    setObjectives,

    resources,
    setResources,

    quizQuestions,
    setQuizQuestions,

    assessments,
    setAssessments,

    titleError,
    setTitleError,

    prerequisiteLessonIds,
    setPrerequisiteLessonIds,

    resetFormFields,
    hydrateFromApiLesson,
    handleVideoFileChange,
    clearVideo,
  };
}

export type UseLessonFormReturn = ReturnType<typeof useLessonForm>;

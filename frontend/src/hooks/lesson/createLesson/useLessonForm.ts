import { useCallback, useState } from 'react';

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
  const [status, setStatus] = useState<LessonStatus>('draft');

  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploaded, setVideoUploaded] = useState(false);

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [titleError, setTitleError] = useState(false);

  const resetFormFields = useCallback(() => {
    setHasVideo(true);
    setHasReading(false);

    setTitle('');
    setDescription('');
    setDuration('');
    setStatus('draft');

    setVideoUrl('');
    setContent('');
    setVideoFile(null);
    setVideoUploaded(false);

    setObjectives([]);
    setResources([]);
    setQuizQuestions([]);

    setTitleError(false);
  }, []);

  const hydrateFromApiLesson = useCallback((lesson: Lesson) => {
    const lessonContent = lesson.content || '';

    setTitle(lesson.title || '');
    setDescription(lesson.description || '');
    setDuration(
      lesson.videoDuration
        ? String(Math.round(lesson.videoDuration / 60))
        : ''
    );

    setContent(lessonContent);
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

    const hasVid = Boolean(lesson.videoUrl);
    const hasRead = Boolean(lesson.content);

    setHasVideo(hasVid || (!hasVid && !hasRead));
    setHasReading(hasRead);
  }, []);

  function handleVideoFileChange(file?: File) {
    if (!file) return;

    setVideoFile(file);
    setVideoUploaded(true);
  }

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

    titleError,
    setTitleError,

    resetFormFields,
    hydrateFromApiLesson,
    handleVideoFileChange,
  };
}

export type UseLessonFormReturn = ReturnType<typeof useLessonForm>;

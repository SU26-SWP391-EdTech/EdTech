import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuthStore } from '../../../stores/auth/auth.stores';

import type { ModalType } from '../../../types/lesson/create-lesson.types';

import { buildLessonContent } from '../../../utils/lesson/lessonContentBuilder';

import { useLessonData } from './useLessonData';
import { useLessonDraftFlow } from './useLessonDraftFlow';
import { useLessonForm } from './useLessonForm';
import { useLessonPersistence } from './useLessonPersistence';
import { useLessonQuizModal } from './useLessonQuizModal';
import { useLessonResourceModal } from './useLessonResourceModal';
import { useLessonToast } from './useLessonToast';

export function useCreateLesson() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useAuthStore(state => state.user);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [modal, setModal] = useState<ModalType>(null);

  const form = useLessonForm();
  const toast = useLessonToast();

  const data = useLessonData({
    userId: user?.userId,
    searchParams,
    showFeedback: toast.showFeedback,
    hydrateFromApiLesson: form.hydrateFromApiLesson,
  });

  const draftFlow = useLessonDraftFlow({
    searchParams,
  });

  function resetForm() {
    form.resetFormFields();
    data.resetLessonIdentity();
  }

  const resourceModal = useLessonResourceModal({
    setResources: form.setResources,
    setModal,
  });

  const quizModal = useLessonQuizModal({
    setQuizQuestions: form.setQuizQuestions,
    setModal,
    showFeedback: toast.showFeedback,
  });

  const persistence = useLessonPersistence({
    searchParams,
    navigate,
    form,
    data,
    draftFlow,
    showFeedback: toast.showFeedback,
  });

  function getContentValue() {
    return buildLessonContent({
      hasReading: form.hasReading,
      content: form.content,
      objectives: form.objectives,
      resources: form.resources,
      quizQuestions: form.quizQuestions,
    });
  }

  return {
    searchParams,
    navigate,

    // form
    hasVideo: form.hasVideo,
    setHasVideo: form.setHasVideo,

    hasReading: form.hasReading,
    setHasReading: form.setHasReading,

    hasAssessment: form.hasAssessment,
    setHasAssessment: form.setHasAssessment,

    title: form.title,
    setTitle: form.setTitle,

    description: form.description,
    setDescription: form.setDescription,

    duration: form.duration,
    setDuration: form.setDuration,

    videoDurationInput: form.videoDurationInput,
    setVideoDurationInput: form.setVideoDurationInput,

    status: form.status,

    videoUrl: form.videoUrl,
    setVideoUrl: form.setVideoUrl,

    content: form.content,
    setContent: form.setContent,

    videoFile: form.videoFile,
    videoUploaded: form.videoUploaded,
    videoInputRef,

    objectives: form.objectives,
    setObjectives: form.setObjectives,

    resources: form.resources,
    setResources: form.setResources,

    quizQuestions: form.quizQuestions,
    setQuizQuestions: form.setQuizQuestions,

    assessments: form.assessments,
    setAssessments: form.setAssessments,

    titleError: form.titleError,
    setTitleError: form.setTitleError,

    prerequisiteLessonIds: form.prerequisiteLessonIds,
    setPrerequisiteLessonIds: form.setPrerequisiteLessonIds,

    // UI
    modal,
    setModal,

    showToast: toast.showToast,
    setShowToast: toast.setShowToast,
    toastMessage: toast.toastMessage,

    isSaving: persistence.isSaving,

    // data
    courses: data.courses,

    selectedCourseId: data.selectedCourseId,
    setSelectedCourseId: data.setSelectedCourseId,
    selectedCourse: data.selectedCourse,

    lessons: data.lessons,
    lessonOrder: data.lessonOrder,

    editingLessonId: data.editingLessonId,
    setEditingLessonId: data.setEditingLessonId,

    savedLessonId: data.savedLessonId,
    setSavedLessonId: data.setSavedLessonId,

    draftCourseTitle: draftFlow.draftCourseTitle,

    // resource modal
    rName: resourceModal.rName,
    setRName: resourceModal.setRName,

    rType: resourceModal.rType,
    setRType: resourceModal.setRType,

    rVisibility: resourceModal.rVisibility,
    setRVisibility: resourceModal.setRVisibility,

    // quiz modal
    qText: quizModal.qText,
    setQText: quizModal.setQText,

    qType: quizModal.qType,
    setQType: quizModal.setQType,

    qOptions: quizModal.qOptions,
    setQOptions: quizModal.setQOptions,

    qCorrect: quizModal.qCorrect,
    setQCorrect: quizModal.setQCorrect,

    shortAnswer: quizModal.shortAnswer,
    setShortAnswer: quizModal.setShortAnswer,

    // handlers
    handleSaveLesson: persistence.handleSaveLesson,

    handleVideoFileChange: form.handleVideoFileChange,
    clearVideo: form.clearVideo,
    handleAddResource: resourceModal.handleAddResource,
    handleAddQuestion: quizModal.handleAddQuestion,

    resetForm,
    showFeedback: toast.showFeedback,
    getContentValue,
  };
}

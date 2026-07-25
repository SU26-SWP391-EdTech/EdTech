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

/**
 * Hook điều phối trung tâm (Orchestrator) cho tính năng Tạo / Chỉnh sửa bài học (Lesson Builder).
 * Tích hợp các sub-hook chuyên trách để quản lý toàn bộ form bài học, tải danh sách khóa học/bài học,
 * luồng lưu nháp (draft flow), hiển thị modal đính kèm tài nguyên (Resource Modal), 
 * quản lý câu hỏi trắc nghiệm (Quiz Modal), và giao tiếp API đồng bộ dữ liệu (Persistence).
 */
export function useCreateLesson() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useAuthStore(state => state.user);

  // --- 1. THAM CHIẾU VÀ STATE UI CỦA TRANG ---
  const videoInputRef = useRef<HTMLInputElement | null>(null);             // Tham chiếu đến input file upload video
  const [modal, setModal] = useState<ModalType>(null);                     // Loại modal đang mở ('resource' | 'quiz' | null)

  // --- 2. TÍCH HỢP CÁC SUB-HOOKS CHUYÊN TRÁCH ---
  const form = useLessonForm();                                            // Quản lý các trường dữ liệu form bài học (tiêu đề, content, duration, videoUrl...)
  const toast = useLessonToast();                                          // Quản lý hiển thị thông báo popup phản hồi người dùng

  // Quản lý tải và nạp danh sách khóa học & bài học hiện tại từ API
  const data = useLessonData({
    userId: user?.userId,
    searchParams,
    showFeedback: toast.showFeedback,
    hydrateFromApiLesson: form.hydrateFromApiLesson,
  });

  // Quản lý luồng lưu nháp (Draft Flow) hỗ trợ liên kết tạm thời giữa bài học với khóa học nháp
  const draftFlow = useLessonDraftFlow({
    searchParams,
  });

  /**
   * Reset toàn bộ các trường nhập liệu của form và định danh bài học về trạng thái trống.
   */
  function resetForm() {
    form.resetFormFields();
    data.resetLessonIdentity();
  }

  // Quản lý dữ liệu biểu mẫu trên modal Thêm Tài nguyên học tập (Resource)
  const resourceModal = useLessonResourceModal({
    setResources: form.setResources,
    setModal,
  });

  // Quản lý dữ liệu biểu mẫu trên modal Soạn câu hỏi trắc nghiệm / Tự luận (Quiz Questions)
  const quizModal = useLessonQuizModal({
    setQuizQuestions: form.setQuizQuestions,
    setModal,
    showFeedback: toast.showFeedback,
  });

  // Quản lý đồng bộ, lưu trữ thông tin bài học lên Backend (Tạo mới / Chỉnh sửa)
  const persistence = useLessonPersistence({
    searchParams,
    navigate,
    form,
    data,
    draftFlow,
    showFeedback: toast.showFeedback,
  });

  /**
   * Tổng hợp và đóng gói chuỗi JSON nội dung bài học nâng cao.
   * Kết hợp thông tin: tài liệu đọc, mục tiêu khóa học, tài nguyên tải về, và danh sách câu hỏi kiểm tra.
   * 
   * @returns Chuỗi JSON nội dung bài học
   */
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

    // Form states & setters
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

    // Trạng thái giao diện (UI)
    modal,
    setModal,

    showToast: toast.showToast,
    setShowToast: toast.setShowToast,
    toastMessage: toast.toastMessage,

    isSaving: persistence.isSaving,
    isModeLocked: Boolean(data.editingLessonId || data.savedLessonId),

    // Dữ liệu khóa học/bài học liên kết
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

    // Dữ liệu Resource Modal
    rName: resourceModal.rName,
    setRName: resourceModal.setRName,

    rType: resourceModal.rType,
    setRType: resourceModal.setRType,

    rVisibility: resourceModal.rVisibility,
    setRVisibility: resourceModal.setRVisibility,

    // Dữ liệu Quiz Modal
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

    // Các hàm xử lý hành động (Action Handlers)
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

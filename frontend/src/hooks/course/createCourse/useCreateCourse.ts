import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useBeforeUnload, useBlocker, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { extractCourseTags, getCourseById } from '../../../services/course/course.service';
import { getLessonsByCourse } from '../../../services/lesson/lesson.service';
import { mapBackendLessonToCourseBuilderLesson } from '../../../utils/course/courseMappers';
import { useCourseForm } from './useCourseForm';
import { useCourseLessons } from './useCourseLessons';
import { useCoursePersistence } from './useCoursePersistence';
import { useCourseThumbnail } from './useCourseThumbnail';

const EMPTY_COURSE_DRAFT_SNAPSHOT = JSON.stringify({
  title: '',
  description: '',
  language: 'English',
  tags: [],
  durationHours: 0,
  durationMinutes: 0,
  projectUrl: '',
  outcomes: [],
  prerequisiteCourseIds: [],
  thumbnailPreview: null,
  lessons: [],
});

/**
 * Hook điều phối trung tâm (Orchestrator) cho tính năng tạo/chỉnh sửa khóa học.
 * Tích hợp các hook con chuyên biệt (`useCourseForm`, `useCourseThumbnail`, `useCourseLessons`, `useCoursePersistence`)
 * để quản lý một vòng đời hoàn chỉnh của việc thiết lập khóa học, tải dữ liệu cũ nếu ở chế độ edit, 
 * và xử lý các hành động lưu nháp, nộp kiểm duyệt.
 */
export function useCreateCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Lấy ID khóa học từ URL. Nếu có ID, hook tự động chuyển sang chế độ chỉnh sửa (edit mode)
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const [initialDraftSnapshot, setInitialDraftSnapshot] = useState<string | null>(
    editId ? null : EMPTY_COURSE_DRAFT_SNAPSHOT,
  );

  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái đang gửi yêu cầu lưu/đồng bộ lên Backend
  const [showSubmit, setShowSubmit] = useState(false);     // Trạng thái ẩn/hiện modal xác nhận nộp kiểm duyệt
  const [showUnsaved, setShowUnsaved] = useState(false);   // Trạng thái hiển thị cảnh báo thay đổi chưa lưu khi rời trang
  const [reviewReason, setReviewReason] = useState<string | null>(null);

  // --- 2. TÍCH HỢP CÁC HOOK CON CHUYÊN BIỆT (SUB-HOOKS) ---
  const form = useCourseForm();                      // Quản lý thông tin form cơ bản (tiêu đề, ngôn ngữ, outcomes...)
  const thumbnail = useCourseThumbnail();            // Quản lý hình ảnh thumbnail và upload
  const lessonState = useCourseLessons();  // Quản lý danh sách bài học và tương tác kéo thả sắp xếp
  const hydrateFromCourse = form.hydrateFromCourse;
  const setThumbnailPreview = thumbnail.setThumbnailPreview;
  const setLessons = lessonState.setLessons;

  // Lấy ra bản nháp đầy đủ thông tin khóa học hiện tại (kèm danh sách bài học hiện có)
  const getCurrentCourseDraft = () => form.getCurrentCourseDraft(
    lessonState.lessons,
    thumbnail.thumbnailPreview,
  );

  const currentDraftSnapshot = JSON.stringify(getCurrentCourseDraft());

  const isDirty = initialDraftSnapshot !== null
    && currentDraftSnapshot !== initialDraftSnapshot;

  const allowNextNavigation = useCallback(() => {
    flushSync(() => setInitialDraftSnapshot(currentDraftSnapshot));
  }, [currentDraftSnapshot]);

  const blocker = useBlocker(isDirty);

  useBeforeUnload(useCallback((event) => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = '';
  }, [isDirty]));

  // Quản lý giao tiếp API để lưu nháp/nộp duyệt khóa học
  const persistence = useCoursePersistence({
    deletedLessonIds: lessonState.deletedLessonIds,
    editId,
    getCurrentCourseDraft,
    lessons: lessonState.lessons,
    navigate,
    setIsSubmitting,
    thumbnailFile: thumbnail.thumbnailFile,
    title: form.title,
    validateTitle: form.validateTitle,
    onBeforeNavigate: allowNextNavigation,
  });

  // --- 3. EFFECT: TẢI DỮ LIỆU KHÓA HỌC HIỆN TẠI (KHI Ở CHẾ ĐỘ CHỈNH SỬA) ---
  useEffect(() => {
    if (!editId) return;

    const loadCourseData = async () => {
      setIsSubmitting(true);
      try {
        // Tải thông tin chung của khóa học và đổ vào form + thumbnail preview
        const course = await getCourseById(editId);
        hydrateFromCourse(course);
        setReviewReason(course.status === 'rejected' ? (course.reviewReason || 'No rejection reason was provided for this earlier review.') : null);
        setThumbnailPreview(course.thumbnailUrl || null);

        // Tải danh sách bài học của khóa học đó và map sang cấu trúc dùng trong Builder
        const lessonsFromBackend = await getLessonsByCourse(editId);
        const mappedLessons = lessonsFromBackend.map(mapBackendLessonToCourseBuilderLesson);
        setLessons(mappedLessons);
        const totalDuration = course.duration || 0;
        setInitialDraftSnapshot(JSON.stringify({
          title: course.title || '',
          description: course.description || '',
          language: course.language || 'English',
          tags: extractCourseTags(course),
          durationHours: Math.floor(totalDuration / 60),
          durationMinutes: totalDuration % 60,
          projectUrl: course.projectUrl || '',
          outcomes: [],
          prerequisiteCourseIds: [],
          thumbnailPreview: course.thumbnailUrl || null,
          lessons: mappedLessons,
        }));
      } catch (err) {
        console.error('Failed to load course details for edit:', err);
        toast.error('Failed to load course details.');
      } finally {
        setIsSubmitting(false);
      }
    };

    loadCourseData();
  }, [editId, hydrateFromCourse, setLessons, setThumbnailPreview]);

  // Kích hoạt nộp duyệt khóa học
  function handleSubmitForReviewClick() {
    persistence.handleSubmit('pending');
  }

  function handleBackToCourses() {
    navigate('/provider/courses');
  }

  function handleStayOnPage() {
    setShowUnsaved(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }

  function handleLeavePage() {
    setShowUnsaved(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }

  return {
    editId,
    isEditMode: Boolean(editId), // Trả về true nếu đang ở chế độ chỉnh sửa
    isSubmitting,
    reviewReason,
    showSubmit,
    setShowSubmit,
    isDirty,
    showUnsaved: showUnsaved || blocker.state === 'blocked',
    setShowUnsaved,

    // Form và Thumbnail hooks trả về để hiển thị UI tương ứng
    form,
    thumbnail,

    // Đồng bộ hóa các handlers của danh sách bài học (kéo thả, xóa, khóa)
    lessons: lessonState.lessons,
    draggedLessonIndex: lessonState.draggedLessonIndex,
    onDeleteLesson: lessonState.deleteLesson,
    onDragEnd: lessonState.clearDraggedLesson,
    onDragOverLesson: lessonState.dragLesson,
    onDragStartLesson: lessonState.setDraggedLessonIndex,
    onToggleLessonLock: lessonState.toggleLessonLock,

    // Các hàm xử lý hành động lớn (Thêm bài học mới, sửa bài học cũ, lưu nháp, nộp duyệt)
    onCreateLesson: () => persistence.openLessonEditor(),
    onEditLesson: persistence.openLessonEditor,
    onSaveDraft: () => persistence.handleSubmit('draft'),
    onSubmitForReview: handleSubmitForReviewClick,
    onConfirmSubmit: async () => { await persistence.handleSubmit('pending'); setShowSubmit(false); },
    onBackToCourses: handleBackToCourses,
    onStayOnPage: handleStayOnPage,
    onLeavePage: handleLeavePage,
  };
}

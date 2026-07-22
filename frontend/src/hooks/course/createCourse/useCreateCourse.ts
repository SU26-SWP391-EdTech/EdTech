import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getCourseById } from '../../../services/course/course.service';
import { getLessonsByCourse } from '../../../services/lesson/lesson.service';
import { mapBackendLessonToCourseBuilderLesson } from '../../../utils/course/courseMappers';
import { useCourseForm } from './useCourseForm';
import { useCourseLessons } from './useCourseLessons';
import { useCoursePersistence } from './useCoursePersistence';
import { useCourseThumbnail } from './useCourseThumbnail';

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

  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái đang gửi yêu cầu lưu/đồng bộ lên Backend
  const [showSubmit, setShowSubmit] = useState(false);     // Trạng thái ẩn/hiện modal xác nhận nộp kiểm duyệt
  const [showUnsaved, setShowUnsaved] = useState(false);   // Trạng thái hiển thị cảnh báo thay đổi chưa lưu khi rời trang

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
        setThumbnailPreview(course.thumbnailUrl || null);

        // Tải danh sách bài học của khóa học đó và map sang cấu trúc dùng trong Builder
        const lessonsFromBackend = await getLessonsByCourse(editId);
        const mappedLessons = lessonsFromBackend.map(mapBackendLessonToCourseBuilderLesson);
        setLessons(mappedLessons);
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

  return {
    editId,
    isEditMode: Boolean(editId), // Trả về true nếu đang ở chế độ chỉnh sửa
    isSubmitting,
    showSubmit,
    setShowSubmit,
    showUnsaved,
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
  };
}

import type { NavigateFunction } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  createCourse,
  submitCourseToReview,
  submitNewCourseToReview,
  updateCourse,
} from '../../../services/course/course.service';
import {
  createLesson,
  deleteLesson as apiDeleteLesson,
  updateLesson,
} from '../../../services/lesson/lesson.service';
import type { CourseBuilderLesson, CourseDraft } from '../../../types/course/create-course.types';
import { clearCourseDraft } from '../../../utils/course/courseDraftStorage';
import { buildCourseFormData } from '../../../utils/course/courseFormData';
import { buildLessonSyncPayload } from '../../../utils/course/courseMappers';

interface UseCoursePersistenceOptions {
  deletedLessonIds: number[];
  editId: number | null;
  getCurrentCourseDraft: () => CourseDraft;
  lessons: CourseBuilderLesson[];
  navigate: NavigateFunction;
  setIsSubmitting: (isSubmitting: boolean) => void;
  thumbnailFile: File | null;
  title: string;
  validateTitle: () => string | null;
  onBeforeNavigate: () => void;
}

/**
 * Custom hook quản lý đồng bộ dữ liệu khóa học và bài học của giảng viên lên Backend (Persistence).
 * Hỗ trợ các chức năng: đồng bộ các thao tác thêm/sửa/xóa bài học, lưu khóa học dưới dạng nháp (draft) 
 * hoặc gửi kiểm duyệt (pending), tự động lưu nháp khóa học trước khi chuyển hướng sang trình soạn thảo bài học.
 */
export function useCoursePersistence({
  deletedLessonIds,
  editId,
  getCurrentCourseDraft,
  lessons,
  navigate,
  setIsSubmitting,
  thumbnailFile,
  title,
  validateTitle,
  onBeforeNavigate,
}: UseCoursePersistenceOptions) {

  /**
   * Đồng bộ hóa danh sách bài học của khóa học lên Backend:
   * 1. Xóa các bài học trong danh sách chờ xóa (`deletedLessonIds`).
   * 2. Duyệt qua danh sách bài học hiện tại, tạo bài học mới (nếu ID bắt đầu bằng 'l-') hoặc cập nhật bài học cũ.
   * 
   * @param courseId - ID của khóa học chứa các bài học này
   */
  async function syncLessons(courseId: number) {
    // 1. Thực hiện xóa các bài học bị người dùng bấm xóa trong quá trình chỉnh sửa
    for (const lessonId of deletedLessonIds) {
      await apiDeleteLesson(lessonId);
    }

    // 2. Đồng bộ thêm mới/cập nhật và cập nhật lại thứ tự sắp xếp (index) của bài học
    let index = 1;
    for (const lesson of lessons) {
      const payload = buildLessonSyncPayload(lesson, index++);
      const isNew = lesson.id.startsWith('l-');
      if (isNew) {
        await createLesson(courseId, payload);
      } else {
        await updateLesson(courseId, Number(lesson.id), payload);
      }
    }
  }

  /**
   * Xử lý nộp khóa học lên hệ thống (Lưu nháp hoặc Gửi yêu cầu duyệt).
   * 
   * @param status - Trạng thái khóa học: 'draft' (Lưu nháp) hoặc 'pending' (Gửi kiểm duyệt)
   */
  async function handleSubmit(status: 'draft' | 'pending') {
    const titleValidationError = validateTitle();
    if (titleValidationError) {
      toast.error(titleValidationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Dựng đối tượng FormData (vì có gửi tệp tin ảnh thumbnail)
      const formData = await buildCourseFormData({
        status,
        thumbnailFile,
        draft: getCurrentCourseDraft(),
      });

      let courseId = editId;
      if (editId) {
        const updateFormData = await buildCourseFormData({
          status: 'draft',
          thumbnailFile,
          draft: getCurrentCourseDraft(),
        });
        await updateCourse(editId, updateFormData);
      } else {
        // Tạo mới khóa học
        const newCourse = status === 'pending'
          ? await submitNewCourseToReview(formData)
          : await createCourse(formData);
        courseId = newCourse.courseId;
      }

      // Đồng bộ các bài học thuộc khóa học
      await syncLessons(courseId!);

      // Nếu đang chỉnh sửa khóa học và muốn gửi duyệt
      if (editId && status === 'pending') {
        await submitCourseToReview(editId);
      }

      // Xóa bản nháp tạm lưu ở Local Storage nếu tạo mới thành công
      if (!editId) {
        clearCourseDraft();
      }

      toast.success(editId ? 'Course updated successfully!' : 'Course created successfully!');
      onBeforeNavigate();
      navigate('/provider/courses');
    } catch (err: unknown) {
      console.error(err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || (editId ? 'Failed to update course.' : 'Failed to create course.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Đảm bảo khóa học nháp tồn tại trong DB trước khi tạo bài học.
   * Nếu là khóa học mới tạo chưa được lưu nháp trên DB, tự động lưu nháp trước rồi lấy ID khóa học.
   * 
   * @returns ID của khóa học trong DB, hoặc null nếu lưu nháp thất bại
   */
  async function ensureCourseExistsForLesson() {
    if (editId) return editId; // Đã có sẵn khóa học

    const titleValidationError = validateTitle();
    if (titleValidationError) {
      toast.error(titleValidationError === 'Course title is required.'
        ? 'Course title is required before creating a lesson.'
        : titleValidationError);
      return null;
    }

    setIsSubmitting(true);
    try {
      const formData = await buildCourseFormData({
        status: 'draft',
        thumbnailFile,
        draft: getCurrentCourseDraft(),
      });

      const newCourse = await createCourse(formData);
      clearCourseDraft();
      toast.success('Course draft saved. You can now create lessons.');
      return newCourse.courseId;
    } catch (err: unknown) {
      console.error('Failed to create course draft before lesson:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || 'Failed to save course draft before creating lesson.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Chuyển sang trang soạn thảo chi tiết nội dung bài học (Lesson Editor).
   * 
   * @param lessonId - ID của bài học cần chỉnh sửa (nếu có, bỏ trống nếu là tạo mới bài học)
   */
  async function openLessonEditor(lessonId?: string) {
    const courseId = await ensureCourseExistsForLesson();
    if (!courseId) return;

    // Thiết lập đường dẫn quay lại và các query params chuyển tiếp
    const backUrl = encodeURIComponent(`/provider/courses/create?id=${courseId}`);
    const lessonParam = lessonId ? `&lessonId=${lessonId}` : '';
    const courseTitleParam = !editId && title.trim() ? `&courseTitle=${encodeURIComponent(title.trim())}` : '';
    
    // New courses are persisted above before opening the lesson editor. Existing
    // courses still rely on the route blocker when they contain unsaved edits.
    if (!editId) {
      onBeforeNavigate();
    }
    navigate(`/provider/lessons/create?redirectBack=${backUrl}&isCourseBuilder=true&courseId=${courseId}${lessonParam}${courseTitleParam}`);
  }

  return {
    handleSubmit,
    openLessonEditor,
  };
}

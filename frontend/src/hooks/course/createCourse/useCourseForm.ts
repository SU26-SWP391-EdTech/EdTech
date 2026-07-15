import { useState } from 'react';

import type { BackendCourse } from '../../../services/course/course.service';
import type { CourseBuilderLesson, CourseDraft } from '../../../types/course/create-course.types';

/**
 * Custom hook quản lý trạng thái form thông tin cơ bản của khóa học trong bộ công cụ tạo khóa học (Course Builder).
 * Cung cấp các state nhập liệu và hàm đổ dữ liệu có sẵn (hydrate), chuẩn bị bản nháp (draft) khóa học để lưu.
 */
export function useCourseForm() {
  // --- 1. QUẢN LÝ TRẠNG THÁI FORM (STATE) ---
  const [title, setTitle] = useState('');                                   // Tiêu đề khóa học
  const [description, setDescription] = useState('');                       // Mô tả khóa học
  const [language, setLanguage] = useState('English');                      // Ngôn ngữ giảng dạy (mặc định English)
  const [durationHours, setDurationHours] = useState(0);                    // Thời lượng khóa học: Số giờ
  const [durationMinutes, setDurationMinutes] = useState(0);                // Thời lượng khóa học: Số phút
  const [projectUrl, setProjectUrl] = useState('');                         // Đường dẫn link bài tập/dự án mẫu của khóa học
  const [outcomes, setOutcomes] = useState<string[]>([]);                   // Chuẩn đầu ra (kỹ năng đạt được sau khóa học)
  const [prerequisiteCourseIds, setPrerequisiteCourseIds] = useState<number[]>([]); // Mảng ID các khóa học tiên quyết cần học trước

  /**
   * Đổ dữ liệu từ một khóa học có sẵn từ backend vào form (dùng khi chỉnh sửa khóa học).
   * 
   * @param course - Dữ liệu khóa học từ Backend
   */
  function hydrateFromCourse(course: BackendCourse) {
    setTitle(course.title || '');
    setDescription(course.description || '');
    setLanguage(course.language || 'English');
    setProjectUrl(course.projectUrl || '');

    const totalDuration = course.duration || 0;
    setDurationHours(Math.floor(totalDuration / 60)); // Chuyển đổi tổng số phút thành giờ
    setDurationMinutes(totalDuration % 60);           // Phần số phút dư ra
  }

  /**
   * Thu thập dữ liệu form hiện tại cùng danh sách bài học để tạo đối tượng bản nháp khóa học (CourseDraft).
   * 
   * @param lessons - Danh sách bài học hiện có trong builder
   * @param thumbnailPreview - Ảnh thumbnail xem trước (dạng base64 hoặc URL)
   * @returns Đối tượng CourseDraft đã gom đầy đủ thông tin
   */
  function getCurrentCourseDraft(lessons: CourseBuilderLesson[], thumbnailPreview: string | null): CourseDraft {
    return {
      title,
      description,
      language,
      durationHours,
      durationMinutes,
      projectUrl,
      outcomes,
      prerequisiteCourseIds,
      thumbnailPreview,
      lessons,
    };
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    language,
    setLanguage,
    durationHours,
    setDurationHours,
    durationMinutes,
    setDurationMinutes,
    projectUrl,
    setProjectUrl,
    outcomes,
    setOutcomes,
    prerequisiteCourseIds,
    setPrerequisiteCourseIds,
    hydrateFromCourse,
    getCurrentCourseDraft,
  };
}

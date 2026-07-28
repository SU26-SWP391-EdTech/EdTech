import { useCallback, useState } from 'react';

import type { BackendCourse } from '../../../services/course/course.service';
import { extractCourseTags } from '../../../services/course/course.service';
import type { CourseBuilderLesson, CourseDraft } from '../../../types/course/create-course.types';
import { COURSE_TITLE_MAX_LENGTH } from '../../../constants/courseValidation.constants';

/**
 * Custom hook quản lý trạng thái form thông tin cơ bản của khóa học trong bộ công cụ tạo khóa học (Course Builder).
 * Cung cấp các state nhập liệu và hàm đổ dữ liệu có sẵn (hydrate), chuẩn bị bản nháp (draft) khóa học để lưu.
 */
export function useCourseForm() {
  const [titleError, setTitleError] = useState('');
  // --- 1. QUẢN LÝ TRẠNG THÁI FORM (STATE) ---
  const [title, setTitle] = useState('');                                   // Tiêu đề khóa học
  const [description, setDescription] = useState('');                       // Mô tả khóa học
  const [language, setLanguage] = useState('English');                      // Ngôn ngữ giảng dạy (mặc định English)
  const [tags, setTags] = useState<string[]>([]);                           // Thẻ khóa học (Course Tags)
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
  const hydrateFromCourse = useCallback((course: BackendCourse) => {
    setTitle(course.title || '');
    setTitleError('');
    setDescription(course.description || '');
    setLanguage(course.language || 'English');
    setProjectUrl(course.projectUrl || '');
    setTags(extractCourseTags(course));

    const totalDuration = course.duration || 0;
    setDurationHours(Math.floor(totalDuration / 60)); // Chuyển đổi tổng số phút thành giờ
    setDurationMinutes(totalDuration % 60);           // Phần số phút dư ra
  }, []);

  function handleTitleChange(value: string) {
    if (value.length > COURSE_TITLE_MAX_LENGTH) {
      setTitle(value.slice(0, COURSE_TITLE_MAX_LENGTH));
      setTitleError(`Course title must not exceed ${COURSE_TITLE_MAX_LENGTH} characters.`);
      return;
    }

    setTitle(value);
    setTitleError('');
  }

  function validateTitle(): string | null {
    if (!title.trim()) {
      const message = 'Course title is required.';
      setTitleError(message);
      return message;
    }

    if (title.length > COURSE_TITLE_MAX_LENGTH) {
      const message = `Course title must not exceed ${COURSE_TITLE_MAX_LENGTH} characters.`;
      setTitleError(message);
      return message;
    }

    setTitleError('');
    return null;
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
      tags,
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
    titleError,
    setTitle: handleTitleChange,
    validateTitle,
    description,
    setDescription,
    language,
    setLanguage,
    tags,
    setTags,
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

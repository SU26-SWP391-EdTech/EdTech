import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  searchCourses,
  type BackendCourse,
} from '../../../services/course/course.service';

import {
  getLessonById,
  getLessonsByCourse,
  type Lesson,
} from '../../../services/lesson/lesson.service';

import type { UseLessonFormReturn } from './useLessonForm';

type UseLessonDataParams = {
  userId?: number;
  searchParams: URLSearchParams;
  showFeedback: (message: string) => void;
  hydrateFromApiLesson: UseLessonFormReturn['hydrateFromApiLesson'];
};

/**
 * Custom hook quản lý dữ liệu (Course & Lesson) phục vụ cho giao diện Tạo/Sửa bài học.
 * Tải danh sách khóa học, danh sách bài học thuộc khóa học đang chọn,
 * xác định thứ tự của bài học trong khóa học (lessonOrder),
 * và nạp dữ liệu chi tiết của bài học cũ từ Backend (Hydration) nếu ở chế độ chỉnh sửa.
 * 
 * @param params - Các dependencies truyền vào bao gồm userId, searchParams, callback thông báo, và hàm hydrate form.
 */
export function useLessonData({
  userId,
  searchParams,
  showFeedback,
  hydrateFromApiLesson,
}: UseLessonDataParams) {
  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [courses, setCourses] = useState<BackendCourse[]>([]);               // Danh sách tất cả khóa học của user
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null); // ID khóa học hiện tại bài học thuộc về

  const [lessons, setLessons] = useState<Lesson[]>([]);                       // Danh sách bài học của khóa học được chọn
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null); // ID bài học cũ đang được tải lên để chỉnh sửa
  const [savedLessonId, setSavedLessonId] = useState<number | null>(null);     // ID bài học vừa được lưu thành công từ API

  // Tìm thông tin đầy đủ của khóa học đang chọn
  const selectedCourse = useMemo(() => {
    return courses.find(course => course.courseId === selectedCourseId) ?? null;
  }, [courses, selectedCourseId]);

  // Tính toán thứ tự (vị trí/index) bài học hiện tại trong danh sách bài học của khóa học
  const lessonOrder = useMemo(() => {
    const targetId = editingLessonId ?? savedLessonId;

    if (targetId) {
      const index = lessons.findIndex(
        lesson => Number(lesson.lessonId) === targetId
      );

      if (index !== -1) {
        return index + 1; // Vị trí 1-indexed
      }
    }

    // Nếu tạo bài học mới, thứ tự mặc định xếp cuối danh sách
    return lessons.length + 1;
  }, [lessons, editingLessonId, savedLessonId]);

  // --- 2. EFFECT: ĐỒNG BỘ THÔNG TIN TỪ URL SEARCH PARAMS ---
  useEffect(() => {
    const queryCourseId = Number(
      searchParams.get('courseId') || searchParams.get('id')
    );

    const queryLessonIdStr = searchParams.get('lessonId');
    const queryLessonId = Number(queryLessonIdStr);

    if (Number.isFinite(queryCourseId) && queryCourseId > 0) {
      setSelectedCourseId(queryCourseId);
    }

    // Nếu có tham số lessonId hợp lệ và không phải ID dạng nháp (nháp thường bắt đầu bằng 'l-')
    if (
      queryLessonIdStr &&
      !queryLessonIdStr.startsWith('l-') &&
      Number.isFinite(queryLessonId) &&
      queryLessonId > 0
    ) {
      setEditingLessonId(queryLessonId);
      setSavedLessonId(queryLessonId);
    }
  }, [searchParams]);

  // --- 3. EFFECT: TẢI DANH SÁCH KHÓA HỌC ---
  useEffect(() => {
    async function loadCourses() {
      try {
        const params = userId ? { userId } : undefined;
        const response = await searchCourses(params);
        const items = response.data?.items || [];

        setCourses(items);

        // Mặc định chọn khóa học đầu tiên nếu chưa có khóa học nào được chọn
        setSelectedCourseId(current => {
          return current ?? items[0]?.courseId ?? null;
        });
      } catch (error) {
        console.error('Failed to load courses:', error);
        showFeedback('Could not load courses from database.');
      }
    }

    loadCourses();
  }, [userId, showFeedback]);

  // Tải lại danh sách bài học của một khóa học cụ thể
  const reloadLessons = useCallback(
    async (courseId = selectedCourseId) => {
      if (!courseId) {
        setLessons([]);
        return;
      }

      try {
        const data = await getLessonsByCourse(courseId);
        setLessons(data);
      } catch {
        setLessons([]);
      }
    },
    [selectedCourseId]
  );

  // Tự động load danh sách bài học khi khóa học thay đổi
  useEffect(() => {
    reloadLessons();
  }, [reloadLessons]);

  // --- 4. EFFECT: TẢI CHI TIẾT BÀI HỌC KHI Ở CHẾ ĐỘ CHỈNH SỬA (EDIT MODE) ---
  useEffect(() => {
    if (!editingLessonId) return;

    async function loadLessonDetail() {
      try {
        const lesson = await getLessonById(editingLessonId);
        // Hydrate (đổ) dữ liệu từ API vào form để hiển thị trên UI chỉnh sửa
        hydrateFromApiLesson(lesson);
      } catch (error) {
        console.error('Failed to load lesson detail:', error);
        showFeedback('Could not load lesson detail.');
      }
    }

    loadLessonDetail();
  }, [editingLessonId, hydrateFromApiLesson, showFeedback]);

  // Reset định danh bài học về null
  function resetLessonIdentity() {
    setEditingLessonId(null);
    setSavedLessonId(null);
  }

  return {
    courses,

    selectedCourseId,
    setSelectedCourseId,
    selectedCourse,

    lessons,
    setLessons,
    reloadLessons,

    lessonOrder,

    editingLessonId,
    setEditingLessonId,

    savedLessonId,
    setSavedLessonId,

    resetLessonIdentity,
  };
}

export type UseLessonDataReturn = ReturnType<typeof useLessonData>;
import { useState } from 'react';
import type { CourseBuilderLesson } from '../../../types/course/create-course.types';
import { reorderLessons as apiReorderLessons } from '../../../services/lesson/lesson.service';

/**
 * Custom hook quản lý danh sách bài học và thứ tự sắp xếp bài học trong bộ công cụ tạo khóa học.
 * Hỗ trợ các tính năng: bật/tắt khóa bài học, xóa bài học (đồng bộ xóa API hoặc đưa vào hàng đợi xóa), 
 * kéo thả sắp xếp thứ tự hiển thị của các bài học (gọi reorder API ngay sau khi thả).
 * 
 */
export function useCourseLessons() {
  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [deletedLessonIds, setDeletedLessonIds] = useState<number[]>([]); // Danh sách ID các bài học thực tế đã bị xóa (chờ đồng bộ lưu)
  const [lessons, setLessons] = useState<CourseBuilderLesson[]>([]);     // Danh sách các bài học hiện tại trong builder
  const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null); // Vị trí (index) của bài học đang bị kéo

  /**
   * Bật hoặc tắt trạng thái khóa (locked) của một bài học.
   * 
   * @param lessonId - ID bài học dạng chuỗi
   */
  function toggleLessonLock(lessonId: string) {
    setLessons(prev => prev.map(lesson => (
      lesson.id === lessonId
        ? { ...lesson, locked: !lesson.locked }
        : lesson
    )));
  }

  /**
   * Thực hiện xóa một bài học.
   * - Nếu là bài đã lưu trên DB (ID dạng số thực tế) và đang ở chế độ chỉnh sửa trực tiếp, gọi API xóa ngay.
   * - Nếu là bài đã lưu trên DB nhưng đang ở chế độ lưu nháp chung, đưa ID vào danh sách chờ xóa để nộp sau.
   * - Xóa bài học ra khỏi danh sách hiển thị trên UI.
   * 
   * @param lessonId - ID bài học cần xóa (chuỗi bắt đầu bằng 'l-' là bài mới tạo chưa lưu DB)
   */
  async function deleteLesson(lessonId: string) {
    if (!lessonId.startsWith('l-')) {
      // Persisted lessons are only removed after the user saves the course.
      setDeletedLessonIds(prev => (
        prev.includes(Number(lessonId)) ? prev : [...prev, Number(lessonId)]
      ));
    }

    // Cập nhật giao diện xóa bài học
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
  }

  /**
   * Cập nhật vị trí bài học khi thực hiện hành động kéo thả (Drag over).
   * Sau khi reorder state, gọi API reorder ngay lập tức nếu danh sách có ít nhất 1 lesson đã lưu trong DB.
   * 
   * @param targetIndex - Vị trí đích mà bài học được kéo thả tới
   */
  async function dragLesson(targetIndex: number) {
    if (draggedLessonIndex === null || draggedLessonIndex === targetIndex) return;

    const updated = [...lessons];
    const draggedItem = updated[draggedLessonIndex];
    updated.splice(draggedLessonIndex, 1);      // Xóa ở vị trí cũ
    updated.splice(targetIndex, 0, draggedItem); // Chèn vào vị trí mới

    // Cập nhật position trên UI theo thứ tự mới
    const updatedWithPosition = updated.map((l, i) => ({ ...l, position: i + 1 }));
    setLessons(updatedWithPosition);
    setDraggedLessonIndex(targetIndex);

    // Gọi API reorder với các lesson đã có trong DB (ID không bắt đầu bằng 'l-')
    const persistedLessons = updatedWithPosition.filter(l => !l.id.startsWith('l-'));
    if (persistedLessons.length > 0) {
      const anyLessonId = Number(persistedLessons[0].id);
      const lessonIds = persistedLessons.map(l => Number(l.id));
      try {
        await apiReorderLessons(anyLessonId, lessonIds);
      } catch (err) {
        console.error('Failed to reorder lessons:', err);
      }
    }
  }

  /**
   * Reset trạng thái kéo sau khi thả chuột.
   */
  function clearDraggedLesson() {
    setDraggedLessonIndex(null);
  }

  return {
    deletedLessonIds,
    lessons,
    setLessons,
    draggedLessonIndex,
    setDraggedLessonIndex,
    toggleLessonLock,
    deleteLesson,
    dragLesson,
    clearDraggedLesson,
  };
}

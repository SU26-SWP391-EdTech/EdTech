import { useCallback, useRef, useState } from 'react';

export type LessonFeedbackType = 'success' | 'error';

/**
 * Custom hook quản lý trạng thái hiển thị thông báo phản hồi (Toast Notification) trên trang.
 * Tự động hẹn giờ ẩn thông báo sau 3 giây và dọn dẹp bộ nhớ (timer cleanup) khi nhận thông báo mới.
 */
export function useLessonToast() {
  const [showToast, setShowToast] = useState(false);                 // Trạng thái hiển thị thông báo (ẩn/hiện)
  const [toastMessage, setToastMessage] = useState(
    'Lesson draft saved successfully.'
  );
  const [feedbackType, setFeedbackType] = useState<LessonFeedbackType>('success');                                                                // Nội dung thông báo hiển thị

  const timerRef = useRef<number | null>(null);                     // Tham chiếu giữ ID của bộ hẹn giờ setTimeout

  /**
   * Kích hoạt hiển thị thông báo với nội dung tùy chọn.
   * Thiết lập hẹn giờ tự động ẩn thông báo sau 3000ms.
   * 
   * @param message - Nội dung thông điệp muốn hiển thị
   */
  const showFeedback = useCallback((message: string, type: LessonFeedbackType = 'success') => {
    setToastMessage(message);
    setFeedbackType(type);
    setShowToast(true);

    // Dọn dẹp bộ hẹn giờ cũ nếu có thông báo mới chồng lên trước khi hết 3 giây
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  return {
    showToast,
    setShowToast,
    toastMessage,
    feedbackType,
    showFeedback,
  };
}
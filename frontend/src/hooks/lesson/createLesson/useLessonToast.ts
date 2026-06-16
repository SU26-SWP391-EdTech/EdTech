import { useCallback, useRef, useState } from 'react';

export function useLessonToast() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    'Lesson draft saved successfully.'
  );

  const timerRef = useRef<number | null>(null);

  const showFeedback = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);

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
    showFeedback,
  };
}
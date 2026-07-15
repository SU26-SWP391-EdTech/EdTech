import type { DragEvent } from 'react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook quản lý ảnh bìa khóa học (Course Thumbnail).
 * Hỗ trợ các chức năng: chọn tệp tin từ máy tính, kéo thả ảnh (Drag and Drop),
 * kiểm tra dung lượng tệp tin (tối đa 2MB), tạo chuỗi base64 xem trước hình ảnh (Preview) và xóa ảnh hiện tại.
 */
export function useCourseThumbnail() {
  const fileInputRef = useRef<HTMLInputElement>(null); // Tham chiếu tới thẻ input file ẩn dùng để click chọn file
  
  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);       // Tệp tin ảnh thực tế (File object)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null); // Đường dẫn base64 dùng để hiển thị ảnh xem trước
  const [dragOver, setDragOver] = useState(false);                             // Cờ hiệu ứng khi kéo tệp tin đè lên vùng drop zone

  /**
   * Xử lý khi có tệp tin được chọn (hoặc kéo thả vào).
   * Thực hiện validate kích thước (dưới 2MB) và chuyển đổi ảnh thành chuỗi base64 để hiển thị xem trước.
   * 
   * @param file - Đối tượng File ảnh được chọn
   */
  function handleFileChange(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large. Max size is 2MB.');
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string); // Lưu chuỗi base64 vào state preview
    };
    reader.readAsDataURL(file);
  }

  /**
   * Reset ảnh bìa về trạng thái ban đầu (xóa ảnh).
   */
  function clearThumbnail() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  }

  // --- 2. XỬ LÝ SỰ KIỆN KÉO THẢ FILE (DRAG & DROP EVENTS) ---
  function onDragOver(event: DragEvent) {
    event.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files?.[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }

  return {
    fileInputRef,
    thumbnailFile,
    thumbnailPreview,
    setThumbnailPreview,
    dragOver,
    handleFileChange,
    clearThumbnail,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}

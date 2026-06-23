import type { DragEvent } from 'react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export function useCourseThumbnail() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large. Max size is 2MB.');
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function clearThumbnail() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  }

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

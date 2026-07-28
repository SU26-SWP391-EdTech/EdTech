import type { DragEvent, RefObject } from 'react';
import { BookOpen, Upload, X } from 'lucide-react';

interface ThumbnailUploaderProps {
  dragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  thumbnailPreview: string | null;
  onClear: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
  onFileChange: (file: File) => void;
}

export function ThumbnailUploader({
  dragOver,
  fileInputRef,
  thumbnailPreview,
  onClear,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: ThumbnailUploaderProps) {
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={event => event.target.files?.[0] && onFileChange(event.target.files[0])}
        accept="image/*"
        className="hidden"
      />
      <div className="grid grid-cols-[160px_1fr] gap-4">
        {thumbnailPreview ? (
          <div className="relative rounded-lg overflow-hidden border border-[#E5E7EB] aspect-video bg-[#F8FAFC]">
            <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-1 right-1 p-1 bg-[#111827]/70 text-white rounded hover:bg-[#111827]/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="aspect-video rounded-lg bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        )}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragOver ? 'border-[#E11D48] bg-[#FEF2F2]' : 'border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}
        >
          <Upload className="w-5 h-5 text-[#6B7280] mb-1.5" />
          <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>Drop image here or click to upload</p>
          <p className="text-xs text-[#6B7280] mt-0.5">PNG, JPG up to 2MB - 16:9 recommended</p>
        </div>
      </div>
    </>
  );
}

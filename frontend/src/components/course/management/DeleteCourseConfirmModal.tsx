import { X } from 'lucide-react';
import type { Course } from '../../../types/course/course-management.types';

interface DeleteCourseConfirmModalProps {
  course: Course;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteCourseConfirmModal({ course, onClose, onConfirm, loading }: DeleteCourseConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between">
          <div>
            <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>
              Delete Course
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Confirm course deletion.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-[#374151]">
          Are you sure to delete this course?
          <p className="font-semibold text-[#111827] mt-1.5">{course.title}</p>
          <p className="text-xs text-[#6B7280] mt-2">
            This action cannot be undone. All course materials and enrollments might be affected.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex justify-end gap-2 bg-[#FAFAFA]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
            style={{ fontWeight: 500 }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors disabled:opacity-50"
            style={{ fontWeight: 500 }}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

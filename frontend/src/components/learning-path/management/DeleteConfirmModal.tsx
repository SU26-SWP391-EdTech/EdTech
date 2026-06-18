import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] mx-4 p-6 border border-[#E5E7EB] flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-[#EF4444]" />
        </div>
        <h3 className="text-[#111827] text-lg font-bold mb-2">Delete Learning Path</h3>
        <p className="text-[#6B7280] text-sm mb-6">Are you sure you want to delete this learning path?</p>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2 bg-[#EF4444] text-white rounded-xl text-sm font-medium hover:bg-[#DC2626] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

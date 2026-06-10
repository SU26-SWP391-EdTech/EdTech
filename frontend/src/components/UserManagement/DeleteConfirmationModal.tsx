import { Trash2 } from 'lucide-react';
import type { User } from './types';

interface DeleteConfirmationModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({ user, onClose, onConfirm }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#FFF1F2] border border-[#FECDD3] rounded-full flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6 text-[#E11D48]" />
          </div>
          <h2 className="text-[#111827] text-base" style={{ fontWeight: 700 }}>
            Confirm Deactivation
          </h2>
          <p className="text-sm text-[#6B7280] mt-2">
            Are you sure you want to delete user <span className="font-semibold text-[#111827]">{user.name}</span>?
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
            This action will change the user's status from <span className="text-[#16A34A] font-semibold">Active</span> to <span className="text-[#6B7280] font-semibold">Inactive</span> instead of permanently removing them from the list.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-end gap-2.5 bg-[#FAFAFA]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

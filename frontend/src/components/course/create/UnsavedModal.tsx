import { AlertTriangle } from 'lucide-react';

import { Overlay } from './Overlay';

interface UnsavedModalProps {
  onClose: () => void;
}

export function UnsavedModal({ onClose }: UnsavedModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-[#FFFBEB] flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <h3 className="text-[18px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>You have unsaved changes</h3>
          <p className="text-sm text-[#6B7280]">
            If you leave now, your latest edits won't be saved. Save a draft to keep your progress.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
          <button onClick={onClose} className="px-4 py-2 text-[#6B7280] hover:text-[#111827] text-sm" style={{ fontWeight: 500 }}>Leave without saving</button>
          <button onClick={onClose} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C]" style={{ fontWeight: 500 }}>Save Draft</button>
        </div>
      </div>
    </Overlay>
  );
}

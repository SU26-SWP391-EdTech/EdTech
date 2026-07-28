import { AlertTriangle } from 'lucide-react';

import { Overlay } from './Overlay';

interface UnsavedModalProps {
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedModal({ onStay, onLeave }: UnsavedModalProps) {
  return (
    <Overlay onClose={onStay}>
      <div
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-[#FFFBEB] flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <h3 id="unsaved-changes-title" className="text-[18px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>Leave without saving?</h3>
          <p id="unsaved-changes-description" className="text-sm text-[#6B7280]">
            Your latest changes will not be saved if you leave this page.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
          <button onClick={onStay} className="px-4 py-2 text-[#4B5563] hover:text-[#111827] text-sm" style={{ fontWeight: 500 }}>Stay</button>
          <button onClick={onLeave} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C]" style={{ fontWeight: 500 }}>Leave</button>
        </div>
      </div>
    </Overlay>
  );
}

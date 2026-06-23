import { AlertTriangle, CheckCircle2, Circle, Send } from 'lucide-react';

import { Overlay } from './Overlay';

interface SubmitModalProps {
  hasLessons: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ProgressItem({ label, done, warning }: { label: string; done?: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
      ) : warning ? (
        <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-[#D1D5DB]" />
      )}
      <span className={`text-xs ${done ? 'text-[#111827]' : warning ? 'text-[#92400E]' : 'text-[#6B7280]'}`} style={{ fontWeight: done ? 500 : 400 }}>{label}</span>
    </div>
  );
}

export function SubmitModal({ onClose, onConfirm, isSubmitting, hasLessons }: SubmitModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
            <Send className="w-5 h-5 text-[#E11D48]" />
          </div>
          <h3 className="text-[18px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>Submit course for review?</h3>
          <p className="text-sm text-[#6B7280] mb-4">
            Academic Managers will review your course before publishing. You'll be notified when the review is complete.
          </p>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 mb-2">
            <p className="text-xs text-[#6B7280] mb-2" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Checklist summary</p>
            <div className="space-y-1.5">
              <ProgressItem label="Basic information completed" done />
              <ProgressItem label="At least one lesson added" done={hasLessons} />
              <ProgressItem label="Learning outcomes defined" done />
              <ProgressItem label="Content policy checked" warning />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB]">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm" style={{ fontWeight: 500 }} disabled={isSubmitting}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] disabled:opacity-50" style={{ fontWeight: 500 }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

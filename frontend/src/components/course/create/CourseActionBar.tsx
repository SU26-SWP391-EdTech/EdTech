import { Send } from 'lucide-react';

interface CourseActionBarProps {
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
}

export function CourseActionBar({ isSubmitting, onSaveDraft, onSubmitForReview }: CourseActionBarProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB] mt-5">
      <button
        onClick={onSaveDraft}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
        style={{ fontWeight: 500 }}
        disabled={isSubmitting}
      >
        Save Draft
      </button>
      <button
        onClick={onSubmitForReview}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
        style={{ fontWeight: 500 }}
        disabled={isSubmitting}
      >
        <Send className="w-4 h-4" />
        Submit for Review
      </button>
    </div>
  );
}

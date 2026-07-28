import { ArrowLeft, Send } from 'lucide-react';

interface CreateCourseHeaderProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onBackToCourses: () => void;
}

export function CreateCourseHeader({
  isEditMode,
  isSubmitting,
  onSaveDraft,
  onSubmitForReview,
  onBackToCourses,
}: CreateCourseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-7 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <button
          type="button"
          onClick={onBackToCourses}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#4B5563] hover:text-[#111827] transition-colors disabled:opacity-50"
          style={{ fontWeight: 500 }}
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Course List
        </button>
        <div className="flex items-center gap-2 mb-1.5">
          <h1 className="text-[28px] text-[#111827]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            {isEditMode ? 'Edit Course' : 'Create Course'}
          </h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFBEB] text-[#B45309] rounded-full text-[11px]" style={{ fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            Draft
          </span>
        </div>
        <p className="text-[#6B7280] text-sm">
          {isEditMode ? 'Modify course details, organize lessons, update materials, and submit for review.' : 'Build a new course, organize lessons, upload materials, and submit it for review.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
    </div>
  );
}

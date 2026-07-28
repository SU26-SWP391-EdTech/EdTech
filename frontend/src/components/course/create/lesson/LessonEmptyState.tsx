import { BookOpen, Plus } from 'lucide-react';

interface LessonEmptyStateProps {
  onCreateLesson: () => void;
}

export function LessonEmptyState({ onCreateLesson }: LessonEmptyStateProps) {
  return (
    <div className="border border-dashed border-[#E5E7EB] rounded-xl p-10 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] flex items-center justify-center mb-3">
        <BookOpen className="w-5 h-5 text-[#E11D48]" />
      </div>
      <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>No lessons added yet</p>
      <p className="text-xs text-[#6B7280] mb-4">Start by adding your first lesson for this course.</p>
      <button
        onClick={onCreateLesson}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors"
        style={{ fontWeight: 500 }}
      >
        <Plus className="w-3.5 h-3.5" />
        Create Lesson
      </button>
    </div>
  );
}

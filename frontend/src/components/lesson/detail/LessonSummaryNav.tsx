import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LessonSummaryNavProps {
  matchedCourse: any;
  activeLessonIndex: number;
  totalLessons: number;
  completedLessons: number;
  flatLessons: any[];
  onPrevLesson: () => void;
  onNextLesson: () => void;
}

export function LessonSummaryNav({
  matchedCourse,
  activeLessonIndex,
  totalLessons,
  completedLessons,
  flatLessons,
  onPrevLesson,
  onNextLesson
}: LessonSummaryNavProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevLesson}
          disabled={activeLessonIndex === 0}
          className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontWeight: 500 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Lesson
        </button>
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
          <span>Lesson {activeLessonIndex + 1} of {totalLessons}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(5, totalLessons) }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < completedLessons ? 'bg-[#E11D48]' : 'bg-[#E5E7EB]'}`} />
            ))}
          </div>
        </div>
        <button
          onClick={onNextLesson}
          disabled={activeLessonIndex === flatLessons.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontWeight: 500 }}
        >
          Next Lesson
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

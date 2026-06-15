import { Target, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

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
      <div className="flex items-start gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#E11D48]" />
            <span className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Learning Objectives</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {(matchedCourse?.outcomes || []).slice(0, 6).map((obj: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                <span className="text-sm text-[#374151]">{obj}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap" 
            style={{ fontWeight: 500 }} 
            onClick={() => toast.success('Resources downloaded successfully.')}
          >
            <Download className="w-4 h-4" />
            Resources
          </button>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F3F4F6]">
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

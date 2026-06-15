import { ChevronLeft, CheckCircle2, PlayCircle, BookOpen, GraduationCap, Clock, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Lesson, Module } from '../../../types/lesson/lesson.types';

interface LessonHeaderProps {
  courseId: number;
  activeLesson: Lesson | undefined;
  activeModule: Module | undefined;
  matchedCourse: any;
  activeLessonIndex: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  isCompleted: boolean;
  onBackToCourse: () => void;
  onMarkComplete: () => void;
}

export function LessonHeader({
  activeLesson,
  activeModule,
  matchedCourse,
  activeLessonIndex,
  totalLessons,
  completedLessons,
  overallProgress,
  isCompleted,
  onBackToCourse,
  onMarkComplete
}: LessonHeaderProps) {
  return (
    <div className="px-8 pt-6">
      <div className="max-w-[1440px] mx-auto rounded-3xl border border-[#E5E7EB] bg-white px-7 py-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#E11D48] font-bold mb-3 hover:underline cursor-pointer" onClick={onBackToCourse}>
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Course Details
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[#111827]" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
                {activeLesson?.title || 'Loading lesson...'}
              </h1>
              {isCompleted && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#DCFCE7] rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981] text-xs" style={{ fontWeight: 600 }}>Completed</span>
                </span>
              )}
              {!isCompleted && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] rounded-full">
                  <PlayCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="text-[#F59E0B] text-xs" style={{ fontWeight: 600 }}>In Progress</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {activeModule?.title || 'Course Modules'}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {matchedCourse?.title}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {activeLesson?.duration || '5:00'}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
              <span>Lesson {activeLessonIndex + 1} of {totalLessons}</span>
            </div>
          </div>

          <div className="flex w-[420px] flex-shrink-0 items-center gap-4">
            <div className="flex-1 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-[#6B7280]" style={{ fontWeight: 600 }}>Course Progress</span>
                <span className="text-sm text-[#E11D48]" style={{ fontWeight: 700 }}>{overallProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div className="h-full rounded-full bg-[#E11D48] transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-[#9CA3AF]">
                <span>{completedLessons} done</span>
                <span>{Math.max(totalLessons - completedLessons, 0)} left</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap" 
                style={{ fontWeight: 500 }} 
                onClick={() => toast.success('Notes saved to workspace.')}
              >
                <Bookmark className="w-4 h-4" />
                Save Notes
              </button>
              <button
                onClick={onMarkComplete}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  isCompleted
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#E11D48] text-white hover:bg-[#BE123C]'
                }`}
                style={{ fontWeight: 500 }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Completed!' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

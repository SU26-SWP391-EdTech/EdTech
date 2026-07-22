import { BookOpen, Video, ClipboardList, ChevronRight } from 'lucide-react';
import { LessonStatusIcon } from './LessonStatusIcon';
import type { Lesson, Module } from '../../../types/lesson/lesson.types';

interface CurriculumSidebarProps {
  modules: Module[];
  expandedModules: string[];
  activeLesson?: Lesson;
  totalLessons: number;
  onToggleModule: (id: string | number) => void;
  onLessonClick: (lesson: Lesson) => void;
  onToggleSidebar?: () => void;
}

export function CurriculumSidebar({
  modules,
  expandedModules,
  activeLesson,
  totalLessons,
  onToggleModule,
  onLessonClick,
  onToggleSidebar,
}: CurriculumSidebarProps) {
  return (
    <div className="w-[360px] flex-shrink-0 space-y-4" style={{ position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>Lesson Curriculum</span>
            <span className="text-xs text-[#9CA3AF]">({totalLessons})</span>
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1 hover:bg-[#F3F4F6] rounded-md text-[#6B7280] hover:text-[#E11D48] transition-colors"
              title="Thu gọn danh mục"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="bg-[#FAFAFA] divide-y divide-[#F3F4F6]">
          {modules.flatMap(mod => mod.lessons).map(lesson => {
            const isCurrent = String(lesson.id) === String(activeLesson?.id);

            return (
              <div
                key={lesson.id}
                onClick={() => onLessonClick(lesson)}
                className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-[#FFF1F3] border-l-2 border-[#E11D48]'
                    : lesson.status === 'locked'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <LessonStatusIcon status={lesson.status} isCurrent={isCurrent} />
                <div className="flex w-9 flex-shrink-0 items-center gap-1">
                  {(lesson.hasVideo || lesson.type === 'Video' || lesson.type === 'Video & Reading') && (
                    <Video className="h-3.5 w-3.5 text-[#E11D48]" />
                  )}
                  {(lesson.hasReading || lesson.type === 'Reading' || lesson.type === 'Video & Reading') && (
                    <BookOpen className="h-3.5 w-3.5 text-[#6366F1]" />
                  )}
                  {(lesson.hasAssessment || lesson.type === 'Assessment') && (
                    <ClipboardList className="h-3.5 w-3.5 text-[#E11D48]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs truncate block ${
                      isCurrent ? 'text-[#E11D48]' : 'text-[#374151]'
                    }`}
                    style={{ fontWeight: isCurrent ? 600 : 400 }}
                  >
                    {lesson.title}
                  </span>
                </div>
                <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{lesson.duration}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';

import type { CourseBuilderLesson } from '../../../types/course/create-course.types';
import { FormCard } from './fields';
import { LessonEmptyState, LessonList } from './lesson';

interface CurriculumSectionProps {
  draggedLessonIndex: number | null;
  lessons: CourseBuilderLesson[];
  onCreateLesson: () => void;
  onDeleteLesson: (lessonId: string) => void;
  onDragEnd: () => void;
  onDragOver: (targetIndex: number) => void;
  onDragStart: (index: number) => void;
  onEditLesson: (lessonId: string) => void;
  onToggleLessonLock: (lessonId: string) => void;
}

export function CurriculumSection({
  draggedLessonIndex,
  lessons,
  onCreateLesson,
  onDeleteLesson,
  onDragEnd,
  onDragOver,
  onDragStart,
  onEditLesson,
  onToggleLessonLock,
}: CurriculumSectionProps) {
  return (
    <FormCard
      step={2}
      title="Lesson Curriculum"
      description="Manage all lessons in this course."
      action={(
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateLesson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Lesson
          </button>
        </div>
      )}
    >
      {lessons.length === 0 ? (
        <LessonEmptyState onCreateLesson={onCreateLesson} />
      ) : (
        <LessonList
          draggedLessonIndex={draggedLessonIndex}
          lessons={lessons}
          onDeleteLesson={onDeleteLesson}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onEditLesson={onEditLesson}
          onToggleLessonLock={onToggleLessonLock}
        />
      )}
    </FormCard>
  );
}

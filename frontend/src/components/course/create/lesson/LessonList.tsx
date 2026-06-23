import type { CourseBuilderLesson } from '../../../../types/course/create-course.types';
import { LessonRow } from './LessonRow';

interface LessonListProps {
  draggedLessonIndex: number | null;
  lessons: CourseBuilderLesson[];
  onDeleteLesson: (lessonId: string) => void;
  onDragEnd: () => void;
  onDragOver: (targetIndex: number) => void;
  onDragStart: (index: number) => void;
  onEditLesson: (lessonId: string) => void;
  onToggleLessonLock: (lessonId: string) => void;
}

export function LessonList({
  draggedLessonIndex,
  lessons,
  onDeleteLesson,
  onDragEnd,
  onDragOver,
  onDragStart,
  onEditLesson,
  onToggleLessonLock,
}: LessonListProps) {
  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          index={index}
          isDragging={draggedLessonIndex === index}
          onDragStart={() => onDragStart(index)}
          onDragOver={() => onDragOver(index)}
          onDragEnd={onDragEnd}
          onEdit={() => onEditLesson(lesson.id)}
          onDelete={() => onDeleteLesson(lesson.id)}
          onToggleLock={() => onToggleLessonLock(lesson.id)}
        />
      ))}
    </div>
  );
}

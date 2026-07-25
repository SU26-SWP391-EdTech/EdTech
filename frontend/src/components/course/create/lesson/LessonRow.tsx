import { Clock, GripVertical, Lock, Pencil, Trash2, Unlock } from 'lucide-react';

import type { CourseBuilderLesson } from '../../../../types/course/create-course.types';
import { IconButton } from '../fields';
import { LessonTypeBadge } from './LessonTypeBadge';

interface LessonRowProps {
  lesson: CourseBuilderLesson;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
}

export function LessonRow({
  lesson,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleLock,
}: LessonRowProps) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        onDragStart();
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#E11D48]/30 transition-all group ${isDragging ? 'opacity-40 scale-95 border-[#E11D48]' : ''}`}
    >
      <GripVertical className="w-3.5 h-3.5 text-[#9CA3AF] cursor-grab" />
      <span className="text-[11px] text-[#9CA3AF] w-6" style={{ fontWeight: 600 }}>{lesson.position.toString().padStart(2, '0')}</span>
      <LessonTypeBadge type={lesson.type} />
      <span className="text-sm text-[#111827] flex-1" style={{ fontWeight: 500 }}>{lesson.title}</span>
      <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
        <Clock className="w-3 h-3" />
        {lesson.duration}
      </span>
      <button
        title={lesson.locked ? 'Locked - preview disabled' : 'Free preview'}
        onClick={onToggleLock}
        className={`p-1 rounded ${lesson.locked ? 'text-[#9CA3AF] hover:bg-[#F8FAFC]' : 'text-[#10B981] hover:bg-[#ECFDF5]'}`}
      >
        {lesson.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>
      <IconButton title="Edit" onClick={onEdit}>
        <Pencil className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton title="Delete" danger onClick={onDelete}>
        <Trash2 className="w-3.5 h-3.5" />
      </IconButton>
    </div>
  );
}

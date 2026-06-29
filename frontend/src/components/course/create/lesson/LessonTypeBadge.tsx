import type { ComponentType } from 'react';
import { BookOpen, ClipboardList, FileText, Video } from 'lucide-react';

import type { CourseBuilderLessonType } from '../../../../types/course/create-course.types';

interface LessonTypeBadgeProps {
  type: CourseBuilderLessonType;
}

export function LessonTypeBadge({ type }: LessonTypeBadgeProps) {
  if (type === 'Video & Reading') {
    return (
      <div className="flex gap-1">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#FEF2F2] text-[#E11D48]" style={{ fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          <Video className="w-3 h-3" />
          Video
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#EEF2FF] text-[#6366F1]" style={{ fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          <BookOpen className="w-3 h-3" />
          Reading
        </span>
      </div>
    );
  }

  const map: Record<Exclude<CourseBuilderLessonType, 'Video & Reading'>, { Icon: ComponentType<{ className?: string }>; tint: string; color: string }> = {
    Video: { Icon: Video, tint: '#FEF2F2', color: '#E11D48' },
    Reading: { Icon: BookOpen, tint: '#EEF2FF', color: '#6366F1' },
    Quiz: { Icon: ClipboardList, tint: '#FFFBEB', color: '#B45309' },
    Assignment: { Icon: FileText, tint: '#ECFDF5', color: '#047857' },
    Assessment: { Icon: ClipboardList, tint: '#FEF2F2', color: '#E11D48' },
  };
  const meta = map[type as Exclude<CourseBuilderLessonType, 'Video & Reading'>];

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: meta?.tint || '#F3F4F6', color: meta?.color || '#374151', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
      {meta && <meta.Icon className="w-3 h-3" />}
      {type}
    </span>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, BookOpen, ClipboardList, FileText } from 'lucide-react';
import type { Lesson, LessonType } from '../../types/course/course-detail.types';
import { StatusIcon } from './StatusIcon';

interface LessonRowProps {
  lesson: Lesson;
  courseId: number;
}

export function LessonRow({ lesson, courseId }: LessonRowProps) {
  const navigate = useNavigate();
  const typeMap: Record<LessonType, { Icon: React.ComponentType<{ className?: string }>; color: string }> = {
    Video: { Icon: Video, color: '#E11D48' },
    Reading: { Icon: BookOpen, color: '#6366F1' },
    Quiz: { Icon: ClipboardList, color: '#F59E0B' },
    Assignment: { Icon: FileText, color: '#10B981' },
  };
  const tm = typeMap[lesson.type] || typeMap.Video;

  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  return (
    <div
      onClick={() => {
        if (isLocked) {
          return;
        }
        navigate(`/learner/lesson?courseId=${courseId}&lessonId=${lesson.id}`);
      }}
      className={`flex items-center gap-3 px-4 py-2.5 border-t border-[#F1F5F9] transition-colors ${
        isCurrent ? 'bg-[#FEF2F2]' : 'hover:bg-[#FAFAFA]'
      } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <StatusIcon status={lesson.status} />
      <span className="flex items-center gap-1.5 text-xs" style={{ color: tm.color, fontWeight: 600 }}>
        <tm.Icon className="w-3.5 h-3.5" />
        {lesson.type || 'Video'}
      </span>
      <span className={`text-sm flex-1 ${isCurrent ? 'text-[#E11D48]' : 'text-[#111827]'}`} style={{ fontWeight: isCurrent ? 600 : 500 }}>
        {lesson.title}
      </span>
      {lesson.preview && (
        <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#047857] rounded text-[10px]" style={{ fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Preview</span>
      )}
      <span className="text-xs text-[#6B7280] flex items-center gap-1 w-16 justify-end">
        <Clock className="w-3 h-3" />
        {lesson.duration}
      </span>
    </div>
  );
}

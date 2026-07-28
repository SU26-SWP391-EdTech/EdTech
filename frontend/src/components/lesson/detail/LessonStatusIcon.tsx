import { CheckCircle2, Circle, Lock, PlayCircle } from 'lucide-react';
import type { Lesson } from '../../../types/lesson/lesson.types';

interface LessonStatusIconProps {
  status: Lesson['status'];
  isCurrent?: boolean;
}

export function LessonStatusIcon({ status, isCurrent }: LessonStatusIconProps) {
  if (isCurrent) return <PlayCircle className="w-4 h-4 text-[#E11D48] shrink-0 animate-pulse" />;
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />;
  if (status === 'current') return <PlayCircle className="w-4 h-4 text-[#E11D48] shrink-0" />;
  if (status === 'locked') return <Lock className="w-4 h-4 text-[#D1D5DB] shrink-0" />;
  return <Circle className="w-4 h-4 text-[#D1D5DB] shrink-0" />;
}

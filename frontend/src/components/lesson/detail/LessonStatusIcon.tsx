import { CheckCircle2, Circle, Lock, PlayCircle } from 'lucide-react';
import type { Lesson } from '../../../types/lesson/lesson.types';

interface LessonStatusIconProps {
  status: Lesson['status'];
}

export function LessonStatusIcon({ status }: LessonStatusIconProps) {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
  if (status === 'current') return <PlayCircle className="w-4 h-4 text-[#E11D48]" />;
  if (status === 'locked') return <Lock className="w-4 h-4 text-[#D1D5DB]" />;
  return <Circle className="w-4 h-4 text-[#D1D5DB]" />;
}

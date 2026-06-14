import { CheckCircle2, Play, Lock } from 'lucide-react';
import type { LessonStatus } from './types';

interface StatusIconProps {
  status: LessonStatus;
}

export function StatusIcon({ status }: StatusIconProps) {
  if (status === 'completed') return <div className="w-5 h-5 rounded-full bg-[#ECFDF5] flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /></div>;
  if (status === 'current') return <div className="w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center flex-shrink-0"><Play className="w-2.5 h-2.5 text-white fill-white" /></div>;
  if (status === 'locked') return <div className="w-5 h-5 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0"><Lock className="w-2.5 h-2.5 text-[#9CA3AF]" /></div>;
  return <div className="w-5 h-5 rounded-full border border-[#E5E7EB] flex-shrink-0" />;
}

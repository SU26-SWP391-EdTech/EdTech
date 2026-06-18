import { BookOpen, Clock } from 'lucide-react';
import CircularProgress from './CircularProgress';
import type { LearningPath } from '../../../services/learning-path/learning-path.service';

interface PathHeroBannerProps {
  path: LearningPath;
  totalCourses: number;
  totalDurationLabel: string;
  overallProgress: number;
  completedCourses: number;
}

export default function PathHeroBanner({
  path,
  totalCourses,
  totalDurationLabel,
  overallProgress,
  completedCourses,
}: PathHeroBannerProps) {
  const managerName = path.edittedBy?.fullName || 'Academic Manager';
  const managerAvatarUrl = path.edittedBy?.avatarUrl || path.edittedBy?.avatar || '';
  const managerInitials = managerName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative overflow-hidden bg-[#111827]">
      {path.bannerUrl && (
        <img src={path.bannerUrl} alt={path.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111827]/95 via-[#1F2937]/85 to-[#0F172A]/90" />

      <div className="relative max-w-[1376px] mx-auto px-8 py-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            {overallProgress > 0 && (
              <div className="mb-3">
                <span className="px-2.5 py-1 bg-[#16A34A]/80 text-white border border-[#16A34A]/40 rounded-full text-xs backdrop-blur-sm" style={{ fontWeight: 500 }}>
                  In Progress
                </span>
              </div>
            )}

            <h1 className="text-white mb-2" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.15 }}>{path.title}</h1>
            <p className="text-white/70 text-sm mb-5 max-w-xl" style={{ lineHeight: 1.6 }}>{path.description}</p>

            <div className="flex items-center gap-5 mb-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-white/80">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm" style={{ fontWeight: 600 }}>{totalDurationLabel}</span>
                <span className="text-xs text-white/50">total hours</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-sm" style={{ fontWeight: 600 }}>{totalCourses}</span>
                <span className="text-xs text-white/50">courses</span>
              </div>
            </div>

            <div className="max-w-sm mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/70">Your path progress</span>
                <span className="text-sm text-white" style={{ fontWeight: 700 }}>{overallProgress}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="text-xs text-white/50 mt-1">{completedCourses} of {totalCourses} courses completed</p>
            </div>

            <div className="flex items-center gap-2">
              {managerAvatarUrl ? (
                <img src={managerAvatarUrl} alt={managerName} className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 bg-indigo-600" style={{ fontSize: '10px', fontWeight: 700 }}>
                  {managerInitials}
                </div>
              )}
              <div>
                <span className="text-xs text-white" style={{ fontWeight: 500 }}>{managerName}</span>
                <span className="text-xs text-white/50"> - Academic Manager</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-5 shrink-0 w-44">
            <div className="flex justify-center">
              <CircularProgress value={overallProgress} size={104} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

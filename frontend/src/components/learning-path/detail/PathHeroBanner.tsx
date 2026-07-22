import { BookOpen, Clock } from 'lucide-react';
import type { LearningPath } from '../../../services/learning-path/learning-path.service';

interface PathHeroBannerProps {
  path: LearningPath;
  totalCourses: number;
  totalDurationLabel: string;
  overallProgress?: number;
  completedCourses?: number;
}

export default function PathHeroBanner({
  path,
  totalCourses,
  totalDurationLabel,
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
    <div className="relative overflow-hidden bg-slate-900 text-white min-h-[280px] shadow-lg flex items-end">
      {/* Clear, Vivid Banner Image */}
      {path.bannerUrl ? (
        <img
          src={path.bannerUrl}
          alt={path.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-indigo-700 to-purple-800" />
      )}

      {/* Light gradient overlay just to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-transparent to-transparent" />

      <div className="relative max-w-[1376px] w-full mx-auto px-8 py-8 z-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 max-w-3xl">
            {/* Title with drop shadow */}
            <h1 className="text-white mb-2 text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md" style={{ lineHeight: 1.15 }}>
              {path.title}
            </h1>

            {/* Description */}
            <p className="text-slate-200 text-sm md:text-base mb-5 font-normal leading-relaxed drop-shadow-sm">
              {path.description}
            </p>

            {/* Stat chips with light glassmorphism */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-sm text-white">
                <Clock className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold">{totalDurationLabel}</span>
                <span className="text-[11px] text-slate-300">total hours</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-sm text-white">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold">{totalCourses}</span>
                <span className="text-[11px] text-slate-300">courses</span>
              </div>
            </div>

            {/* Manager info */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-white/20">
              {managerAvatarUrl ? (
                <img src={managerAvatarUrl} alt={managerName} className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white/50 shadow-sm" />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 bg-rose-600 text-[10px] font-bold ring-2 ring-white/50">
                  {managerInitials}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-white drop-shadow-sm">{managerName}</span>
                <span className="text-xs text-slate-300 drop-shadow-sm"> — Academic Manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

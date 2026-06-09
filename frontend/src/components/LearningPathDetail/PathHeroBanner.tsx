import { Clock, BookOpen, Users, Star, Play, Bookmark, Share2 } from 'lucide-react';
import CircularProgress from './CircularProgress';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

interface PathHeroBannerProps {
  path: LearningPath;
  totalCourses: number;
  overallProgress: number;
  completedCourses: number;
  remainingHours: number;
  remainingLessons: number;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
  onEnrollAllPath: () => void;
}

export default function PathHeroBanner({
  path,
  totalCourses,
  overallProgress,
  completedCourses,
  remainingHours,
  remainingLessons,
  bookmarked,
  onBookmarkToggle,
  onEnrollAllPath
}: PathHeroBannerProps) {
  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB,#3B82F6)' }}>
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute rounded-full border border-white/30"
            style={{ width: 200 + i * 80, height: 200 + i * 80, top: -60 + i * 10, right: -80 + i * 20, opacity: 0.4 - i * 0.05 }} />
        ))}
      </div>

      <div className="relative max-w-[1376px] mx-auto px-8 py-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2.5 py-1 bg-white/15 text-white border border-white/20 rounded-full text-xs backdrop-blur-sm capitalize" style={{ fontWeight: 500 }}>
                {path.level}
              </span>
              <span className="px-2.5 py-1 bg-white/15 text-white border border-white/20 rounded-full text-xs backdrop-blur-sm" style={{ fontWeight: 500 }}>
                Professional Path
              </span>
              {overallProgress > 0 && (
                <span className="px-2.5 py-1 bg-[#16A34A]/80 text-white border border-[#16A34A]/40 rounded-full text-xs backdrop-blur-sm" style={{ fontWeight: 500 }}>
                  In Progress
                </span>
              )}
            </div>

            <h1 className="text-white mb-2" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.15 }}>{path.title}</h1>
            <p className="text-white/70 text-sm mb-5 max-w-xl" style={{ lineHeight: 1.6 }}>{path.description}</p>

            {/* Stats row */}
            <div className="flex items-center gap-5 mb-5 flex-wrap">
              {[
                { icon: <Clock className="w-3.5 h-3.5" />, val: `${totalCourses * 12}h`, label: 'total hours' },
                { icon: <BookOpen className="w-3.5 h-3.5" />, val: `${totalCourses}`, label: 'courses' },
                { icon: <Users className="w-3.5 h-3.5" />, val: '1,250', label: 'enrolled' },
                { icon: <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />, val: '4.8', label: '(312 reviews)' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-white/80">
                  {s.icon}
                  <span className="text-sm" style={{ fontWeight: 600 }}>{s.val}</span>
                  <span className="text-xs text-white/50">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Overall progress */}
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

            {/* Instructor */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 bg-indigo-600" style={{ fontSize: '10px', fontWeight: 700 }}>
                ED
              </div>
              <div>
                <span className="text-xs text-white" style={{ fontWeight: 500 }}>EdTech Academy Team</span>
                <span className="text-xs text-white/50"> · Curriculum Lead · Active Guidance</span>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-5 shrink-0 w-64">
            <div className="flex justify-center mb-4">
              <CircularProgress value={overallProgress} size={96} />
            </div>
            <p className="text-center text-white/70 text-xs mb-4">
              <span className="text-white animate-pulse" style={{ fontWeight: 700 }}>{remainingHours}h</span> remaining · <span className="text-white" style={{ fontWeight: 700 }}>{remainingLessons}</span> lessons left
            </p>
            <button 
              onClick={onEnrollAllPath}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors mb-2" 
              style={{ fontWeight: 600 }}
            >
              <Play className="w-4 h-4 fill-white" /> {overallProgress > 0 ? 'Continue Roadmap' : 'Enroll Learning Path'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onBookmarkToggle}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border transition-colors ${bookmarked ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}
                style={{ fontWeight: 500 }}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} /> {bookmarked ? 'Saved' : 'Bookmark'}
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border border-white/20 bg-white/10 text-white/70 hover:bg-white/20 transition-colors" style={{ fontWeight: 500 }}>
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

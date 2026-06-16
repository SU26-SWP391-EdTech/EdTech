import { BadgeCheck, Users, Clock, BookOpen, Languages, Calendar, Sparkles, Play, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CourseHeroProps {
  course: any;
  role: string;
  enrolled: boolean;
  progressVal: number;
  completedLessons: number;
  totalLessons: number;
  handleEnroll: () => void;
  instructorName: string;
  instructorAvatar: string;
  instructorAvatarUrl?: string;
  durationLabel: string;
  onContinueCourse: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function CourseHero({
  course,
  role,
  enrolled,
  progressVal,
  completedLessons,
  totalLessons,
  handleEnroll,
  instructorName,
  instructorAvatar,
  instructorAvatarUrl,
  durationLabel,
  onContinueCourse,
  onApprove,
  onReject,
}: CourseHeroProps) {
  return (
    <div className="max-w-[1376px] mx-auto px-8 pt-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#0F172A] border border-[#E5E7EB] shadow-lg">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#E11D48]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-[#F43F5E]/10 blur-3xl pointer-events-none" />
        <div className="relative px-8 py-10">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7 text-white">
              {enrolled && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-[#E11D48] rounded text-[10px]" style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <BadgeCheck className="w-3 h-3" />
                      Enrolled
                    </span>
                </div>
              )}
              <h1 className="text-[36px] text-white mb-2" style={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {course.title}
              </h1>
              <p className="text-[15px] text-white/70 mb-5 max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-5 mb-5 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{(course.enrollmentCount || 0).toLocaleString()} learners</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{durationLabel}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{totalLessons} lessons</span>
                <span className="flex items-center gap-1.5"><Languages className="w-4 h-4" />{course.language || 'English'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Updated {new Date(course.updatedAt || course.createdAt || Date.now()).toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'})}</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {instructorAvatarUrl ? (
                  <img src={instructorAvatarUrl} alt={instructorName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white text-sm" style={{ fontWeight: 600 }}>{instructorAvatar}</div>
                )}
                <div>
                  <p className="text-sm text-white" style={{ fontWeight: 500 }}>{instructorName}</p>
                  <p className="text-xs text-white/60">Course Provider · Verified instructor</p>
                </div>
              </div>

              {enrolled && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 backdrop-blur">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#F43F5E]" />
                      <span className="text-xs text-white/80" style={{ fontWeight: 600 }}>Your progress</span>
                    </div>
                    <span className="text-sm text-white" style={{ fontWeight: 700 }}>{progressVal}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-[#E11D48] to-[#F43F5E] rounded-full" style={{ width: `${progressVal}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{completedLessons}/{totalLessons} lessons completed</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {(role === 'academic manager' || role === 'academic-manager') && (
                  <>
                    <button onClick={onApprove} className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] text-white rounded-lg text-sm hover:bg-[#059669] transition-colors shadow-lg shadow-[#10B981]/30 animate-in fade-in duration-200" style={{ fontWeight: 600 }}>
                      Approve
                    </button>
                    <button onClick={onReject} className="flex items-center gap-2 px-5 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm hover:bg-[#DC2626] transition-colors shadow-lg shadow-[#EF4444]/30 animate-in fade-in duration-200" style={{ fontWeight: 600 }}>
                      Reject
                    </button>
                  </>
                )}
                {role === 'guest' && (
                  <button onClick={handleEnroll} className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors shadow-lg shadow-[#E11D48]/30" style={{ fontWeight: 600 }}>
                    <Play className="w-4 h-4 fill-white" />
                    Enroll Course
                  </button>
                )}
                {role === 'learner' && (
                  !enrolled ? (
                    <button onClick={handleEnroll} className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors shadow-lg shadow-[#E11D48]/30" style={{ fontWeight: 600 }}>
                      <Play className="w-4 h-4 fill-white" />
                      Enroll Course
                    </button>
                  ) : (
                    <button onClick={onContinueCourse} className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors shadow-lg shadow-[#E11D48]/30" style={{ fontWeight: 600 }}>
                      <Play className="w-4 h-4 fill-white" />
                      Continue Course
                    </button>
                  )
                )}
                <button onClick={() => toast.success('Link copied to clipboard!')} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-lg text-sm hover:bg-white/15 transition-colors" style={{ fontWeight: 500 }}>
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

            </div>

            <div className="col-span-5 relative">
              <div className="aspect-video rounded-xl overflow-hidden relative bg-slate-800 border border-white/10 shadow-2xl">
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60'}
                  alt="Course preview"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

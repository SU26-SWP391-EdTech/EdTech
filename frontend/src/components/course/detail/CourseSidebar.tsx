import React from 'react';
import { Play, Share2, BookOpen, Video, Download, ClipboardList, Award, Infinity, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProgressRing } from './ProgressRing';
import { Includes } from './Includes';

interface CourseSidebarProps {
  enrolled: boolean;
  progressVal: number;
  completedLessons: number;
  totalLessons: number;
  role: string;
  handleEnroll: () => void;
  duration: number;

  skills: string[];
}

export function CourseSidebar({
  enrolled,
  progressVal,
  completedLessons,
  totalLessons,
  role,
  handleEnroll,
  duration,

  skills,
}: CourseSidebarProps) {
  return (
    <aside className="col-span-4">
      <div className="space-y-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <div className="aspect-video relative overflow-hidden bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60"
              alt="Course preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[22px] text-[#10B981]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Free</span>
              {enrolled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ECFDF5] text-[#047857] rounded-full text-[11px]" style={{ fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Enrolled · In Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-full text-[11px]" style={{ fontWeight: 600 }}>
                  Not Enrolled
                </span>
              )}
            </div>

            {enrolled && (
              <div className="flex items-center gap-4 mb-4 p-3 bg-[#FAFAFA] rounded-xl">
                <ProgressRing percent={progressVal} />
                <div>
                  <p className="text-xs text-[#6B7280] mb-0.5" style={{ fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Your progress</p>
                  <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{completedLessons} / {totalLessons} lessons</p>
                  <button className="text-xs text-[#E11D48] hover:underline mt-0.5" style={{ fontWeight: 600 }}>Resume current lesson</button>
                </div>
              </div>
            )}

            {role === 'guest' && (
              <button onClick={handleEnroll} className="w-full flex items-center justify-center gap-2 py-3 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors mb-2" style={{ fontWeight: 600 }}>
                <Play className="w-4 h-4 fill-white" />
                Enroll Course
              </button>
            )}
            {role === 'learner' && (
              !enrolled ? (
                <button onClick={handleEnroll} className="w-full flex items-center justify-center gap-2 py-3 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors mb-2" style={{ fontWeight: 600 }}>
                  <Play className="w-4 h-4 fill-white" />
                  Enroll Course
                </button>
              ) : (
                <button onClick={() => toast.success('Starting learning session...')} className="w-full flex items-center justify-center gap-2 py-3 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors mb-2" style={{ fontWeight: 600 }}>
                  <Play className="w-4 h-4 fill-white" />
                  Continue Course
                </button>
              )
            )}
            <button onClick={() => toast.success('Link copied to clipboard!')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
              <Share2 className="w-3.5 h-3.5" />
              Share Course
            </button>

            <div className="mt-5 pt-5 border-t border-[#F1F5F9]">
              <p className="text-xs text-[#6B7280] mb-3" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>This course includes</p>
              <div className="space-y-2.5">
                <Includes Icon={BookOpen} label={`${totalLessons} lessons of curriculum content`} />
                <Includes Icon={Video} label={`${duration} hours of learning content`} />
                <Includes Icon={Download} label="Downloadable resources" />
                <Includes Icon={ClipboardList} label="Quizzes & assignments" />
                <Includes Icon={Award} label="Certificate of completion" highlight />
                <Includes Icon={Infinity} label="Lifetime access" />
                <Includes Icon={Globe} label="English & Vietnamese subtitles" />
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[#F1F5F9]">
              <p className="text-xs text-[#6B7280] mb-3" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Skills you'll gain</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-[#FEF2F2] text-[#E11D48] rounded text-xs" style={{ fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

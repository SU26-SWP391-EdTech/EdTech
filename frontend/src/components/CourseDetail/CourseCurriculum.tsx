import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './Card';
import type { Module } from './types';
import { LessonRow } from './LessonRow';

interface CourseCurriculumProps {
  curriculum: Module[];
  totalLessons: number;
  duration: number;
  enrolled: boolean;
}

export function CourseCurriculum({ curriculum, totalLessons, duration, enrolled }: CourseCurriculumProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ m1: true, m2: true });
  const toggle = (id: string) => setOpenModules((s) => ({ ...s, [id]: !s[id] }));

  return (
    <Card
      title="Course Curriculum"
      subtitle={`${curriculum.length} modules · ${totalLessons} lessons · ${duration} hours`}
      action={
        <button onClick={() => setOpenModules(Object.fromEntries(curriculum.map((m) => [m.id, true])))} className="text-xs text-[#E11D48] hover:underline" style={{ fontWeight: 600 }}>
          Expand all
        </button>
      }
    >
      <div className="space-y-2">
        {curriculum.map((m, idx) => (
          <div key={m.id} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <button onClick={() => toggle(m.id)} className="w-full flex items-center gap-3 px-4 py-3 bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors text-left">
              <span className="text-xs text-[#9CA3AF] w-6" style={{ fontWeight: 700 }}>{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{m.title.replace(/^Module \d+ — /, '')}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 truncate">{m.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                <span>{m.lessons.length} lessons</span>
                <span>·</span>
                <span>{m.lessons.reduce((acc, l) => acc + parseInt(l.duration) || 0, 0)} min</span>
                {enrolled && m.progress > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-[#10B981]" style={{ fontWeight: 600 }}>{m.progress}%</span>
                  </>
                )}
              </div>
              {openModules[m.id] ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
            </button>
            {openModules[m.id] && (
              <div className="bg-white">
                {m.lessons.map((l) => (
                  <LessonRow key={l.id} lesson={l} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { Check, Play, ChevronUp, ChevronDown } from 'lucide-react';
import type { Module } from '../../../hooks/learning-path/useLearningPathDetail';

interface ModuleAccordionProps {
  module: Module;
  defaultOpen?: boolean;
  onStartLesson: (lessonId: number) => void;
}

export default function ModuleAccordion({
  module,
  defaultOpen,
  onStartLesson
}: ModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const done = module.lessons.filter(l => l.done).length;
  const total = module.lessons.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${pct === 100 ? 'bg-[#16A34A]' : 'bg-[#F3F4F6] border border-[#E5E7EB]'}`}>
          {pct === 100 ? <Check className="w-3 h-3 text-white" /> : <span className="text-[9px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>{pct}%</span>}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{module.title}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{done}/{total} lessons</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16A34A' : '#E11D48' }} />
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#F3F4F6] bg-[#FAFAFA]">
          {module.lessons.map((lesson, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i < module.lessons.length - 1 ? 'border-b border-[#F3F4F6]' : ''} hover:bg-[#F5F5F5] transition-colors`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${lesson.done ? 'bg-[#16A34A]' : 'bg-white border border-[#E5E7EB]'}`}>
                {lesson.done ? <Check className="w-2.5 h-2.5 text-white" /> : <Play className="w-2 h-2 text-[#D1D5DB] fill-[#D1D5DB]" />}
              </div>
              <span className={`text-xs flex-1 ${lesson.done ? 'text-[#6B7280] line-through decoration-[#9CA3AF]' : 'text-[#374151]'}`} style={{ fontWeight: lesson.done ? 400 : 500 }}>
                {lesson.title}
              </span>
              <span className="text-[10px] text-[#9CA3AF] shrink-0">{lesson.duration}</span>
              {!lesson.done && (
                <button 
                  onClick={() => onStartLesson(lesson.id)}
                  className="px-2 py-0.5 bg-white border border-[#E5E7EB] text-[#6B7280] rounded text-[10px] hover:border-[#E11D48] hover:text-[#E11D48] transition-colors" 
                  style={{ fontWeight: 500 }}
                >
                  Start
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

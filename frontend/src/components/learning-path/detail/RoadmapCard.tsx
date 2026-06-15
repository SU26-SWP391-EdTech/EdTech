import React from 'react';
import { Clock, PlayCircle, Play, ArrowRight, Lock, Check, Radio } from 'lucide-react';
import type { CourseNode } from '../../../hooks/learning-path/useLearningPathDetail';

interface RoadmapCardProps {
  node: CourseNode;
  isLast: boolean;
  onSelect: () => void;
  onEnroll: () => void;
  onContinue: () => void;
}

const nodeCfg = {
  completed: { ring: '#16A34A', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', line: '#BBF7D0', badge: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', icon: <Check className="w-3.5 h-3.5 text-white" /> },
  current:   { ring: '#E11D48', bg: 'bg-white', border: 'border-[#FECDD3]', line: '#E5E7EB', badge: 'bg-[#FFF1F3] text-[#E11D48] border-[#FECDD3]', icon: <Radio className="w-3.5 h-3.5 text-white" /> },
  upcoming:  { ring: '#D1D5DB', bg: 'bg-white', border: 'border-[#E5E7EB]', line: '#E5E7EB', badge: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]', icon: <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" /> },
  locked:    { ring: '#E5E7EB', bg: 'bg-[#F9FAFB]', border: 'border-[#F3F4F6]', line: '#F3F4F6', badge: 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]', icon: <Lock className="w-3.5 h-3.5 text-[#D1D5DB]" /> },
};

export default function RoadmapCard({
  node,
  isLast,
  onSelect,
  onEnroll,
  onContinue
}: RoadmapCardProps) {
  const cfg = nodeCfg[node.state];
  const isLocked = node.state === 'locked';

  return (
    <div className="relative flex gap-4 cursor-pointer" onClick={onSelect}>
      {/* Vertical connector */}
      {!isLast && (
        <div className="absolute top-10 w-0.5 bottom-0" style={{ left: '15px', backgroundColor: cfg.line, zIndex: 0 }} />
      )}

      {/* Step circle */}
      <div className="shrink-0 z-10 flex flex-col items-center" style={{ paddingTop: 2 }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: isLocked ? '#F3F4F6' : node.state === 'upcoming' ? '#fff' : nodeCfg[node.state].ring, border: `2px solid ${nodeCfg[node.state].ring}` }}
        >
          {cfg.icon}
        </div>
      </div>

      {/* Card */}
      <div className={`flex-1 mb-5 rounded-2xl border p-4 transition-all hover:shadow-md ${cfg.bg} ${cfg.border} ${isLocked ? 'opacity-60' : ''} ${node.state === 'current' ? 'shadow-sm shadow-[#E11D48]/10 ring-1 ring-[#FECDD3]' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: isLocked ? '#E5E7EB' : node.color, opacity: isLocked ? 0.5 : 1 }}
          >
            <span style={{ color: 'white' }}>{node.icon}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-sm ${isLocked ? 'text-[#9CA3AF]' : 'text-[#111827]'}`} style={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {node.title}
                </p>
                <p className={`text-xs mt-0.5 ${isLocked ? 'text-[#C0C0C0]' : 'text-[#6B7280]'}`} style={{ lineHeight: 1.5 }}>
                  {node.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.badge}`} style={{ fontWeight: 500 }}>
                  {node.state === 'completed' && 'Done'}
                  {node.state === 'current' && 'Active'}
                  {node.state === 'upcoming' && 'Next'}
                  {node.state === 'locked' && 'Locked'}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#9CA3AF]" /><span className="text-xs text-[#9CA3AF]">{node.duration}</span></div>
              <div className="flex items-center gap-1"><PlayCircle className="w-3 h-3 text-[#9CA3AF]" /><span className="text-xs text-[#9CA3AF]">{node.lessons} lessons</span></div>
              {!isLocked && node.topics.slice(0, 2).map(t => (
                <span key={t} className="px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded text-[10px]">{t}</span>
              ))}
            </div>

            {/* Progress bar */}
            {node.progress > 0 && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#9CA3AF]">Progress</span>
                  <span className="text-[10px]" style={{ fontWeight: 600, color: node.state === 'completed' ? '#16A34A' : '#E11D48' }}>{node.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${node.progress}%`, backgroundColor: node.state === 'completed' ? '#16A34A' : '#E11D48' }} />
                </div>
              </div>
            )}

            {/* CTA for current/upcoming */}
            {node.state === 'current' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onContinue(); }}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" 
                style={{ fontWeight: 500 }}
              >
                <Play className="w-3 h-3 fill-white" /> Continue — Lesson {Math.max(1, Math.floor(node.lessons * (node.progress / 100)))} of {node.lessons}
              </button>
            )}

            {node.state === 'upcoming' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEnroll(); }}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" 
                style={{ fontWeight: 500 }}
              >
                Enroll Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

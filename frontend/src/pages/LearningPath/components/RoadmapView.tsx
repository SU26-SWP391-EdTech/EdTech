import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import type { LearningPath } from '../utils/learningPathHelpers';

interface RoadmapViewProps {
  path: LearningPath | undefined;
}

export function RoadmapView({ path }: RoadmapViewProps) {
  const navigate = useNavigate();

  if (!path) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col p-6 items-center justify-center min-h-[300px]">
        <p className="text-sm text-[#6B7280]">No learning path selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: path.thumbnailUrl ? 'transparent' : path.thumbBg }}>
            {path.thumbnailUrl ? (
              <img src={path.thumbnailUrl} className="w-full h-full object-cover" />
            ) : (
              path.thumbIcon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#111827] truncate font-bold text-sm">{path.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#9CA3AF]">{path.courses} courses · {path.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes */}
      <div className="px-5 py-4 overflow-y-auto flex-1" style={{ maxHeight: 480 }}>
        {path.nodes.map((node, i) => {
          const isLast = i === path.nodes.length - 1;

          return (
            <div key={node.id} className="relative flex gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute top-7 bottom-0 w-px bg-gray-200"
                  style={{ left: '12px', height: 'calc(100% - 4px)' }}
                />
              )}

              {/* Step number circle */}
              <div className="flex flex-col items-center gap-0 shrink-0 z-10">
                <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[11px] font-bold text-[#E11D48]">
                  {i + 1}
                </div>
              </div>

              {/* Node card */}
              <div
                onClick={() => {
                  if (node.id) {
                    navigate(`/academic/courses/detail?id=${node.id}`);
                  }
                }}
                className="flex-1 mb-3 rounded-xl p-3 border border-[#E5E7EB] bg-white cursor-pointer hover:border-[#E11D48]/30 hover:bg-[#FFF1F3]/5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">
                      {node.title}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{node.description}</p>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#E11D48] font-medium">
                      <span>Go to course</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-[#9CA3AF]" />
                    <span className="text-[10px] text-[#9CA3AF]">{node.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {path.nodes.length === 0 && (
          <div className="text-xs text-[#9CA3AF] p-4 text-center">No courses in this path.</div>
        )}
      </div>
    </div>
  );
}

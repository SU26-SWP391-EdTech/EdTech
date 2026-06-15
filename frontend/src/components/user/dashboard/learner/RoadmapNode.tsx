import { CheckCircle2, Lock, Play } from 'lucide-react';
import ProgressBar from './ProgressBar';

export type NodeState = 'completed' | 'current' | 'upcoming' | 'locked';

interface RoadmapNodeProps {
    id: number;
    label: string;
    state: NodeState;
    course: string;
    progress?: number;
    isLast: boolean;
}

const nodeColors: Record<NodeState, { ring: string; bg: string; text: string; line: string }> = {
    completed: { ring: 'border-[#10B981]', bg: 'bg-[#10B981]', text: 'text-white', line: '#10B981' },
    current: { ring: 'border-[#E11D48]', bg: 'bg-[#E11D48]', text: 'text-white', line: '#E11D48' },
    upcoming: { ring: 'border-[#D1D5DB]', bg: 'bg-white', text: 'text-[#6B7280]', line: '#E5E7EB' },
    locked: { ring: 'border-[#E5E7EB]', bg: 'bg-[#F9FAFB]', text: 'text-[#9CA3AF]', line: '#F3F4F6' },
};

export default function RoadmapNode({
    label,
    state,
    course,
    progress,
    isLast
}: RoadmapNodeProps) {
    const cfg = nodeColors[state];
    return (
        <div className="relative flex items-start gap-4 pb-5">
            {/* Connector line */}
            {!isLast && (
                <div
                    className="absolute w-0.5"
                    style={{
                        left: '15px',
                        top: '32px',
                        bottom: 0,
                        backgroundColor: cfg.line,
                        zIndex: 0,
                    }}
                />
            )}

            {/* Node circle */}
            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cfg.ring} ${cfg.bg}`}>
                {state === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                ) : state === 'locked' ? (
                    <Lock className="w-3.5 h-3.5 text-[#D1D5DB]" />
                ) : state === 'current' ? (
                    <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                ) : (
                    <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 pt-0.5 ${state === 'locked' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm ${state === 'current' ? 'text-[#E11D48]' : state === 'completed' ? 'text-[#111827]' : 'text-[#6B7280]'}`} style={{ fontWeight: state === 'current' ? 700 : 500 }}>
                            {label}
                            {state === 'current' && (
                                <span className="ml-2 text-[10px] bg-[#E11D48] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>ACTIVE</span>
                            )}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{course}</p>
                    </div>
                    {progress !== undefined && state !== 'completed' && (
                        <span className="text-xs" style={{ fontWeight: 600, color: state === 'current' ? '#E11D48' : '#9CA3AF' }}>
                            {progress}%
                        </span>
                    )}
                    {state === 'completed' && (
                        <span className="text-[10px] text-[#10B981] bg-[#F0FDF4] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>DONE</span>
                    )}
                </div>
                {progress !== undefined && state === 'current' && (
                    <div className="mt-2">
                        <ProgressBar value={progress} color="#E11D48" />
                    </div>
                )}
                {progress !== undefined && state === 'upcoming' && (
                    <div className="mt-2">
                        <ProgressBar value={progress} color="#3B82F6" />
                    </div>
                )}
            </div>
        </div>
    );
}

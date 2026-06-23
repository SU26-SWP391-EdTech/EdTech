import { CheckCircle2 } from 'lucide-react';

export type NodeState = 'enrolled' | 'not-enrolled';

interface RoadmapNodeProps {
    id: number;
    label: string;
    state: NodeState;
    course: string;
    isLast: boolean;
}

const nodeColors: Record<NodeState, { ring: string; bg: string; text: string; line: string }> = {
    enrolled: { ring: 'border-[#10B981]', bg: 'bg-[#10B981]', text: 'text-white', line: '#10B981' },
    'not-enrolled': { ring: 'border-[#D1D5DB]', bg: 'bg-white', text: 'text-[#6B7280]', line: '#E5E7EB' },
};

export default function RoadmapNode({
    label,
    state,
    course,
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
                {state === 'enrolled' ? (
                    <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                ) : (
                    <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm ${state === 'enrolled' ? 'text-[#111827]' : 'text-[#6B7280]'}`} style={{ fontWeight: state === 'enrolled' ? 600 : 500 }}>
                            {label}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{course}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${state === 'enrolled' ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#6B7280] bg-[#F3F4F6]'}`} style={{ fontWeight: 600 }}>
                        {state === 'enrolled' ? 'ENROLLED' : 'NOT ENROLLED'}
                    </span>
                </div>
            </div>
        </div>
    );
}

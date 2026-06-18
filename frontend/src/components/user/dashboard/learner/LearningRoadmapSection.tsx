import { Sparkles } from 'lucide-react';
import RoadmapNode from './RoadmapNode';
import type { NodeState } from './RoadmapNode';
import type { LearningPath } from '../../../../services/learning-path/learning-path.service';

interface RoadmapNodeData {
    id: number;
    label: string;
    state: NodeState;
    course: string;
    progress?: number;
}

interface LearningRoadmapSectionProps {
    activePath: LearningPath | null;
    roadmapNodes: RoadmapNodeData[];
    completedCount: number;
    onViewFullMap: () => void;
    onExplorePathsClick: () => void;
}

export default function LearningRoadmapSection({
    activePath,
    roadmapNodes,
    completedCount,
    onViewFullMap,
    onExplorePathsClick
}: LearningRoadmapSectionProps) {
    return (
        <div className="col-span-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Learning Roadmap</h2>
                {activePath && (
                    <span className="text-xs text-[#9CA3AF]" style={{ fontWeight: 500 }}>{activePath.title}</span>
                )}
            </div>

            {activePath ? (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                    {/* Path label */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 bg-[#FFF1F4] rounded-full">
                                <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600 }}>{completedCount} / {roadmapNodes.length} complete</span>
                            </div>
                        </div>
                        <button 
                            onClick={onViewFullMap}
                            className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors" 
                            style={{ fontWeight: 500 }}
                        >
                            Full map →
                        </button>
                    </div>

                    {/* Vertical roadmap */}
                    <div className="relative">
                        {roadmapNodes.map((node, i) => {
                            const isLast = i === roadmapNodes.length - 1;
                            return (
                                <RoadmapNode
                                    key={node.id}
                                    id={node.id}
                                    label={node.label}
                                    state={node.state}
                                    course={node.course}
                                    progress={node.progress}
                                    isLast={isLast}
                                />
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#9CA3AF]">
                        <span>Est. completion: Aug 2026</span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10B981]" /><span>Done</span></div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#E11D48]" /><span>Active</span></div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#D1D5DB]" /><span>Locked</span></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E5E7EB] rounded-2xl min-h-[300px]">
                    <Sparkles className="w-10 h-10 text-[#F59E0B] mb-3 animate-pulse" />
                    <h3 className="text-base font-bold text-[#111827] mb-1">No Roadmap Active</h3>
                    <p className="text-xs text-[#6B7280] max-w-sm mb-5">
                        Choose a learning path from the Explore section to track your roadmap progress.
                    </p>
                    <button
                        onClick={onExplorePathsClick}
                        className="px-4 py-2 bg-[#E11D48] text-white rounded-xl text-xs hover:bg-[#BE123C] transition-colors font-medium"
                    >
                        Explore Paths
                    </button>
                </div>
            )}
        </div>
    );
}

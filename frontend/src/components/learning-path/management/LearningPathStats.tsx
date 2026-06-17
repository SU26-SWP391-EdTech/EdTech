import React from 'react';
import { Target, Clock, TrendingUp } from 'lucide-react';

interface LearningPathStatsProps {
    stats: {
        total: number;
        totalCourses: number;
        avgDuration: string;
        avgCourses: number;
    };
}

export function LearningPathStats({ stats }: LearningPathStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            {[
                { label: 'Total Learning Paths', value: stats.total, icon: <Target className="w-4 h-4 text-[#6B7280]" />, badge: 'System-wide' },
                { label: 'Avg Path Duration', value: stats.avgDuration, icon: <Clock className="w-4 h-4 text-[#16A34A]" />, badge: 'Estimated time' },
                { label: 'Avg Courses Per Path', value: stats.avgCourses, icon: <TrendingUp className="w-4 h-4 text-[#7C3AED]" />, badge: 'Structure density' },
            ].map((s, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">{s.icon}</div>
                        <span className="text-xs px-2 py-1 rounded-lg bg-[#F8FAFC] text-[#6B7280] font-medium">
                            {s.badge}
                        </span>
                    </div>
                    <p className="text-[#111827] text-2xl font-bold leading-tight">{s.value}</p>
                    <p className="text-[#6B7280] text-sm mt-0.5">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

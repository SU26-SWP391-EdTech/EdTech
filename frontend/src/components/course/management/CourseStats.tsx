import React from 'react';
import { BookOpen, CheckCircle2, FileText, Users } from 'lucide-react';

interface CourseStatsProps {
    stats: {
        total: number;
        published: number;
        draft: number;
        pending: number;
        enrollments: number;
    };
}

export function CourseStats({ stats }: CourseStatsProps) {
    return (
        <div className="grid grid-cols-4 gap-4 mb-6 animate-in fade-in duration-200">
            {[
                { label: 'Total Courses', value: stats.total, icon: <BookOpen className="w-4 h-4 text-[#6B7280]" />, change: '+2 this month', up: true },
                { label: 'Published Courses', value: stats.published, icon: <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />, change: `${stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% of total`, up: true },
                { label: 'Pending', value: stats.pending, icon: <FileText className="w-4 h-4 text-[#D97706]" />, change: 'Awaiting review', up: null },
                { label: 'Total Enrollments', value: stats.enrollments.toLocaleString(), icon: <Users className="w-4 h-4 text-[#E11D48]" />, change: '+18.4% vs last mo', up: true },
            ].map((s, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">{s.icon}</div>
                        <span className={`text-xs px-2 py-1 rounded-lg ${s.up === true ? 'bg-[#F0FDF4] text-[#16A34A]' : s.up === false ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#FFFBEB] text-[#D97706]'}`} style={{ fontWeight: 500 }}>
                            {s.change}
                        </span>
                    </div>
                    <p className="text-[#111827]" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</p>
                    <p className="text-[#6B7280] text-sm mt-0.5">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

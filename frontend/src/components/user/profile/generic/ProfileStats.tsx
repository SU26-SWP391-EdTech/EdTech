import { ArrowUpRight, BookOpen, GraduationCap, Award, Briefcase, Clock } from 'lucide-react';
import type { ProfileData } from '../../../types/user/user-profile.types';

interface ProfileStatsProps {
    profile: ProfileData;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
    const stats = profile.role === 'Course Provider'
        ? [
            { label: 'Courses Published', value: '4', change: '+1 this month', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
            { label: 'Total Enrolled Students', value: '1,420', change: '+124 this week', icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Average Course Rating', value: '4.8', change: '420 reviews', icon: Award, color: '#E11D48', bg: '#FFF1F2' },
        ]
        : profile.role === 'Academic Manager'
            ? [
                { label: 'Managed Courses', value: '48', change: 'All active', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
                { label: 'Active Providers', value: '14', change: '+2 new providers', icon: Briefcase, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Pending Reviews', value: '3', change: 'Requires action', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
            ]
            : [
                { label: 'Courses Completed', value: '12', change: '+2 this month', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
                { label: 'Paths Completed', value: '2', change: '1 in progress', icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Learning Hours', value: '148', change: '+12 this week', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
            ];

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div className="text-[#111827] mb-0.5" style={{ fontWeight: 800, fontSize: '28px', lineHeight: 1 }}>{value}</div>
                    <div className="text-[#9CA3AF] text-xs">{label}</div>
                    <div className="text-[#6B7280] text-[11px] mt-1" style={{ fontWeight: 500 }}>{change}</div>
                </div>
            ))}
        </div>
    );
}

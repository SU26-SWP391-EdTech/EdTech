import { Play, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
    fullName?: string;
    onViewScheduleClick?: () => void;
}

export default function DashboardHeader({
    fullName = 'Learner',
    onViewScheduleClick
}: DashboardHeaderProps) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h1 className="text-[34px] text-[#111827] mb-5" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                    Welcome back, {fullName} 👋
                </h1>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onViewScheduleClick}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F8FAFC] transition-colors" 
                        style={{ fontWeight: 500 }}
                    >
                        <Calendar className="w-4 h-4 text-[#6B7280]" />
                        View Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

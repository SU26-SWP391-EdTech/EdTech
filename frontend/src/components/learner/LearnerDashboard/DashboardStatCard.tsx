import { ChevronUp } from 'lucide-react';
import Sparkline from './Sparkline';

interface DashboardStatCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    sparkData: number[];
}

export default function DashboardStatCard({
    label,
    value,
    sub,
    icon,
    color,
    bg,
    sparkData
}: DashboardStatCardProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-[#9CA3AF] mb-1" style={{ fontWeight: 500 }}>{label}</p>
                    <p className="text-[28px] text-[#111827]" style={{ fontWeight: 700, lineHeight: 1 }}>{value}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>
                    {icon}
                </div>
            </div>
            <div className="flex items-end justify-between gap-3">
                <div className="flex items-center gap-1 text-xs" style={{ color: '#10B981', fontWeight: 500 }}>
                    <ChevronUp className="w-3 h-3" />
                    <span>{sub}</span>
                </div>
                <Sparkline data={sparkData} color={color} />
            </div>
        </div>
    );
}

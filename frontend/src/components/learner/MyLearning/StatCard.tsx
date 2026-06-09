import { TrendingUp } from 'lucide-react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    delta: string;
    color: string;
    tint: string;
}

export default function StatCard({ icon, label, value, delta, color, tint }: StatCardProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: tint, color }}>
                    {icon}
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color, fontWeight: 600 }}>
                    <TrendingUp className="w-3 h-3" />
                    {delta}
                </div>
            </div>
            <div className="text-[28px] text-[#111827]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
            <div className="text-xs text-[#6B7280] mt-1">{label}</div>
        </div>
    );
}

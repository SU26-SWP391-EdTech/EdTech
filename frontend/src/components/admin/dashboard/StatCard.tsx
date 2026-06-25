import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
    up?: boolean;
    sub: string;
    sparkData: { v: number }[];
}

export function StatCard({ icon, label, value, change, up, sub, sparkData }: StatCardProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
                <div className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                    {icon}
                </div>
                {change && up !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${up ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`} style={{ fontWeight: 500 }}>
                        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[#111827]" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.1 }}>{value}</p>
                <p className="text-[#6B7280] text-sm mt-0.5">{label}</p>
            </div>
            <div style={{ height: 40, width: '100%' }}>
                <ResponsiveContainer width="100%" height={40}>
                    <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id={`spark-${label.replace(/\W+/g, '-').toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={up ? '#16A34A' : '#DC2626'} stopOpacity={0.15} />
                                <stop offset="100%" stopColor={up ? '#16A34A' : '#DC2626'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={up ? '#16A34A' : '#DC2626'} strokeWidth={1.5} fill={`url(#spark-${label.replace(/\W+/g, '-').toLowerCase()})`} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#9CA3AF]">{sub}</p>
        </div>
    );
}

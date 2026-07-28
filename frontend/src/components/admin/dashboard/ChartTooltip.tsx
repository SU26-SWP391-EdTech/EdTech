interface ChartTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5 shadow-lg">
            <p className="text-xs text-[#6B7280] mb-1.5" style={{ fontWeight: 500 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={`${p.name ?? 'entry'}-${i}`} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[#6B7280]">{p.name}:</span>
                    <span className="text-[#111827]" style={{ fontWeight: 600 }}>{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

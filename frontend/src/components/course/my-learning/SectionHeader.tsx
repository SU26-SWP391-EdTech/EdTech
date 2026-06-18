interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div>
                <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>}
            </div>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#F8FAFC]"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

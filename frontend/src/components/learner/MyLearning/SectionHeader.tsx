import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    actionLabel: string;
    onAction?: () => void;
}

export default function SectionHeader({
    title,
    subtitle,
    actionLabel,
    onAction
}: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between mb-4">
            <div>
                <h2 className="text-[18px] text-[#111827]" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {title}
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>
            </div>
            <button
                onClick={onAction}
                className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors"
                style={{ fontWeight: 500 }}
            >
                {actionLabel}
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

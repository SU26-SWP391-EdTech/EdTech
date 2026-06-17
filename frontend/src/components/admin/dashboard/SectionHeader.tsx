import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    action?: () => void;
    actionLabel?: string;
}

export function SectionHeader({ title, action, actionLabel }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#111827]" style={{ fontSize: '15px', fontWeight: 600 }}>{title}</h3>
            {actionLabel && (
                <button onClick={action} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#E11D48] transition-colors" style={{ fontWeight: 500 }}>
                    {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

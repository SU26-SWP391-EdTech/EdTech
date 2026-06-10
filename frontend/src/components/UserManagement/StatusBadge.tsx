import { Check, AlertCircle } from 'lucide-react';
import type { Status } from './types';

const statusConfig: Record<Status, { icon: React.ReactNode; cls: string }> = {
  'Active': { icon: <Check className="w-2.5 h-2.5" />, cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  'Inactive': { icon: <AlertCircle className="w-2.5 h-2.5" />, cls: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]' },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cfg.cls}`} style={{ fontWeight: 500 }}>
      {cfg.icon}{status}
    </span>
  );
}

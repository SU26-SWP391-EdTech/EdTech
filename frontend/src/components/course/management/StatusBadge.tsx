import { Check, FileText, AlertCircle, Ban } from 'lucide-react';
import type { CourseStatus } from '../../../types/course/course-management.types';

const statusCfg: Record<CourseStatus, { cls: string; dot: string; icon: React.ReactNode }> = {
  'Published': { cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', dot: '#16A34A', icon: <Check className="w-2.5 h-2.5" /> },
  'Draft': { cls: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]', dot: '#9CA3AF', icon: <FileText className="w-2.5 h-2.5" /> },
  'Pending Review': { cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]', dot: '#D97706', icon: <AlertCircle className="w-2.5 h-2.5" /> },
  'Rejected': { cls: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]', dot: '#DC2626', icon: <Ban className="w-2.5 h-2.5" /> },
};

export function StatusBadge({ status }: { status: CourseStatus }) {
  const cfg = statusCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cfg.cls}`} style={{ fontWeight: 500 }}>
      {cfg.icon}{status}
    </span>
  );
}

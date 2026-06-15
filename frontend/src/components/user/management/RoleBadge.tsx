import { Shield, GraduationCap, Building2, BookOpen } from 'lucide-react';
import type { Role } from '../../../types/user/user-management.types';

const roleConfig: Record<Role, { label: string; icon: React.ReactNode; cls: string }> = {
  'Admin': { label: 'Admin', icon: <Shield className="w-3 h-3" />, cls: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
  'Learner': { label: 'Learner', icon: <GraduationCap className="w-3 h-3" />, cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' },
  'Academic Manager': { label: 'Academic Manager', icon: <Building2 className="w-3 h-3" />, cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  'Course Provider': { label: 'Course Provider', icon: <BookOpen className="w-3 h-3" />, cls: 'bg-[#F0FDFA] text-[#0891B2] border-[#A5F3FC]' },
};

export function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${cfg.cls}`} style={{ fontWeight: 500 }}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

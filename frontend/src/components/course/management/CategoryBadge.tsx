import { Monitor, Database, Palette, Megaphone, Briefcase, Settings } from 'lucide-react';
import type { Category } from '../../../types/course/course-management.types';

const categoryCfg: Record<Category, { cls: string; icon: React.ReactNode }> = {
  'Web Development': { cls: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]', icon: <Monitor className="w-3 h-3" /> },
  'Data Science': { cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]', icon: <Database className="w-3 h-3" /> },
  'Design': { cls: 'bg-[#FFF1F3] text-[#E11D48] border-[#FECDD3]', icon: <Palette className="w-3 h-3" /> },
  'Marketing': { cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]', icon: <Megaphone className="w-3 h-3" /> },
  'Business': { cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', icon: <Briefcase className="w-3 h-3" /> },
  'DevOps': { cls: 'bg-[#F0F9FF] text-[#0891B2] border-[#BAE6FD]', icon: <Settings className="w-3 h-3" /> },
};

export function CategoryBadge({ category }: { category: Category }) {
  const cfg = categoryCfg[category];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border ${cfg.cls}`} style={{ fontWeight: 500 }}>
      {cfg.icon}{category}
    </span>
  );
}

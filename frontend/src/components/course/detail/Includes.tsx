import React from 'react';

interface IncludesProps {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
}

export function Includes({ Icon, label, highlight }: IncludesProps) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-[#E11D48]' : 'text-[#6B7280]'}`} />
      <span className={highlight ? 'text-[#111827]' : 'text-[#374151]'} style={{ fontWeight: highlight ? 600 : 400 }}>{label}</span>
    </div>
  );
}

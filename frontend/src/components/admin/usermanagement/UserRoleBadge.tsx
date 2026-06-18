import React from 'react';
import { Shield, Building2, BookOpen, GraduationCap } from 'lucide-react';

export type RoleName = 'Admin' | 'Academic Manager' | 'Course Provider' | 'Learner';

export const ROLE_CFG: Record<RoleName, { bg: string; color: string; icon: React.ReactNode }> = {
  Admin: { bg: '#FFF1F3', color: '#E11D48', icon: <Shield size={13} /> },
  "Academic Manager": { bg: '#F0FDF4', color: '#16A34A', icon: <Building2 size={13} /> },
  'Course Provider': { bg: '#F5F3FF', color: '#7C3AED', icon: <BookOpen size={13} /> },
  Learner: { bg: '#EFF6FF', color: '#2563EB', icon: <GraduationCap size={13} /> },
};

interface UserRoleBadgeProps {
  role: RoleName;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const c = ROLE_CFG[role];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: 20,
        background: c.bg,
        color: c.color,
      }}
    >
      {c.icon} {role}
    </span>
  );
}

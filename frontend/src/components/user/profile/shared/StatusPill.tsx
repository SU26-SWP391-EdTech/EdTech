import type { CourseStatus } from '../../../types/user/user-profile.types';

export function StatusPill({ status }: { status: CourseStatus }) {
    const cfg: Record<CourseStatus, { bg: string; color: string; dot: string }> = {
        Completed: { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
        'In Progress': { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
        'Not Started': { bg: '#F3F4F6', color: '#4B5563', dot: '#9CA3AF' },
    };
    const s = cfg[status];
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
            style={{ backgroundColor: s.bg, color: s.color, fontWeight: 500 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
            {status}
        </span>
    );
}

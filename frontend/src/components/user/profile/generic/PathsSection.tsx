import type { ProfileData } from '../../../types/user/user-profile.types';

const COMPLETED_PATHS = [
    {
        title: 'Frontend Developer Path', pct: 100, date: 'Mar 20, 2026',
        skills: ['React', 'TypeScript', 'CSS', 'Webpack'], color: '#E11D48', bg: 'from-[#E11D48] to-[#7C3AED]',
    },
    {
        title: 'Data Analytics Foundation', pct: 100, date: 'May 15, 2026',
        skills: ['SQL', 'Python', 'Tableau', 'Statistics'], color: '#6366F1', bg: 'from-[#6366F1] to-[#0EA5E9]',
    },
    {
        title: 'Java Backend Roadmap', pct: 72, date: 'In progress',
        skills: ['Java', 'Spring Boot', 'Docker', 'REST APIs'], color: '#F59E0B', bg: 'from-[#F59E0B] to-[#EF4444]',
    },
];

interface PathsSectionProps {
    profile: ProfileData;
}

export function PathsSection({ profile }: PathsSectionProps) {
    const paths = profile.role === 'Course Provider'
        ? [
            { title: 'Frontend Developer Path', count: '3 courses', date: 'Active', skills: ['React', 'TypeScript', 'CSS'], color: '#E11D48', bg: 'from-[#E11D48] to-[#7C3AED]' },
            { title: 'Java Backend Roadmap', count: '1 course', date: 'Active', skills: ['Java', 'Spring Boot', 'REST APIs'], color: '#F59E0B', bg: 'from-[#F59E0B] to-[#EF4444]' }
        ]
        : profile.role === 'Academic Manager'
            ? [
                { title: 'Computer Science Curriculum', count: '15 courses', date: 'Managed', skills: ['Algorithms', 'Databases', 'OS'], color: '#6366F1', bg: 'from-[#6366F1] to-[#0EA5E9]' },
                { title: 'Business Analyst Path', count: '8 courses', date: 'Managed', skills: ['Requirements', 'Agile', 'SQL'], color: '#10B981', bg: 'from-[#10B981] to-[#059669]' }
            ]
            : COMPLETED_PATHS.map(p => ({ ...p, count: undefined }));

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <p className="text-[#111827] text-sm mb-4" style={{ fontWeight: 600 }}>
                {profile.role === 'Course Provider'
                    ? 'Teaching Paths'
                    : profile.role === 'Academic Manager'
                        ? 'Managed Learning Paths'
                        : 'Learning Paths'
                }
            </p>
            <div className="space-y-3">
                {paths.map(p => (
                    <div key={p.title} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                        {/* Mini banner */}
                        <div className={`h-10 bg-gradient-to-r ${p.bg || 'from-slate-500 to-slate-700'} relative`}>
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                        </div>
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>{p.title}</p>
                                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#065F46] text-[11px] rounded-full" style={{ fontWeight: 500 }}>
                                    {p.count ? p.date : (p.pct === 100 ? 'Completed' : 'In Progress')}
                                </span>
                            </div>
                            {p.pct !== undefined && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.pct === 100 ? '#10B981' : p.color }} />
                                    </div>
                                    <span className="text-[11px] text-[#6B7280]" style={{ fontWeight: 500 }}>{p.pct}%</span>
                                </div>
                            )}
                            {p.count && (
                                <p className="text-xs text-[#475569] mb-2 font-medium">{p.count}</p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                    {p.skills.slice(0, 3).map((s: string) => (
                                        <span key={s} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-[10px] rounded-full">{s}</span>
                                    ))}
                                    {p.skills.length > 3 && <span className="text-[#9CA3AF] text-[10px]">+{p.skills.length - 3}</span>}
                                </div>
                                <p className="text-[#9CA3AF] text-[11px]">{p.count ? '' : p.date}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

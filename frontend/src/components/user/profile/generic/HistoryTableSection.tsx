import { Download, Edit3, GraduationCap, Check, ExternalLink, Award, Bookmark } from 'lucide-react';
import { StatusPill } from '../shared/StatusPill';
import type { ProfileData, CourseHistoryItem } from '../../../types/user/user-profile.types';

const COURSE_HISTORY: CourseHistoryItem[] = [
    { name: 'React Fundamentals', provider: 'FPT University', status: 'In Progress', pct: 68, date: '—' },
    { name: 'UI/UX Design Basics', provider: 'Coursera', status: 'Completed', pct: 100, date: 'Apr 2, 2026' },
    { name: 'Data Analytics Foundation', provider: 'FPT University', status: 'Completed', pct: 100, date: 'May 15, 2026' },
    { name: 'Java Spring Boot', provider: 'Udemy', status: 'In Progress', pct: 45, date: '—' },
    { name: 'SQL Mastery', provider: 'DataCamp', status: 'Not Started', pct: 0, date: '—' },
];

interface HistoryTableSectionProps {
    profile: ProfileData;
}

export function HistoryTableSection({ profile }: HistoryTableSectionProps) {
    if (profile.role === 'Course Provider') {
        const providerCourses = [
            { name: 'React Advanced Frameworks', category: 'Software Development', students: '450 students', rating: '4.9 ⭐', status: 'Active' },
            { name: 'Spring Boot Microservices', category: 'Backend Development', students: '680 students', rating: '4.8 ⭐', status: 'Active' },
            { name: 'UI/UX Basics & Design System', category: 'Design', students: '290 students', rating: '4.7 ⭐', status: 'Active' },
            { name: 'Introduction to Python', category: 'Data Science', students: '0 students', rating: '0.0 ⭐', status: 'Draft' },
        ];
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
                    <div>
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Published Courses</p>
                        <p className="text-[#9CA3AF] text-xs mt-0.5">All courses authored by you</p>
                    </div>
                    <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                        <Download className="w-3.5 h-3.5" />Export
                    </button>
                </div>
                <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                    {['Course', 'Category', 'Enrolled Students', 'Rating', 'Status', 'Actions'].map(h => (
                        <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
                    ))}
                </div>
                {providerCourses.map((c) => (
                    <div key={c.name}
                        className="grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group"
                        style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
                        <p className="text-[#6B7280] text-sm">{c.category}</p>
                        <p className="text-[#6B7280] text-sm">{c.students}</p>
                        <p className="text-[#6B7280] text-sm">{c.rating}</p>
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.status === 'Active' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#F3F4F6] text-[#4B5563]'}`} style={{ fontWeight: 500 }}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`} />
                                {c.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Edit Course">
                                <Edit3 className="w-3.5 h-3.5 text-[#E11D48]" />
                            </button>
                            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Students">
                                <GraduationCap className="w-3.5 h-3.5 text-[#6B7280]" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (profile.role === 'Academic Manager') {
        const managerCourses = [
            { name: 'React Advanced Frameworks', provider: 'FPT University', category: 'Software Development', enrolled: '450 enrolled', status: 'Approved' },
            { name: 'Spring Boot Microservices', provider: 'Coursera', category: 'Backend Development', enrolled: '680 enrolled', status: 'Approved' },
            { name: 'Advanced Machine Learning', provider: 'Udemy', category: 'Data Science', enrolled: '120 enrolled', status: 'Pending Review' },
            { name: 'Introduction to Python', provider: 'DataCamp', category: 'Data Science', enrolled: '310 enrolled', status: 'Approved' },
        ];
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
                    <div>
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Curriculum Courses Overview</p>
                        <p className="text-[#9CA3AF] text-xs mt-0.5">List of active courses under your review and management</p>
                    </div>
                    <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                        <Download className="w-3.5 h-3.5" />Export
                    </button>
                </div>
                <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                    {['Course', 'Provider', 'Category', 'Enrolled', 'Approval Status', 'Actions'].map(h => (
                        <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
                    ))}
                </div>
                {managerCourses.map((c) => (
                    <div key={c.name}
                        className="grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group"
                        style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
                        <p className="text-[#6B7280] text-sm">{c.provider}</p>
                        <p className="text-[#6B7280] text-sm">{c.category}</p>
                        <p className="text-[#6B7280] text-sm">{c.enrolled}</p>
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.status === 'Approved' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FFFBEB] text-[#92400E]'}`} style={{ fontWeight: 500 }}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Approved' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
                                {c.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Review Curriculum">
                                <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                            </button>
                            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Course Details">
                                <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
                <div>
                    <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Course History</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">All enrolled and completed courses</p>
                </div>
                <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                    <Download className="w-3.5 h-3.5" />Export
                </button>
            </div>
            <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
                {['Course', 'Provider', 'Status', 'Progress', 'Completed', 'Actions'].map(h => (
                    <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
                ))}
            </div>
            {COURSE_HISTORY.map((c) => (
                <div key={c.name}
                    className="grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group"
                    style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
                    <div>
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
                    </div>
                    <p className="text-[#6B7280] text-sm">{c.provider}</p>
                    <div><StatusPill status={c.status} /></div>
                    <div className="flex items-center gap-2 pr-4">
                        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                                width: `${c.pct}%`,
                                backgroundColor: c.pct === 100 ? '#10B981' : c.pct > 0 ? '#E11D48' : '#E5E7EB'
                            }} />
                        </div>
                        <span className="text-[11px] text-[#6B7280] w-8 flex-shrink-0" style={{ fontWeight: 500 }}>{c.pct}%</span>
                    </div>
                    <p className="text-[#6B7280] text-sm">{c.date}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status === 'Completed' && (
                            <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Certificate">
                                <Award className="w-3.5 h-3.5 text-[#E11D48]" />
                            </button>
                        )}
                        <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Course">
                            <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                        </button>
                        <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Bookmark">
                            <Bookmark className="w-3.5 h-3.5 text-[#6B7280]" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

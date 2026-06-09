import { useState } from 'react';
import { ArrowLeft, BarChart3, ChevronDown } from 'lucide-react';
import CourseCard from './CourseCard';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';

type Tab = 'all' | 'in-progress' | 'completed' | 'saved' | 'archived';

interface AllCoursesViewProps {
    sortedEnrollments: Enrollment[];
    tab: Tab;
    setTab: (t: Tab) => void;
    sortBy: 'recent' | 'progress-high' | 'progress-low';
    setSortBy: (sort: 'recent' | 'progress-high' | 'progress-low') => void;
    timeAgo: (dateString?: string | null) => string;
    getCourseGradient: (index: number) => string;
    onBack: () => void;
    onCtaClick: (enrollmentId: number) => void;
}

function FilterChip({ label }: { label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:text-[#111827] transition-colors" style={{ fontWeight: 500 }}>
            {label}
            <ChevronDown className="w-3.5 h-3.5" />
        </button>
    );
}

export default function AllCoursesView({
    sortedEnrollments,
    tab,
    setTab,
    sortBy,
    setSortBy,
    timeAgo,
    getCourseGradient,
    onBack,
    onCtaClick
}: AllCoursesViewProps) {
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors"
                style={{ fontWeight: 500 }}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div>
                <h1 className="text-[32px] text-[#111827] mb-1.5 font-bold" style={{ letterSpacing: '-0.02em' }}>
                    My Enrolled Courses
                </h1>
                <p className="text-[#6B7280] text-[15px]">
                    All individual courses you have enrolled in.
                </p>
            </div>

            {/* Tabs + Filters */}
            <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-1 p-1 bg-white border border-[#E5E7EB] rounded-lg">
                    {([
                        { id: 'all', label: 'All' },
                        { id: 'in-progress', label: 'In Progress' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'saved', label: 'Saved' },
                        { id: 'archived', label: 'Archived' },
                    ] as { id: Tab; label: string }[]).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-3.5 py-1.5 text-sm rounded-md transition-colors ${tab === t.id
                                ? 'bg-[#111827] text-white'
                                : 'text-[#6B7280] hover:text-[#111827]'
                                }`}
                            style={{ fontWeight: 500 }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <FilterChip label="Category" />
                    <FilterChip label="Difficulty" />
                    <FilterChip label="Last accessed" />
                    <div className="relative">
                        <button
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'progress-high' ? 'Highest Progress' : 'Lowest Progress'}
                            <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-20">
                                <button
                                    onClick={() => { setSortBy('recent'); setIsSortDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-[#F8FAFC] transition-colors ${sortBy === 'recent' ? 'text-[#E11D48] font-semibold' : 'text-[#4B5563]'}`}
                                >
                                    Last Accessed (Recent)
                                </button>
                                <button
                                    onClick={() => { setSortBy('progress-high'); setIsSortDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-[#F8FAFC] transition-colors ${sortBy === 'progress-high' ? 'text-[#E11D48] font-semibold' : 'text-[#4B5563]'}`}
                                >
                                    Highest Progress
                                </button>
                                <button
                                    onClick={() => { setSortBy('progress-low'); setIsSortDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-[#F8FAFC] transition-colors ${sortBy === 'progress-low' ? 'text-[#E11D48] font-semibold' : 'text-[#4B5563]'}`}
                                >
                                    Lowest Progress
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                {sortedEnrollments.length > 0 ? (
                    sortedEnrollments.map((enrollment, index) => {
                        const total = enrollment.course.totalLessons;
                        const done = Math.round(total * (enrollment.progress / 100));
                        const status = enrollment.status === 'completed' || enrollment.progress === 100
                            ? 'completed'
                            : (enrollment.status === 'active' ? 'in-progress' : 'archived');

                        return (
                            <CourseCard
                                key={enrollment.enrollmentId}
                                title={enrollment.course.title}
                                provider={enrollment.course.user?.fullName || 'Senior Instructor'}
                                category={enrollment.course.language || 'Programming'}
                                duration={`${enrollment.course.duration}h`}
                                done={done}
                                total={total}
                                progress={enrollment.progress}
                                lastAccessed={timeAgo(enrollment.lastAccessedAt)}
                                status={status}
                                thumb={getCourseGradient(index)}
                                onCtaClick={() => onCtaClick(enrollment.enrollmentId)}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-2 text-center py-12 bg-white border border-[#E5E7EB] rounded-2xl">
                        <p className="text-sm text-[#6B7280]">No courses found for this tab.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

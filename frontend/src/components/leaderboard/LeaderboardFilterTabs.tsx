import { Trophy, Globe, ChevronDown, Filter } from 'lucide-react';
import type { LeaderboardTab, CourseRankInfo, EnrollFilter } from '../../types/leaderboard/leaderboard.types';

interface LeaderboardFilterTabsProps {
    tab: LeaderboardTab;
    setTab: (t: LeaderboardTab) => void;
    selectedCourse: {
        courseId: number;
        title: string;
        enrolledCount: number;
        yourRank: number;
        isEnrolled: boolean;
    };
    selectedCourseId: number;
    setSelectedCourseId: (id: number) => void;
    showCourseDropdown: boolean;
    setShowCourseDropdown: (b: boolean) => void;
    enrollFilter: EnrollFilter;
    setEnrollFilter: (f: EnrollFilter) => void;
    courses: CourseRankInfo[];
    filteredCoursesDropdown: CourseRankInfo[];
    currentUserCourseEntry: any;
    currentUserOverallEntry: any;
}

export function LeaderboardFilterTabs({
    tab,
    setTab,
    selectedCourse,
    selectedCourseId,
    setSelectedCourseId,
    showCourseDropdown,
    setShowCourseDropdown,
    enrollFilter,
    setEnrollFilter,
    courses,
    filteredCoursesDropdown,
    currentUserCourseEntry,
    currentUserOverallEntry,
}: LeaderboardFilterTabsProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 3, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 4 }}>
                <button
                    onClick={() => setTab('course')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === 'course' ? '#E11D48' : 'transparent', color: tab === 'course' ? '#fff' : '#6B7280' }}
                >
                    <Trophy size={13} /> By Course
                </button>
                <button
                    onClick={() => setTab('overall')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === 'overall' ? '#E11D48' : 'transparent', color: tab === 'overall' ? '#fff' : '#6B7280' }}
                >
                    <Globe size={13} /> Overall
                </button>
            </div>

            {/* Course & Enrollment filters — only shown in "By Course" tab */}
            {tab === 'course' && (
                <>
                    {/* Enrollment state filters */}
                    <div style={{ display: 'flex', gap: 2, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: 2 }}>
                        {[
                            { value: 'all', label: 'All Courses' },
                            { value: 'enrolled', label: 'Enrolled' },
                            { value: 'not_enrolled', label: 'Not Enrolled' }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setEnrollFilter(opt.value as EnrollFilter)}
                                style={{
                                    padding: '5px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    background: enrollFilter === opt.value ? '#fff' : 'transparent',
                                    color: enrollFilter === opt.value ? '#1E293B' : '#64748B',
                                    boxShadow: enrollFilter === opt.value ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Course dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151', minWidth: 220 }}
                        >
                            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCourse.title}</span>
                            <ChevronDown size={14} style={{ color: '#9CA3AF', transform: showCourseDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                        </button>
                        {showCourseDropdown && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 50, minWidth: 260, padding: 4 }}>
                                {filteredCoursesDropdown.length === 0 ? (
                                    <p style={{ padding: '10px 12px', fontSize: 12.5, color: '#94A3B8', margin: 0 }}>No courses match filter.</p>
                                ) : (
                                    filteredCoursesDropdown.map(c => (
                                        <button
                                            key={c.courseId}
                                            onClick={() => { setSelectedCourseId(c.courseId); setShowCourseDropdown(false); }}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: 'none', background: selectedCourseId === c.courseId ? '#FFF1F3' : 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: selectedCourseId === c.courseId ? 600 : 400, color: selectedCourseId === c.courseId ? '#E11D48' : '#374151', textAlign: 'left' }}
                                        >
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{c.title}</span>
                                            <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
                                                {c.isEnrolled ? (c.yourRank > 0 ? `#${c.yourRank}` : 'Enrolled') : 'Not Enrolled'}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Context info */}
            {tab === 'course' && currentUserCourseEntry && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>Your rank in this course:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E11D48' }}>#{currentUserCourseEntry.rank}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>of {selectedCourse.enrolledCount}</span>
                </div>
            )}
            {tab === 'overall' && currentUserOverallEntry && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>Your overall rank:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E11D48' }}>#{currentUserOverallEntry.rank}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>of {courses.length}+</span>
                </div>
            )}
        </div>
    );
}

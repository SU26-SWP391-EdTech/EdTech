import { useState } from 'react';
import { Trophy, Swords, Medal, Crown, Search, TrendingUp, Clock, Target, Zap, ChevronDown, Globe } from 'lucide-react';

// Leaderboard — two views:
// 1. "By Course" — rankings within a specific course
// 2. "Overall"   — combined rankings across all courses

interface LeaderboardEntry {
    rank: number;
    userId: number;
    fullName: string;
    initials: string;
    isCurrentUser: boolean;
    score: number;
    time: number;
    attempt: number;
    pvp: number;
    total: number;
}

interface Course {
    courseId: number;
    title: string;
    enrolledCount: number;
    yourRank: number;
}

// Available courses for the dropdown
const COURSES: Course[] = [
    { courseId: 1, title: 'Java Basic', enrolledCount: 120, yourRank: 3 },
    { courseId: 2, title: 'Spring Boot REST API', enrolledCount: 87, yourRank: 7 },
    { courseId: 3, title: 'Data Structures', enrolledCount: 64, yourRank: 12 },
    { courseId: 4, title: 'React & TypeScript', enrolledCount: 142, yourRank: 5 },
];

// Per-course leaderboard data
const COURSE_DATA: Record<number, LeaderboardEntry[]> = {
    1: [
        { rank: 1, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 85, time: 10, attempt: 5, pvp: 20, total: 120 },
        { rank: 2, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 80, time: 8, attempt: 4, pvp: 10, total: 102 },
        { rank: 3, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 78, time: 6, attempt: 5, pvp: 0, total: 89 },
        { rank: 4, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 75, time: 12, attempt: 3, pvp: 5, total: 83 },
        { rank: 5, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 72, time: 9, attempt: 6, pvp: 0, total: 72 },
        { rank: 6, userId: 5, fullName: 'Hoàng Thị Mai', initials: 'HM', isCurrentUser: false, score: 70, time: 15, attempt: 4, pvp: 0, total: 67 },
        { rank: 7, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 68, time: 11, attempt: 5, pvp: 0, total: 63 },
        { rank: 8, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 65, time: 14, attempt: 3, pvp: 0, total: 60 },
    ],
    2: [
        { rank: 1, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 92, time: 7, attempt: 3, pvp: 15, total: 134 },
        { rank: 2, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 88, time: 9, attempt: 4, pvp: 10, total: 118 },
        { rank: 3, userId: 5, fullName: 'Hoàng Thị Mai', initials: 'HM', isCurrentUser: false, score: 84, time: 11, attempt: 3, pvp: 5, total: 104 },
        { rank: 4, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 81, time: 13, attempt: 5, pvp: 0, total: 95 },
        { rank: 5, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 79, time: 10, attempt: 4, pvp: 0, total: 88 },
        { rank: 6, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 76, time: 16, attempt: 3, pvp: 0, total: 79 },
        { rank: 7, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 74, time: 8, attempt: 5, pvp: 0, total: 74 },
        { rank: 8, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 70, time: 18, attempt: 2, pvp: 0, total: 68 },
    ],
    3: [
        { rank: 1, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 96, time: 5, attempt: 2, pvp: 20, total: 141 },
        { rank: 2, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 91, time: 8, attempt: 3, pvp: 10, total: 120 },
        { rank: 3, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 87, time: 10, attempt: 4, pvp: 5, total: 107 },
        { rank: 4, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 83, time: 12, attempt: 5, pvp: 0, total: 96 },
        { rank: 5, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 80, time: 14, attempt: 3, pvp: 0, total: 88 },
        { rank: 12, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 65, time: 20, attempt: 4, pvp: 0, total: 60 },
    ],
    4: [
        { rank: 1, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 94, time: 6, attempt: 2, pvp: 25, total: 149 },
        { rank: 2, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 90, time: 9, attempt: 3, pvp: 15, total: 130 },
        { rank: 3, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 86, time: 11, attempt: 4, pvp: 5, total: 112 },
        { rank: 4, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 82, time: 13, attempt: 5, pvp: 0, total: 95 },
        { rank: 5, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 80, time: 10, attempt: 3, pvp: 0, total: 90 },
        { rank: 6, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 77, time: 15, attempt: 4, pvp: 0, total: 82 },
    ],
};

// Overall leaderboard — sum of points across all courses
const OVERALL: (LeaderboardEntry & { coursesCompleted: number })[] = [
    { rank: 1, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 338, time: 41, attempt: 17, pvp: 45, total: 435, coursesCompleted: 4 },
    { rank: 2, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 325, time: 42, attempt: 16, pvp: 25, total: 411, coursesCompleted: 4 },
    { rank: 3, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 312, time: 37, attempt: 14, pvp: 15, total: 390, coursesCompleted: 3 },
    { rank: 4, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 301, time: 44, attempt: 14, pvp: 10, total: 371, coursesCompleted: 4 },
    { rank: 5, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 297, time: 34, attempt: 17, pvp: 0, total: 342, coursesCompleted: 4 },
    { rank: 6, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 280, time: 43, attempt: 14, pvp: 20, total: 338, coursesCompleted: 3 },
    { rank: 7, userId: 5, fullName: 'Hoàng Thị Mai', initials: 'HM', isCurrentUser: false, score: 272, time: 44, attempt: 12, pvp: 5, total: 320, coursesCompleted: 3 },
    { rank: 8, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 263, time: 58, attempt: 13, pvp: 0, total: 284, coursesCompleted: 4 },
];

const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={13} color="#fff" /></div>;
    if (rank === 2) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#9CA3AF,#6B7280)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Medal size={13} color="#fff" /></div>;
    if (rank === 3) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#D97706,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Medal size={13} color="#fff" /></div>;
    return <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>{rank}</span>;
};

export function LeaderboardPage() {
    const [tab, setTab] = useState<'course' | 'overall'>('course');
    const [selectedCourseId, setSelectedCourseId] = useState(1);
    const [search, setSearch] = useState('');
    const [challengeModal, setChallengeModal] = useState<LeaderboardEntry | null>(null);
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);

    const selectedCourse = COURSES.find(c => c.courseId === selectedCourseId)!;
    const courseEntries = COURSE_DATA[selectedCourseId] ?? [];
    const currentUserCourse = courseEntries.find(e => e.isCurrentUser);
    const currentUserOverall = OVERALL.find(e => e.isCurrentUser);

    const filtered = (tab === 'course' ? courseEntries : OVERALL).filter(e =>
        e.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const tableCols = tab === 'course'
        ? ['#', 'Learner', 'Score', 'Time', 'Attempt', 'PvP', 'Total', 'Action']
        : ['#', 'Learner', 'Score', 'Time', 'Attempt', 'PvP', 'Courses', 'Total', 'Action'];

    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '24px 32px 48px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#F59E0B,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={17} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>Leaderboard</h1>
                        <p style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 1 }}>Rankings by score, time, attempts and PvP challenges</p>
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '7px 12px', gap: 7, width: 220 }}>
                    <Search size={13} style={{ color: '#9CA3AF' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search learner..." style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#374151', outline: 'none', width: '100%' }} />
                </div>
            </div>

            {/* Tab + Course selector row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
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

                {/* Course dropdown — only shown in "By Course" tab */}
                {tab === 'course' && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151', minWidth: 220 }}
                        >
                            <span style={{ flex: 1, textAlign: 'left' }}>{selectedCourse.title}</span>
                            <ChevronDown size={14} style={{ color: '#9CA3AF', transform: showCourseDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                        </button>
                        {showCourseDropdown && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 50, minWidth: 240, padding: 4 }}>
                                {COURSES.map(c => (
                                    <button
                                        key={c.courseId}
                                        onClick={() => { setSelectedCourseId(c.courseId); setShowCourseDropdown(false); }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: 'none', background: selectedCourseId === c.courseId ? '#FFF1F3' : 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: selectedCourseId === c.courseId ? 600 : 400, color: selectedCourseId === c.courseId ? '#E11D48' : '#374151', textAlign: 'left' }}
                                    >
                                        <span>{c.title}</span>
                                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>#{c.yourRank} of {c.enrolledCount}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Context info */}
                {tab === 'course' && currentUserCourse && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>Your rank in this course:</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#E11D48' }}>#{currentUserCourse.rank}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>of {selectedCourse.enrolledCount}</span>
                    </div>
                )}
                {tab === 'overall' && currentUserOverall && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>Your overall rank:</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#E11D48' }}>#{currentUserOverall.rank}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>of {OVERALL.length}+</span>
                    </div>
                )}
            </div>

            {/* Current user highlight bar */}
            {tab === 'course' && currentUserCourse && (
                <div style={{ background: 'linear-gradient(135deg,#FFF1F3,#fff)', border: '1px solid #FECDD3', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RankBadge rank={currentUserCourse.rank} />
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{currentUserCourse.initials}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#E11D48' }}>You — #{currentUserCourse.rank} · {selectedCourse.title}</p>
                            <p style={{ fontSize: 11, color: '#9CA3AF' }}>Total {currentUserCourse.total} pts</p>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                        {[
                            { label: 'Score', val: currentUserCourse.score, color: '#7C3AED', icon: Target },
                            { label: 'Time', val: `${currentUserCourse.time}m`, color: '#2563EB', icon: Clock },
                            { label: 'Attempt', val: currentUserCourse.attempt, color: '#D97706', icon: TrendingUp },
                            { label: 'PvP', val: currentUserCourse.pvp, color: '#059669', icon: Swords },
                            { label: 'Total', val: currentUserCourse.total, color: '#E11D48', icon: Zap },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</p>
                                <p style={{ fontSize: 10.5, color: '#9CA3AF' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'overall' && currentUserOverall && (
                <div style={{ background: 'linear-gradient(135deg,#FFF1F3,#fff)', border: '1px solid #FECDD3', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RankBadge rank={currentUserOverall.rank} />
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>JD</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#E11D48' }}>You — #{currentUserOverall.rank} Overall</p>
                            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{currentUserOverall.coursesCompleted} courses · {currentUserOverall.total} total pts</p>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                        {[
                            { label: 'Score', val: currentUserOverall.score, color: '#7C3AED' },
                            { label: 'Attempt', val: currentUserOverall.attempt, color: '#D97706' },
                            { label: 'PvP', val: currentUserOverall.pvp, color: '#059669' },
                            { label: 'Courses', val: currentUserOverall.coursesCompleted, color: '#2563EB' },
                            { label: 'Total', val: currentUserOverall.total, color: '#E11D48' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</p>
                                <p style={{ fontSize: 10.5, color: '#9CA3AF' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            {tableCols.map(h => (
                                <th key={h} style={{ padding: '11px 16px', textAlign: h === '#' ? 'center' : 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={tableCols.length} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>No learners found.</td></tr>
                        ) : filtered.map((entry, i) => {
                            const isMe = entry.isCurrentUser;
                            const overall = entry as typeof OVERALL[0];
                            return (
                                <tr
                                    key={entry.userId}
                                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none', background: isMe ? '#FFF5F5' : entry.rank <= 3 ? '#FFFBF0' : 'transparent' }}
                                    onMouseEnter={e => { if (!isMe && entry.rank > 3) e.currentTarget.style.background = '#FAFAFA'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isMe ? '#FFF5F5' : entry.rank <= 3 ? '#FFFBF0' : ''; }}
                                >
                                    <td style={{ padding: '13px 16px', textAlign: 'center' }}><RankBadge rank={entry.rank} /></td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#E11D48,#9F1239)' : 'linear-gradient(135deg,#374151,#111827)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{entry.initials}</span>
                                            </div>
                                            <p style={{ fontSize: 13.5, fontWeight: isMe ? 700 : 500, color: isMe ? '#E11D48' : '#111827' }}>
                                                {entry.fullName}
                                                {isMe && <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, padding: '1px 6px', background: '#E11D48', color: '#fff', borderRadius: 20 }}>You</span>}
                                            </p>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 48, height: 4, background: '#F3F4F6', borderRadius: 4 }}>
                                                <div style={{ width: `${Math.min(100, (entry.score / (tab === 'overall' ? 4 : 1)) * (tab === 'overall' ? 0.25 : 1))}%`, height: '100%', background: '#7C3AED', borderRadius: 4 }} />
                                            </div>
                                            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#7C3AED' }}>{entry.score}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Clock size={12} style={{ color: '#9CA3AF' }} />
                                            <span style={{ fontSize: 13.5, color: '#374151' }}>{entry.time}m</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <TrendingUp size={12} style={{ color: '#9CA3AF' }} />
                                            <span style={{ fontSize: 13.5, color: '#374151' }}>{entry.attempt}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        {entry.pvp > 0
                                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Swords size={12} style={{ color: '#059669' }} /><span style={{ fontSize: 13.5, fontWeight: 600, color: '#059669' }}>{entry.pvp}</span></div>
                                            : <span style={{ fontSize: 13.5, color: '#D1D5DB' }}>—</span>}
                                    </td>

                                    {/* "Courses" column — only in overall tab */}
                                    {tab === 'overall' && (
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>{overall.coursesCompleted} / {COURSES.length}</span>
                                        </td>
                                    )}

                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#6B7280' : entry.rank === 3 ? '#D97706' : '#111827' }}>
                                            {entry.total}
                                        </span>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        {isMe ? (
                                            <span style={{ fontSize: 13, color: '#D1D5DB' }}>—</span>
                                        ) : (
                                            <button
                                                onClick={() => setChallengeModal(entry)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#FFF1F3', border: '1px solid #FECDD3', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#E11D48' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#E11D48'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#E11D48'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#FFF1F3'; e.currentTarget.style.color = '#E11D48'; e.currentTarget.style.borderColor = '#FECDD3'; }}
                                            >
                                                <Swords size={12} /> Challenge
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 12, color: '#9CA3AF' }}>
                <span><strong style={{ color: '#374151' }}>Score</strong> — avg quiz & lesson score</span>
                <span><strong style={{ color: '#374151' }}>Time</strong> — completion time (min)</span>
                <span><strong style={{ color: '#374151' }}>PvP</strong> — challenge wins · +5 pts each</span>
                {tab === 'overall' && <span><strong style={{ color: '#374151' }}>Courses</strong> — completed out of {COURSES.length}</span>}
            </div>

            {/* Challenge modal */}
            {challengeModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                            <Swords size={22} color="#fff" />
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                            Challenge {challengeModal.fullName}?
                        </h3>
                        <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                            {tab === 'course'
                                ? <>Head-to-head in <strong style={{ color: '#111827' }}>{selectedCourse.title}</strong>.</>
                                : <>Overall challenge across all courses.</>}
                        </p>
                        <div style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 10, padding: '14px 18px', marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            <div style={{ textAlign: 'center', borderRight: '1px solid #E5E7EB', paddingRight: 16 }}>
                                <p style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 4 }}>Their total</p>
                                <p style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{challengeModal.total}</p>
                            </div>
                            <div style={{ textAlign: 'center', paddingLeft: 16 }}>
                                <p style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 4 }}>Your total</p>
                                <p style={{ fontSize: 22, fontWeight: 700, color: '#E11D48' }}>
                                    {tab === 'course' ? (currentUserCourse?.total ?? 0) : (currentUserOverall?.total ?? 0)}
                                </p>
                            </div>
                        </div>
                        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>Winner earns +5 PvP points.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setChallengeModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
                            <button onClick={() => setChallengeModal(null)} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Swords size={14} /> Send Challenge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

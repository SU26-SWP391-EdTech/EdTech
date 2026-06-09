import { useEffect, useState } from 'react';
import {
    Flame, BookOpen, Clock, TrendingUp, Play, ChevronRight, Star,
    Award, CheckCircle2, Lock, Zap, Target, Bell, MessageSquare,
    BarChart2, Calendar, ArrowRight, Sparkles, Trophy, Medal,
    GraduationCap, Users, Bookmark, ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.stores';
import { getLearnerProfile } from '../../services/learner/learner.services';
import { data } from 'react-router-dom';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const STATS = [
    {
        id: 'streak',
        label: 'Day Streak',
        value: '12',
        sub: '+3 from last week',
        trend: 'up',
        icon: <Flame className="w-5 h-5" />,
        color: '#F59E0B',
        bg: '#FFF7ED',
        sparkData: [3, 5, 4, 8, 7, 10, 12],
    },
    {
        id: 'completed',
        label: 'Courses Done',
        value: '8',
        sub: '2 this month',
        trend: 'up',
        icon: <GraduationCap className="w-5 h-5" />,
        color: '#10B981',
        bg: '#F0FDF4',
        sparkData: [2, 3, 4, 5, 6, 7, 8],
    },
    {
        id: 'hours',
        label: 'Hours Learned',
        value: '124',
        sub: '18h this week',
        trend: 'up',
        icon: <Clock className="w-5 h-5" />,
        color: '#3B82F6',
        bg: '#EFF6FF',
        sparkData: [12, 18, 14, 20, 16, 22, 18],
    },
    {
        id: 'weekly',
        label: 'Weekly Goal',
        value: '74%',
        sub: '7.4 / 10 hrs',
        trend: 'up',
        icon: <Target className="w-5 h-5" />,
        color: '#E11D48',
        bg: '#FFF1F4',
        sparkData: [20, 35, 45, 55, 60, 68, 74],
    },
];

const CONTINUE_COURSES = [
    {
        id: 1,
        title: 'Advanced React Development',
        path: 'Frontend Mastery',
        progress: 52,
        lesson: 'useCallback and useMemo Deep Dive',
        remaining: 12,
        duration: '6h 10m left',
        gradient: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
        initials: 'AR',
    },
    {
        id: 2,
        title: 'Node.js & REST APIs',
        path: 'Full-Stack Engineering',
        progress: 31,
        lesson: 'Middleware & Error Handling',
        remaining: 18,
        duration: '9h 20m left',
        gradient: 'linear-gradient(135deg, #065F46 0%, #0EA5E9 100%)',
        initials: 'NR',
    },
    {
        id: 3,
        title: 'UI/UX Design Fundamentals',
        path: 'Product Design',
        progress: 78,
        lesson: 'Prototyping in Figma',
        remaining: 5,
        duration: '1h 45m left',
        gradient: 'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)',
        initials: 'UX',
    },
];

type NodeState = 'completed' | 'current' | 'upcoming' | 'locked';

interface RoadmapNode {
    id: number;
    label: string;
    state: NodeState;
    course: string;
    progress?: number;
}

const ROADMAP_NODES: RoadmapNode[] = [
    { id: 1, label: 'HTML & CSS', state: 'completed', course: 'Web Foundations', progress: 100 },
    { id: 2, label: 'JavaScript', state: 'completed', course: 'JS Essentials', progress: 100 },
    { id: 3, label: 'React', state: 'current', course: 'Advanced React Dev', progress: 52 },
    { id: 4, label: 'Node.js', state: 'upcoming', course: 'Node.js & REST APIs', progress: 31 },
    { id: 5, label: 'TypeScript', state: 'upcoming', course: 'TypeScript Mastery' },
    { id: 6, label: 'Full-Stack', state: 'locked', course: 'Full-Stack Projects' },
    { id: 7, label: 'DevOps', state: 'locked', course: 'CI/CD & Deployment' },
];

const WEEKLY_DATA = [
    { day: 'Mon', hrs: 1.5 },
    { day: 'Tue', hrs: 2.8 },
    { day: 'Wed', hrs: 1.0 },
    { day: 'Thu', hrs: 3.2 },
    { day: 'Fri', hrs: 2.5 },
    { day: 'Sat', hrs: 0.4 },
    { day: 'Sun', hrs: 0 },
];

const DEADLINES = [
    { id: 1, title: 'React Quiz #3', course: 'Advanced React', due: 'Tomorrow', urgent: true },
    { id: 2, title: 'Node.js Project', course: 'REST APIs', due: 'In 3 days', urgent: false },
    { id: 3, title: 'Design Critique', course: 'UI/UX Fundamentals', due: 'In 5 days', urgent: false },
];

const ACHIEVEMENTS = [
    { id: 1, icon: <Flame className="w-5 h-5" />, label: '10-Day Streak', xp: 150, color: 'from-[#F59E0B] to-[#EF4444]', earned: true },
    { id: 2, icon: <Trophy className="w-5 h-5" />, label: 'First Cert', xp: 500, color: 'from-[#F59E0B] to-[#D97706]', earned: true },
    { id: 3, icon: <Medal className="w-5 h-5" />, label: 'Quiz Master', xp: 200, color: 'from-[#3B82F6] to-[#7C3AED]', earned: true },
    { id: 4, icon: <Zap className="w-5 h-5" />, label: 'Speed Learner', xp: 100, color: 'from-[#10B981] to-[#3B82F6]', earned: true },
    { id: 5, icon: <Award className="w-5 h-5" />, label: 'Top Student', xp: 300, color: 'from-[#7C3AED] to-[#EC4899]', earned: false },
    { id: 6, icon: <Star className="w-5 h-5" />, label: '5-Star Review', xp: 75, color: 'from-[#6B7280] to-[#9CA3AF]', earned: false },
];

const RECOMMENDATIONS = [
    {
        id: 1,
        title: 'GraphQL API Design',
        difficulty: 'Intermediate',
        duration: '8h',
        match: 96,
        gradient: 'linear-gradient(135deg, #6D28D9 0%, #2563EB 100%)',
        initials: 'GQ',
        rating: 4.9,
        students: 3200,
    },
    {
        id: 2,
        title: 'Testing with Vitest',
        difficulty: 'Intermediate',
        duration: '5h',
        match: 91,
        gradient: 'linear-gradient(135deg, #065F46 0%, #14B8A6 100%)',
        initials: 'TW',
        rating: 4.7,
        students: 1800,
    },
    {
        id: 3,
        title: 'Docker & Containers',
        difficulty: 'Advanced',
        duration: '10h',
        match: 87,
        gradient: 'linear-gradient(135deg, #0369A1 0%, #0891B2 100%)',
        initials: 'DC',
        rating: 4.8,
        students: 4500,
    },
];

const RECENT_ACTIVITY = [
    { id: 1, type: 'lesson', icon: <CheckCircle2 className="w-4 h-4" />, color: '#10B981', text: 'Completed "useState & useReducer Patterns"', time: '2 hours ago', course: 'Advanced React Dev' },
    { id: 2, type: 'badge', icon: <Award className="w-4 h-4" />, color: '#F59E0B', text: 'Earned "10-Day Streak" badge', time: '1 day ago', course: null },
    { id: 3, type: 'comment', icon: <MessageSquare className="w-4 h-4" />, color: '#3B82F6', text: 'Replied to "useEffect cleanup functions"', time: '2 days ago', course: 'Advanced React Dev' },
    { id: 4, type: 'enroll', icon: <BookOpen className="w-4 h-4" />, color: '#7C3AED', text: 'Enrolled in "Node.js & REST APIs"', time: '3 days ago', course: null },
    { id: 5, type: 'lesson', icon: <CheckCircle2 className="w-4 h-4" />, color: '#10B981', text: 'Completed "Prototyping in Figma" quiz', time: '4 days ago', course: 'UI/UX Fundamentals' },
];

const SKILLS = ['React', 'JavaScript', 'TypeScript', 'CSS', 'Figma', 'REST APIs', 'HTML', 'Git'];

// ── Sub Components ─────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 64, h = 28;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    });
    const polyline = pts.join(' ');
    const area = `${pts[0].split(',')[0]},${h} ${polyline} ${w},${h}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
                <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#sp-${color.replace('#', '')})`} />
            <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

function CircularMini({ value, color = '#E11D48', size = 44 }: { value: number; color?: string; size?: number }) {
    const sw = 4;
    const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const cx = size / 2, cy = size / 2;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 10, fontWeight: 700, fill: '#111827', transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
                {value}%
            </text>
        </svg>
    );
}

function ProgressBar({ value, color = '#E11D48', bg = '#F3F4F6' }: { value: number; color?: string; bg?: string }) {
    return (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: bg }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LearnerDashboard() {
    const user = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);
    useEffect(() => {
        // ── MOCK PROFILE LOADING (TRÁNH LỖI 429 VÀ PHỤ THUỘC API) ───────────────────────
        // Trực tiếp nạp thông tin học viên giả lập để đảm bảo hiển thị dashboard hoạt động
        // mượt mà và ổn định.
        /* Tạm thời comment API để tránh lỗi 429
        if (user?.userId) {
            getLearnerProfile(user.userId).then((data) => setProfile(data)).catch((error) => console.log(error))
        }
        */

        // Thay thế bằng Mock Profile
        import('../../db/data').then(({ MOCK_PROFILE }) => {
            setProfile(MOCK_PROFILE);
        });
    }, [user])

    const [savedRecs, setSavedRecs] = useState<Set<number>>(new Set());
    const maxHrs = Math.max(...WEEKLY_DATA.map(d => d.hrs));

    const totalXP = ACHIEVEMENTS.filter(a => a.earned).reduce((s, a) => s + a.xp, 0);

    const nodeColors: Record<NodeState, { ring: string; bg: string; text: string; line: string }> = {
        completed: { ring: 'border-[#10B981]', bg: 'bg-[#10B981]', text: 'text-white', line: '#10B981' },
        current: { ring: 'border-[#E11D48]', bg: 'bg-[#E11D48]', text: 'text-white', line: '#E11D48' },
        upcoming: { ring: 'border-[#D1D5DB]', bg: 'bg-white', text: 'text-[#6B7280]', line: '#E5E7EB' },
        locked: { ring: 'border-[#E5E7EB]', bg: 'bg-[#F9FAFB]', text: 'text-[#9CA3AF]', line: '#F3F4F6' },
    };

    return (
        <main className="max-w-[1440px] mx-auto px-8 py-8 space-y-8">

            {/* ── Dashboard Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
                <div className="flex-1">

                    <h1 className="text-[34px] text-[#111827] mb-5" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                        Welcome back, {profile?.fullName} 👋
                    </h1>
                    {/* <p className="text-[#6B7280] text-base mb-5" style={{ lineHeight: 1.5 }}>
                        You're 52% through Advanced React — finish today's lesson to keep your streak alive.
                    </p> */}
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 600 }}>
                            <Play className="w-4 h-4 fill-white" />
                            Continue Learning
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                            <Calendar className="w-4 h-4 text-[#6B7280]" />
                            View Schedule
                        </button>
                    </div>
                </div>

                {/* Today's summary */}
                {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 w-72 flex-shrink-0">
                    <p className="text-xs text-[#9CA3AF] mb-3 uppercase tracking-wide" style={{ fontWeight: 600 }}>Today's Summary</p>
                    <div className="space-y-3">
                        {[
                            { label: 'Lessons completed', val: '2 / 3', icon: <BookOpen className="w-3.5 h-3.5 text-[#6B7280]" /> },
                            { label: 'Study time', val: '1h 24m', icon: <Clock className="w-3.5 h-3.5 text-[#6B7280]" /> },
                            { label: 'XP earned today', val: '+120 XP', icon: <Zap className="w-3.5 h-3.5 text-[#F59E0B]" /> },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                <span className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{item.val}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                        <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-2">
                            <span>Daily goal</span>
                            <span style={{ fontWeight: 600 }} className="text-[#111827]">83%</span>
                        </div>
                        <ProgressBar value={83} color="#E11D48" />
                    </div>
                </div> */}
            </div>

            {/* ── Stats ─────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-5">
                {STATS.map(stat => (
                    <div key={stat.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs text-[#9CA3AF] mb-1" style={{ fontWeight: 500 }}>{stat.label}</p>
                                <p className="text-[28px] text-[#111827]" style={{ fontWeight: 700, lineHeight: 1 }}>{stat.value}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="flex items-end justify-between gap-3">
                            <div className="flex items-center gap-1 text-xs" style={{ color: '#10B981', fontWeight: 500 }}>
                                <ChevronUp className="w-3 h-3" />
                                <span>{stat.sub}</span>
                            </div>
                            <Sparkline data={stat.sparkData} color={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main 3-col Layout ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left — Continue Learning */}
                <div className="col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Continue Learning</h2>
                        <button className="flex items-center gap-1 text-xs text-[#E11D48] hover:text-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                            All courses <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {CONTINUE_COURSES.map((course, idx) => (
                            <div key={course.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#E11D48]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm shadow-sm" style={{ background: course.gradient, fontWeight: 700 }}>
                                        {course.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 600 }}>{course.title}</p>
                                        <p className="text-xs text-[#9CA3AF] mt-0.5">{course.path}</p>
                                    </div>
                                    <CircularMini value={course.progress} color={idx === 0 ? '#E11D48' : idx === 1 ? '#3B82F6' : '#10B981'} />
                                </div>

                                <div className="mb-3">
                                    <p className="text-xs text-[#6B7280] truncate mb-2">
                                        <span className="text-[#9CA3AF]">Now: </span>{course.lesson}
                                    </p>
                                    <ProgressBar
                                        value={course.progress}
                                        color={idx === 0 ? '#E11D48' : idx === 1 ? '#3B82F6' : '#10B981'}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                                        <span>{course.remaining} lessons left</span>
                                        <span>·</span>
                                        <span>{course.duration}</span>
                                    </div>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] group-hover:bg-[#E11D48] text-[#374151] group-hover:text-white rounded-lg text-xs transition-all" style={{ fontWeight: 500 }}>
                                        <Play className="w-3 h-3 fill-current" />
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle — Learning Roadmap */}
                <div className="col-span-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Learning Roadmap</h2>
                        <span className="text-xs text-[#9CA3AF]" style={{ fontWeight: 500 }}>Frontend Mastery</span>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                        {/* Path label */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="px-2.5 py-1 bg-[#FFF1F4] rounded-full">
                                    <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600 }}>3 / 7 complete</span>
                                </div>
                            </div>
                            <button className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors" style={{ fontWeight: 500 }}>
                                Full map →
                            </button>
                        </div>

                        {/* Vertical roadmap */}
                        <div className="relative">
                            {ROADMAP_NODES.map((node, i) => {
                                const isLast = i === ROADMAP_NODES.length - 1;
                                const cfg = nodeColors[node.state];
                                return (
                                    <div key={node.id} className="relative flex items-start gap-4 pb-5">
                                        {/* Connector line */}
                                        {!isLast && (
                                            <div
                                                className="absolute w-0.5"
                                                style={{
                                                    left: '15px',
                                                    top: '32px',
                                                    bottom: 0,
                                                    backgroundColor: cfg.line,
                                                    zIndex: 0,
                                                }}
                                            />
                                        )}

                                        {/* Node circle */}
                                        <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cfg.ring} ${cfg.bg}`}>
                                            {node.state === 'completed' ? (
                                                <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                                            ) : node.state === 'locked' ? (
                                                <Lock className="w-3.5 h-3.5 text-[#D1D5DB]" />
                                            ) : node.state === 'current' ? (
                                                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 pt-0.5 ${node.state === 'locked' ? 'opacity-50' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`text-sm ${node.state === 'current' ? 'text-[#E11D48]' : node.state === 'completed' ? 'text-[#111827]' : 'text-[#6B7280]'}`} style={{ fontWeight: node.state === 'current' ? 700 : 500 }}>
                                                        {node.label}
                                                        {node.state === 'current' && (
                                                            <span className="ml-2 text-[10px] bg-[#E11D48] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>ACTIVE</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-[#9CA3AF] mt-0.5">{node.course}</p>
                                                </div>
                                                {node.progress !== undefined && node.state !== 'completed' && (
                                                    <span className="text-xs" style={{ fontWeight: 600, color: node.state === 'current' ? '#E11D48' : '#9CA3AF' }}>
                                                        {node.progress}%
                                                    </span>
                                                )}
                                                {node.state === 'completed' && (
                                                    <span className="text-[10px] text-[#10B981] bg-[#F0FDF4] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>DONE</span>
                                                )}
                                            </div>
                                            {node.progress !== undefined && node.state === 'current' && (
                                                <div className="mt-2">
                                                    <ProgressBar value={node.progress} color="#E11D48" />
                                                </div>
                                            )}
                                            {node.progress !== undefined && node.state === 'upcoming' && (
                                                <div className="mt-2">
                                                    <ProgressBar value={node.progress} color="#3B82F6" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#9CA3AF]">
                            <span>Est. completion: Aug 2026</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10B981]" /><span>Done</span></div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#E11D48]" /><span>Active</span></div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#D1D5DB]" /><span>Locked</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Productivity Panel */}
                {/* <div className="col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Productivity</h2>
                        <span className="text-xs text-[#9CA3AF]">This week</span>
                    </div>

                    Weekly Chart
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-[#9CA3AF]" style={{ fontWeight: 500 }}>Study Hours</p>
                                <p className="text-xl text-[#111827]" style={{ fontWeight: 700 }}>11.4h <span className="text-xs text-[#10B981]" style={{ fontWeight: 500 }}>↑18%</span></p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                                <BarChart2 className="w-4 h-4" />
                                <span>7-day view</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-2" style={{ height: 60 }}>
                            {WEEKLY_DATA.map((d) => (
                                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full rounded-t-md transition-all"
                                        style={{
                                            height: maxHrs > 0 ? `${Math.max((d.hrs / maxHrs) * 52, d.hrs > 0 ? 4 : 2)}px` : '2px',
                                            backgroundColor: d.hrs === maxHrs ? '#E11D48' : d.hrs > 0 ? '#FCA5A5' : '#F3F4F6',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-end gap-2 mt-1">
                            {WEEKLY_DATA.map((d) => (
                                <div key={d.day} className="flex-1 text-center">
                                    <span className="text-[10px] text-[#9CA3AF]">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    Deadlines
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-[#111827]" style={{ fontWeight: 700 }}>Upcoming</p>
                            <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                        <div className="space-y-2.5">
                            {DEADLINES.map(d => (
                                <div key={d.id} className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.urgent ? 'bg-[#E11D48]' : 'bg-[#D1D5DB]'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[#111827] truncate" style={{ fontWeight: 500 }}>{d.title}</p>
                                        <p className="text-[10px] text-[#9CA3AF]">{d.course}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${d.urgent ? 'bg-[#FFF1F4] text-[#E11D48]' : 'bg-[#F3F4F6] text-[#6B7280]'}`} style={{ fontWeight: 600 }}>
                                        {d.due}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    Skills
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                        <p className="text-sm text-[#111827] mb-3" style={{ fontWeight: 700 }}>Your Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                            {SKILLS.map(s => (
                                <span key={s} className="text-xs px-2.5 py-1 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg" style={{ fontWeight: 500 }}>{s}</span>
                            ))}
                        </div>
                    </div>

                    Next Recommended
                    <div className="bg-gradient-to-br from-[#1E40AF] to-[#7C3AED] rounded-2xl p-5 text-white">
                        <div className="flex items-center gap-1.5 mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs text-white/70" style={{ fontWeight: 600 }}>UP NEXT</span>
                        </div>
                        <p className="text-sm mb-1" style={{ fontWeight: 700 }}>GraphQL API Design</p>
                        <p className="text-xs text-white/60 mb-4">96% match · 8h · Intermediate</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs rounded-xl transition-colors" style={{ fontWeight: 600 }}>
                            Preview Course →
                        </button>
                    </div>
                </div> */}
            </div>

            {/* ── Achievements ──────────────────────────────────────────────────────── */}
            {/* <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Achievements</h2>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-full">
                            <Zap className="w-3 h-3 text-[#D97706]" />
                            <span className="text-xs text-[#92400E]" style={{ fontWeight: 600 }}>{totalXP} XP</span>
                        </div>
                    </div>
                    <button className="text-xs text-[#E11D48] hover:text-[#BE123C] transition-colors flex items-center gap-1" style={{ fontWeight: 500 }}>
                        All badges <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-6 gap-4">
                    {ACHIEVEMENTS.map(badge => (
                        <div
                            key={badge.id}
                            className={`bg-white border rounded-2xl p-4 text-center transition-all ${badge.earned ? 'border-[#E5E7EB] hover:border-[#E11D48]/30 hover:shadow-md' : 'border-[#F3F4F6] opacity-50'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white ${badge.earned ? `bg-gradient-to-br ${badge.color}` : 'bg-[#E5E7EB]'}`}>
                                {badge.icon}
                            </div>
                            <p className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>{badge.label}</p>
                            {badge.earned ? (
                                <p className="text-[10px] text-[#F59E0B] mt-1" style={{ fontWeight: 600 }}>+{badge.xp} XP</p>
                            ) : (
                                <p className="text-[10px] text-[#9CA3AF] mt-1">Locked</p>
                            )}
                        </div>
                    ))}
                </div>
            </div> */}

            {/* ── Course Recommendations ────────────────────────────────────────────── */}
            {/* <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Recommended for You</h2>
                        <div className="px-2 py-0.5 bg-[#FFF1F4] rounded-full">
                            <span className="text-[10px] text-[#E11D48]" style={{ fontWeight: 600 }}>AI MATCHED</span>
                        </div>
                    </div>
                    <button className="text-xs text-[#E11D48] hover:text-[#BE123C] transition-colors flex items-center gap-1" style={{ fontWeight: 500 }}>
                        Explore all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-5">
                    {RECOMMENDATIONS.map(course => (
                        <div key={course.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#E11D48]/30 hover:shadow-md transition-all group">
                            Thumbnail
                            <div className="h-32 flex items-center justify-center relative" style={{ background: course.gradient }}>
                                <span className="text-white text-2xl" style={{ fontWeight: 800, opacity: 0.9 }}>{course.initials}</span>
                                <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                    <span className="text-white text-xs" style={{ fontWeight: 700 }}>{course.match}% match</span>
                                </div>
                                <button
                                    className="absolute top-3 left-3 w-7 h-7 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center transition-colors"
                                    onClick={() => setSavedRecs(prev => { const next = new Set(prev); next.has(course.id) ? next.delete(course.id) : next.add(course.id); return next; })}
                                >
                                    <Bookmark className={`w-3.5 h-3.5 text-white ${savedRecs.has(course.id) ? 'fill-white' : ''}`} />
                                </button>
                            </div>

                            <div className="p-5">
                                <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>{course.title}</p>
                                <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mb-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${course.difficulty === 'Advanced' ? 'bg-[#FFF1F4] text-[#E11D48]' : 'bg-[#F0FDF4] text-[#15803D]'}`} style={{ fontWeight: 600 }}>
                                        {course.difficulty}
                                    </span>
                                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</div>
                                    <div className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students.toLocaleString()}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                                        <span className="text-xs text-[#374151]" style={{ fontWeight: 600 }}>{course.rating}</span>
                                    </div>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] group-hover:bg-[#E11D48] text-[#374151] group-hover:text-white rounded-lg text-xs transition-all" style={{ fontWeight: 500 }}>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        Start Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* ── Recent Activity + Empty State ─────────────────────────────────────── */}
            {/* <div className="grid grid-cols-12 gap-6">

                Recent Activity
                <div className="col-span-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base text-[#111827]" style={{ fontWeight: 700 }}>Recent Activity</h2>
                        <button className="text-xs text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors" style={{ fontWeight: 500 }}>
                            View all <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl divide-y divide-[#F3F4F6]">
                        {RECENT_ACTIVITY.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 500 }}>{item.text}</p>
                                    {item.course && (
                                        <p className="text-xs text-[#9CA3AF] mt-0.5">{item.course}</p>
                                    )}
                                </div>
                                <span className="text-xs text-[#9CA3AF] flex-shrink-0">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                Empty State + Community
                <div className="col-span-4 space-y-4">
                    Community card
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-[#111827]" style={{ fontWeight: 700 }}>Community</p>
                            <Users className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { user: 'Marcus T.', action: 'answered your question in React', time: '1h ago', av: 'MT', color: '#7C3AED' },
                                { user: 'Priya K.', action: 'liked your reply in Node.js', time: '3h ago', av: 'PK', color: '#E11D48' },
                                { user: 'Jordan L.', action: 'started following you', time: '1d ago', av: 'JL', color: '#10B981' },
                            ].map((n, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0" style={{ backgroundColor: n.color, fontWeight: 700 }}>
                                        {n.av}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[#111827]" style={{ fontWeight: 500 }}>{n.user}</p>
                                        <p className="text-[10px] text-[#9CA3AF] truncate">{n.action}</p>
                                    </div>
                                    <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">{n.time}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-3 pt-3 border-t border-[#F3F4F6] text-xs text-[#6B7280] hover:text-[#E11D48] transition-colors flex items-center justify-center gap-1" style={{ fontWeight: 500 }}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            Go to Community
                        </button>
                    </div>

                    Empty state
                    <div className="bg-[#FAFAFA] border border-dashed border-[#E5E7EB] rounded-2xl p-6 text-center">
                        <div className="w-10 h-10 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
                            <GraduationCap className="w-5 h-5 text-[#9CA3AF]" />
                        </div>
                        <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>No certificates yet</p>
                        <p className="text-xs text-[#9CA3AF] mt-1 mb-4" style={{ lineHeight: 1.5 }}>Complete a course to earn your first certificate and showcase your skills</p>
                        <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl text-xs hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                            Browse Courses
                        </button>
                    </div>
                </div>
            </div> */}

        </main>
    );
}

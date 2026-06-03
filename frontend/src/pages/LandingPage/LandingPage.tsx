import {
    BookOpen, Star, ArrowRight, Play, Zap, Users, Clock,
    ChevronRight, Building2, Sparkles,
    Award, Trophy, Check, TrendingUp, Map, Flame, Route, Shield,
    BarChart2, GraduationCap, CheckCircle2
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: <Route className="w-5 h-5" />,
        title: 'Structured Learning Paths',
        desc: 'Follow expert-curated roadmaps from beginner to job-ready. Never wonder what to learn next.',
        color: '#E11D48', bg: '#FFF1F4',
    },
    {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Progress Tracking',
        desc: 'Visualize your journey with detailed analytics, streak tracking, and milestone achievements.',
        color: '#3B82F6', bg: '#EFF6FF',
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Smart Recommendations',
        desc: 'AI-powered course suggestions based on your goals, learning style, and progress history.',
        color: '#7C3AED', bg: '#F5F3FF',
    },
    {
        icon: <Award className="w-5 h-5" />,
        title: 'Certificates & Achievements',
        desc: 'Earn industry-recognized certificates and unlock badges as you complete each milestone.',
        color: '#F59E0B', bg: '#FFFBEB',
    },
];

const PATHS = [
    {
        id: 1, title: 'Frontend Developer',
        desc: 'Master HTML, CSS, JavaScript, React & TypeScript from scratch',
        courses: 12, duration: '48h', difficulty: 'Beginner → Advanced',
        enrolled: 4800, gradient: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
        tags: ['HTML', 'CSS', 'React', 'TypeScript'], color: '#3B82F6',
    },
    {
        id: 2, title: 'Data Analyst',
        desc: 'Python, SQL, pandas, data visualization & ML fundamentals',
        courses: 10, duration: '40h', difficulty: 'Beginner → Intermediate',
        enrolled: 3200, gradient: 'linear-gradient(135deg, #065F46 0%, #0EA5E9 100%)',
        tags: ['Python', 'SQL', 'pandas', 'Visualization'], color: '#10B981',
    },
    {
        id: 3, title: 'UI/UX Designer',
        desc: 'Design fundamentals, Figma, user research & prototyping',
        courses: 9, duration: '36h', difficulty: 'Beginner → Intermediate',
        enrolled: 2900, gradient: 'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)',
        tags: ['Figma', 'UX Research', 'Prototyping'], color: '#EC4899',
    },
];

const STEPS = [
    {
        num: '01', icon: <Map className="w-6 h-6" />, color: '#E11D48', bg: '#FFF1F4',
        title: 'Choose a Learning Path',
        desc: 'Browse curated paths built for real career goals. From frontend to data science and design.',
    },
    {
        num: '02', icon: <BookOpen className="w-6 h-6" />, color: '#3B82F6', bg: '#EFF6FF',
        title: 'Complete Courses Step by Step',
        desc: 'Follow the structured curriculum at your own pace with video lessons, exercises, and quizzes.',
    },
    {
        num: '03', icon: <Trophy className="w-6 h-6" />, color: '#10B981', bg: '#F0FDF4',
        title: 'Earn Certificates',
        desc: 'Track progress with detailed analytics and earn industry-recognized certificates upon completion.',
    },
];

const TESTIMONIALS = [
    {
        id: 1, name: 'Mark Zuckerberg', role: 'CEO of Meta', av: "https://imageio.forbes.com/specials-images/imageserve/5c76b7d331358e35dd2773a9/0x0.jpg?format=jpg&crop=4401,4401,x0,y0,safe&height=416&width=416&fit=bounds", color: '#7C3AED',
        quote: 'A great learning product is not only useful, but also makes people want to come back every day',
        rating: 5,
    },
    {
        id: 2, name: 'Elon Musk', role: 'CEO of Tesla & SpaceX', av: 'https://assets.weforum.org/sf_account/image/SU7jY2MYK0Qaj6IgY6e0hXgO4LBYNB6qKxy9f-cr8KU.jpg', color: '#0369A1',
        quote: 'I like how LearningPath breaks big goals into small, actionable steps. It makes learning feel faster and more focused',
        rating: 5,
    },
    {
        id: 3, name: 'Bill Gates', role: 'Founder of Microsoft', av: 'https://imageio.forbes.com/specials-images/imageserve/62d599ede3ff49f348f9b9b4/0x0.jpg?format=jpg&crop=821,821,x155,y340,safe&height=416&width=416&fit=bounds', color: '#D97706',
        quote: "    LearningPath turns self-learning into a clear journey. You know where to start, what to learn next, and how far you have progressed.",
        rating: 5,
    },
];

const ORGS = ['MIT OpenCourseWare', 'Stanford Online', 'Google Career', 'Microsoft Learn', 'AWS Training', 'Figma Education'];

// ── Hero Dashboard Mockup ─────────────────────────────────────────────────────

function HeroDashboardMockup() {
    return (
        <div className="relative">
            {/* Floating achievement badge */}
            <div className="absolute -top-5 -right-6 z-20 bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 shadow-lg shadow-[#0F172A]/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 12 }}>Badge Unlocked!</p>
                    <p className="text-[#9CA3AF]" style={{ fontSize: 11 }}>Quiz Master 🎉</p>
                </div>
            </div>

            {/* Floating streak pill */}
            <div className="absolute -bottom-4 -left-6 z-20 bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 shadow-lg shadow-[#0F172A]/10 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: 12 }}>12-day streak!</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] ml-1" />
            </div>

            {/* Floating progress pill */}
            <div className="absolute top-1/2 -left-8 z-20 -translate-y-1/2 bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-3 shadow-lg shadow-[#0F172A]/10">
                <p className="text-[#9CA3AF] mb-1" style={{ fontSize: 10, fontWeight: 600 }}>WEEKLY GOAL</p>
                <p className="text-[#111827]" style={{ fontWeight: 800, fontSize: 18 }}>74%</p>
                <div className="h-1.5 w-24 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#E11D48] rounded-full" style={{ width: '74%' }} />
                </div>
            </div>

            {/* Main card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#0F172A]/12 border border-[#E5E7EB] overflow-hidden ml-6">
                {/* Browser bar */}
                <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
                    </div>
                    <div className="flex-1 ml-2">
                        <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-[#9CA3AF] flex items-center gap-1" style={{ fontSize: 11, width: 200 }}>
                            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                            learningpath.app/dashboard
                        </div>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 bg-[#F8FAFC]" style={{ minWidth: 420 }}>
                    {/* Greeting */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 15 }}>Welcome back, Alex 👋</p>
                            <p className="text-[#9CA3AF]" style={{ fontSize: 12 }}>Continue where you left off</p>
                        </div>
                        <button className="px-3 py-1.5 bg-[#E11D48] text-white rounded-lg flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600 }}>
                            <Play className="w-3 h-3 fill-white" /> Continue
                        </button>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { val: '12d', label: 'Streak', color: '#F59E0B', bg: '#FFFBEB' },
                            { val: '52%', label: 'Progress', color: '#E11D48', bg: '#FFF1F4' },
                            { val: '1,025', label: 'XP', color: '#10B981', bg: '#F0FDF4' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
                                <p style={{ color: s.color, fontWeight: 700, fontSize: 19, lineHeight: 1 }}>{s.val}</p>
                                <p className="text-[#9CA3AF] mt-1" style={{ fontSize: 11 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Course progress */}
                    <div className="space-y-2.5 mb-4">
                        {[
                            { title: 'Advanced React Dev', pct: 52, color: '#E11D48', g: 'from-blue-800 to-violet-600' },
                            { title: 'UI/UX Fundamentals', pct: 78, color: '#10B981', g: 'from-rose-700 to-amber-500' },
                        ].map(c => (
                            <div key={c.title} className="bg-white rounded-xl p-3 border border-[#E5E7EB] flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.g} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#111827] truncate" style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</p>
                                    <div className="h-1.5 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                                    </div>
                                </div>
                                <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Mini roadmap */}
                    <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB]">
                        <p className="text-[#6B7280] mb-2.5" style={{ fontSize: 11, fontWeight: 600 }}>FRONTEND MASTERY PATH</p>
                        <div className="flex items-center gap-1.5">
                            {['HTML', 'JS', 'React', 'TS', 'Next'].map((n, i) => (
                                <div key={n} className="flex items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${i < 2 ? 'bg-[#10B981] border-[#10B981]' :
                                        i === 2 ? 'bg-[#E11D48] border-[#E11D48]' :
                                            'bg-white border-[#E5E7EB]'
                                        }`}>
                                        {i < 2 ? <Check className="w-3 h-3 text-white" /> :
                                            i === 2 ? <div className="w-2 h-2 rounded-full bg-white" /> :
                                                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />}
                                    </div>
                                    {i < 4 && <div className="w-5 h-0.5 bg-[#E5E7EB]" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            {['HTML', 'JS', 'React', 'TS', 'Next'].map((n, i) => (
                                <div key={n} className="flex items-center gap-1.5">
                                    <span style={{ fontSize: 9, color: i < 2 ? '#10B981' : i === 2 ? '#E11D48' : '#9CA3AF', fontWeight: i === 2 ? 700 : 400, width: 28, textAlign: 'center' }}>{n}</span>
                                    {i < 4 && <div style={{ width: 20 }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Large Dashboard Mockup ─────────────────────────────────────────────────────

function LargeDashboardMockup() {
    return (
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#0F172A]/10 border border-[#E5E7EB] overflow-hidden">
            {/* Browser */}
            <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FCA5A5]" />
                    <div className="w-3 h-3 rounded-full bg-[#FCD34D]" />
                    <div className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-[#E5E7EB] rounded-md px-4 py-1.5 flex items-center gap-2" style={{ fontSize: 12, color: '#9CA3AF', width: 260 }}>
                        <div className="w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0" />
                        learningpath.app/dashboard
                    </div>
                </div>
            </div>

            <div className="flex" style={{ height: 360 }}>
                {/* Sidebar */}
                <div className="w-44 flex-shrink-0 border-r border-[#F3F4F6] bg-white p-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded-md bg-[#E11D48] flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: 12 }}>LearningPath</span>
                    </div>
                    {[
                        { label: 'Dashboard', active: true },
                        { label: 'My Courses', active: false },
                        { label: 'Learning Paths', active: false },
                        { label: 'Community', active: false },
                        { label: 'Analytics', active: false },
                        { label: 'Profile', active: false },
                    ].map(item => (
                        <div key={item.label} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 ${item.active ? 'bg-[#FFF1F4] text-[#E11D48]' : 'text-[#6B7280]'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.active ? 'bg-[#E11D48]' : 'bg-transparent'}`} />
                            <span style={{ fontSize: 12, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                        </div>
                    ))}

                    <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#E11D48] flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 700 }}>A</div>
                            <div>
                                <p className="text-[#111827]" style={{ fontSize: 11, fontWeight: 600 }}>Alex Morgan</p>
                                <p className="text-[#9CA3AF]" style={{ fontSize: 10 }}>Learner</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 bg-[#F8FAFC] p-5 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 15 }}>Welcome back, Alex 👋</p>
                            <p className="text-[#9CA3AF]" style={{ fontSize: 12 }}>You're on a 12-day streak — keep it up!</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-full flex items-center gap-1">
                                <Flame className="w-3 h-3 text-[#F59E0B]" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>12-day streak</span>
                            </div>
                            <button className="px-3 py-1.5 bg-[#E11D48] text-white rounded-lg flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600 }}>
                                <Play className="w-3 h-3 fill-white" /> Continue
                            </button>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                            { val: '12', label: 'Day Streak', color: '#F59E0B' },
                            { val: '8', label: 'Completed', color: '#10B981' },
                            { val: '124h', label: 'Learned', color: '#3B82F6' },
                            { val: '74%', label: 'Weekly Goal', color: '#E11D48' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
                                <p style={{ color: s.color, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>{s.val}</p>
                                <p className="text-[#9CA3AF] mt-1" style={{ fontSize: 11 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Courses */}
                        <div className="col-span-2 bg-white rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-[#111827] mb-3" style={{ fontWeight: 600, fontSize: 13 }}>Continue Learning</p>
                            {[
                                { title: 'Advanced React Dev', pct: 52, g: 'from-blue-700 to-violet-600', color: '#E11D48', lesson: 'useCallback & useMemo' },
                                { title: 'Node.js & REST APIs', pct: 31, g: 'from-emerald-700 to-teal-500', color: '#3B82F6', lesson: 'Middleware & Routing' },
                            ].map(c => (
                                <div key={c.title} className="flex items-center gap-3 mb-2.5 last:mb-0">
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.g} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[#111827] truncate" style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</p>
                                        <p className="text-[#9CA3AF] truncate" style={{ fontSize: 11 }}>{c.lesson}</p>
                                        <div className="h-1 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Roadmap */}
                        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-[#111827] mb-3" style={{ fontWeight: 600, fontSize: 13 }}>Frontend Path</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'HTML & CSS', state: 'done' },
                                    { label: 'JavaScript', state: 'done' },
                                    { label: 'React', state: 'active' },
                                    { label: 'TypeScript', state: 'next' },
                                    { label: 'Next.js', state: 'locked' },
                                ].map((node) => (
                                    <div key={node.label} className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${node.state === 'done' ? 'bg-[#10B981]' :
                                            node.state === 'active' ? 'bg-[#E11D48]' :
                                                'bg-[#F3F4F6] border border-[#E5E7EB]'
                                            }`}>
                                            {node.state === 'done' && <Check className="w-3 h-3 text-white" />}
                                            {node.state === 'active' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-xs ${node.state === 'done' ? 'text-[#374151]' : node.state === 'active' ? 'text-[#E11D48]' : 'text-[#9CA3AF]'}`}
                                            style={{ fontWeight: node.state === 'active' ? 600 : 400 }}>
                                            {node.label}
                                        </span>
                                        {node.state === 'active' && (
                                            <span className="text-[9px] bg-[#E11D48] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>NOW</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Nav ────────────────────────────────────────────────────────────────────────



// ── Hero ───────────────────────────────────────────────────────────────────────

function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            {/* Bg accent */}
            <div className="absolute inset-0 opacity-40"
                style={{ background: 'radial-gradient(ellipse at 75% 40%, rgba(225,29,72,0.06) 0%, transparent 60%)' }} />
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative max-w-[1200px] mx-auto px-8 py-24">
                <div className="grid grid-cols-2 gap-20 items-center">
                    {/* Left */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF1F4] border border-[#FECDD3] rounded-full mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                            <span className="text-[#BE123C]" style={{ fontSize: 12, fontWeight: 600 }}>
                                Personalized learning, reimagined
                            </span>
                        </div>

                        <h1 className="text-[#111827] mb-6" style={{ fontWeight: 800, fontSize: 60, lineHeight: 1.08 }}>
                            Build your own<br />
                            <span style={{ color: '#E11D48' }}>learning journey</span>,<br />
                            one path at a time
                        </h1>

                        <p className="text-[#6B7280] mb-10" style={{ fontSize: 18, lineHeight: 1.65 }}>
                            Discover structured learning paths, track your progress, and grow skills with courses designed for your goals.
                        </p>

                        <div className="flex items-center gap-4 mb-12">
                            <button className="flex items-center gap-2.5 px-6 py-3.5 bg-[#E11D48] text-white rounded-xl hover:bg-[#BE123C] transition-all shadow-lg shadow-[#E11D48]/25" style={{ fontSize: 15, fontWeight: 600 }}>
                                <Play className="w-4 h-4 fill-white" />
                                Start Learning Free
                            </button>
                            <button className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-all" style={{ fontSize: 15, fontWeight: 500 }}>
                                Explore Paths
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Avatars + social proof */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {['#7C3AED', '#0369A1', '#D97706', '#065F46', '#E11D48'].map((c, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white" style={{ backgroundColor: c, fontSize: 10, fontWeight: 700 }}>
                                        {['MT', 'JO', 'SR', 'AK', 'MP'][i]}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />)}
                                </div>
                                <p className="text-[#6B7280]" style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>50,000+</span> learners already enrolled
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Mockup */}
                    <div className="flex justify-end">
                        <HeroDashboardMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Trust ──────────────────────────────────────────────────────────────────────

function TrustSection() {
    return (
        <section className="bg-[#F8FAFC] border-y border-[#E5E7EB] py-12">
            <div className="max-w-[1200px] mx-auto px-8">
                <p className="text-center text-[#9CA3AF] mb-8" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em' }}>
                    TRUSTED BY LEARNERS AT LEADING ORGANIZATIONS
                </p>
                <div className="flex items-center justify-center gap-8 flex-wrap mb-10">
                    {ORGS.map(org => (
                        <div key={org} className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl">
                            <span className="text-[#6B7280]" style={{ fontSize: 13, fontWeight: 500 }}>{org}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-12 pt-8 border-t border-[#E5E7EB]">
                    {[
                        { val: '50K+', label: 'Active Learners', icon: <Users className="w-4 h-4" /> },
                        { val: '1,200+', label: 'Total Courses', icon: <BookOpen className="w-4 h-4" /> },
                        { val: '180+', label: 'Learning Paths', icon: <Map className="w-4 h-4" /> },
                        { val: '95%', label: 'Completion Rate', icon: <CheckCircle2 className="w-4 h-4" /> },
                    ].map(stat => (
                        <div key={stat.label} className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="text-[#E11D48]">{stat.icon}</div>
                                <p className="text-[#111827]" style={{ fontWeight: 800, fontSize: 30 }}>{stat.val}</p>
                            </div>
                            <p className="text-[#9CA3AF]" style={{ fontSize: 13 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Features ───────────────────────────────────────────────────────────────────

function FeaturesSection() {
    return (
        <section className="max-w-[1200px] mx-auto px-8 py-24">
            <div className="text-center mb-14">
                <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>WHY LEARNINGPATH</p>
                <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                    Everything you need to<br />grow your skills
                </h2>
                <p className="text-[#6B7280] max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
                    A complete platform that combines structured learning, progress tracking, and real achievement recognition.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-5">
                {FEATURES.map((f, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:border-[#E11D48]/30 hover:shadow-lg hover:shadow-[#0F172A]/5 transition-all group">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: f.bg, color: f.color }}>
                            {f.icon}
                        </div>
                        <h3 className="text-[#111827] mb-3" style={{ fontWeight: 700, fontSize: 17 }}>{f.title}</h3>
                        <p className="text-[#6B7280]" style={{ fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                        <div className="mt-5 flex items-center gap-1.5 text-[#E11D48] group-hover:gap-2.5 transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
                            Learn more <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ── Learning Paths Preview ─────────────────────────────────────────────────────

function LearningPathsSection() {
    return (
        <section className="bg-[#F8FAFC] py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>FEATURED PATHS</p>
                        <h2 className="text-[#111827]" style={{ fontWeight: 800, fontSize: 42, lineHeight: 1.1 }}>
                            Start a curated<br />learning path
                        </h2>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-[#F3F4F6] transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
                        View all paths <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {PATHS.map(path => (
                        <div key={path.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#E11D48]/30 hover:shadow-xl hover:shadow-[#0F172A]/6 transition-all group">
                            {/* Banner */}
                            <div className="h-36 relative flex items-end p-5" style={{ background: path.gradient }}>
                                <div className="absolute inset-0 opacity-10"
                                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                <div className="relative z-10">
                                    <span className="inline-block px-2.5 py-1 bg-white/20 text-white rounded-lg mb-2" style={{ fontSize: 11, fontWeight: 600 }}>
                                        {path.difficulty}
                                    </span>
                                    <h3 className="text-white" style={{ fontWeight: 800, fontSize: 20 }}>{path.title} Path</h3>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <p className="text-[#6B7280] mb-5" style={{ fontSize: 14, lineHeight: 1.55 }}>{path.desc}</p>

                                <div className="flex items-center gap-5 mb-5 text-[#9CA3AF]" style={{ fontSize: 13 }}>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{path.courses} courses</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{path.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{(path.enrolled / 1000).toFixed(1)}k enrolled</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {path.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] rounded-lg" style={{ fontSize: 12, fontWeight: 500 }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    className="w-full py-2.5 rounded-xl text-sm transition-all group-hover:bg-[#E11D48] group-hover:text-white border border-[#E5E7EB] bg-[#F8FAFC] text-[#374151]"
                                    style={{ fontWeight: 600 }}
                                >
                                    Start Path →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── How It Works ───────────────────────────────────────────────────────────────

function HowItWorksSection() {
    return (
        <section className="max-w-[1200px] mx-auto px-8 py-24">
            <div className="text-center mb-16">
                <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>HOW IT WORKS</p>
                <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                    From zero to job-ready<br />in three steps
                </h2>
                <p className="text-[#6B7280] max-w-lg mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
                    A proven system used by 50,000+ learners to build real skills and land their dream roles.
                </p>
            </div>

            <div className="relative flex items-start gap-6">
                {/* Connector lines */}
                <div className="absolute top-[52px] left-[calc(16.67%-12px)] right-[calc(16.67%-12px)] h-0.5 bg-gradient-to-r from-[#E11D48] via-[#3B82F6] to-[#10B981] opacity-20" />

                {STEPS.map((step, i) => (
                    <div key={i} className="flex-1 relative">
                        {/* Step card */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:border-[#E11D48]/20 hover:shadow-lg hover:shadow-[#0F172A]/5 transition-all text-center group">
                            {/* Number badge */}
                            <div className="relative inline-block mb-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: step.bg, color: step.color }}>
                                    {step.icon}
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center" style={{ color: step.color, fontSize: 10, fontWeight: 800 }}>
                                    {i + 1}
                                </div>
                            </div>

                            <p className="text-[#9CA3AF] mb-2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>STEP {step.num}</p>
                            <h3 className="text-[#111827] mb-3" style={{ fontWeight: 700, fontSize: 18 }}>{step.title}</h3>
                            <p className="text-[#6B7280]" style={{ fontSize: 14, lineHeight: 1.65 }}>{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ── Dashboard Preview ──────────────────────────────────────────────────────────

function DashboardPreviewSection() {
    return (
        <section className="bg-[#F8FAFC] py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="text-center mb-14">
                    <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>THE PLATFORM</p>
                    <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                        Your command center<br />for learning
                    </h2>
                    <p className="text-[#6B7280] max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
                        A beautifully designed dashboard that keeps you focused, motivated, and on track to reach your goals.
                    </p>
                </div>
                <LargeDashboardMockup />
            </div>
        </section>
    );
}

// ── Organization Section ───────────────────────────────────────────────────────

function OrganizationSection() {
    const bullets = [
        'Create and publish custom learning paths for your team',
        'Track employee progress with detailed analytics',
        'Set learning goals and manage certifications',
        'Integrate with your existing HR and LMS tools',
    ];

    return (
        <section className="max-w-[1200px] mx-auto px-8 py-24">
            <div className="grid grid-cols-2 gap-16 items-center">
                {/* Left */}
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-6">
                        <Building2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span className="text-[#1D4ED8]" style={{ fontSize: 12, fontWeight: 600 }}>For Teams & Organizations</span>
                    </div>
                    <h2 className="text-[#111827] mb-5" style={{ fontWeight: 800, fontSize: 42, lineHeight: 1.1 }}>
                        Scale learning<br />across your entire<br />organization
                    </h2>
                    <p className="text-[#6B7280] mb-8" style={{ fontSize: 16, lineHeight: 1.65 }}>
                        Give your team a structured way to grow their skills with custom learning programs, progress tracking, and certificates.
                    </p>
                    <div className="space-y-3 mb-8">
                        {bullets.map(b => (
                            <div key={b} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#15803D]" />
                                </div>
                                <p className="text-[#374151]" style={{ fontSize: 15 }}>{b}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 bg-[#111827] text-white rounded-xl hover:bg-[#1F2937] transition-all" style={{ fontSize: 14, fontWeight: 600 }}>
                            For Organizations →
                        </button>
                        <button className="px-6 py-3 border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-[#F8FAFC] transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
                            Book a demo
                        </button>
                    </div>
                </div>

                {/* Right - org mockup */}
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-xl shadow-[#0F172A]/6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 15 }}>Acme Corp — Learning Hub</p>
                            <p className="text-[#9CA3AF]" style={{ fontSize: 13 }}>142 employees · 8 active paths</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                                <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                                <Shield className="w-4 h-4 text-[#10B981]" />
                            </div>
                        </div>
                    </div>

                    {/* Org stats */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                            { val: '87%', label: 'Avg. Completion', color: '#10B981' },
                            { val: '142', label: 'Team Members', color: '#3B82F6' },
                            { val: '58', label: 'Certs Earned', color: '#F59E0B' },
                        ].map(s => (
                            <div key={s.label} className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                                <p style={{ color: s.color, fontWeight: 700, fontSize: 22 }}>{s.val}</p>
                                <p className="text-[#9CA3AF]" style={{ fontSize: 12 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Team progress */}
                    <div className="space-y-3">
                        {[
                            { name: 'Engineering Team', members: 38, pct: 72, color: '#3B82F6' },
                            { name: 'Design Team', members: 14, pct: 91, color: '#7C3AED' },
                            { name: 'Marketing Team', members: 22, pct: 58, color: '#F59E0B' },
                            { name: 'Product Team', members: 11, pct: 85, color: '#10B981' },
                        ].map(team => (
                            <div key={team.name} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[#374151]" style={{ fontSize: 13, fontWeight: 500 }}>{team.name}</span>
                                        <span className="text-[#9CA3AF]" style={{ fontSize: 12 }}>{team.members} members · {team.pct}%</span>
                                    </div>
                                    <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${team.pct}%`, backgroundColor: team.color }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Testimonials ───────────────────────────────────────────────────────────────

function TestimonialsSection() {
    return (
        <section className="bg-[#F8FAFC] py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="text-center mb-14">
                    <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>TESTIMONIALS</p>
                    <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                        Loved by 50,000+<br />learners worldwide
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {TESTIMONIALS.map(t => (
                        <div key={t.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:shadow-lg hover:shadow-[#0F172A]/5 transition-all">
                            <div className="flex items-center gap-0.5 mb-5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                                ))}
                            </div>
                            <p className="text-[#374151] mb-7" style={{ fontSize: 15, lineHeight: 1.7 }}>"{t.quote}"</p>
                            <div className="flex items-center gap-3 pt-5 border-t border-[#F3F4F6]">
                                {t.av.startsWith('http') || t.av.startsWith('/') ? (
                                    <img src={t.av} alt={t.name} className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: t.color, fontSize: 12, fontWeight: 700 }}>
                                        {t.av}
                                    </div>
                                )}
                                <div>
                                    <p className="text-[#111827]" style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                                    <p className="text-[#9CA3AF]" style={{ fontSize: 13 }}>{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── CTA Section ────────────────────────────────────────────────────────────────

function CTASection() {
    return (
        <section className="bg-[#E11D48] py-24 relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white, transparent 70%)' }} />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, white, transparent 70%)' }} />

            <div className="relative max-w-[800px] mx-auto px-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full mb-6">
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <span className="text-white" style={{ fontSize: 12, fontWeight: 600 }}>Free to start, no credit card required</span>
                </div>
                <h2 className="text-white mb-5" style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.1 }}>
                    Start building your<br />learning path today
                </h2>
                <p className="text-white/70 mb-10" style={{ fontSize: 18, lineHeight: 1.6 }}>
                    Join 50,000+ learners who are already building their future. Choose a path, start learning, and earn certificates.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button className="flex items-center gap-2.5 px-8 py-4 bg-white text-[#E11D48] rounded-xl hover:bg-[#FFF1F4] transition-all shadow-lg shadow-[#0F172A]/20" style={{ fontSize: 15, fontWeight: 700 }}>
                        <GraduationCap className="w-5 h-5" />
                        Get Started Free
                    </button>
                    <button className="flex items-center gap-2.5 px-8 py-4 bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/20 transition-all" style={{ fontSize: 15, fontWeight: 600 }}>
                        <Play className="w-4 h-4" />
                        View Demo
                    </button>
                </div>

                {/* Trust pills */}
                <div className="flex items-center justify-center gap-6 mt-10">
                    {[
                        { icon: <Shield className="w-3.5 h-3.5" />, label: 'SOC 2 Certified' },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'No credit card needed' },
                        { icon: <Users className="w-3.5 h-3.5" />, label: '50,000+ learners' },
                    ].map(pill => (
                        <div key={pill.label} className="flex items-center gap-1.5 text-white/60" style={{ fontSize: 13 }}>
                            {pill.icon}
                            <span>{pill.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
    const cols = [
        {
            label: 'Product',
            links: ['Features', 'Learning Paths', 'Courses', 'Certificates', 'Progress Tracking', 'Analytics'],
        },
        {
            label: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Partners', 'Contact'],
        },
        {
            label: 'For Organizations',
            links: ['Teams', 'Enterprise', 'Course Providers', 'Case Studies', 'Integrations', 'API'],
        },
        {
            label: 'Resources',
            links: ['Documentation', 'Community', 'Help Center', 'Changelog', 'Status', 'Privacy'],
        },
    ];

    return (
        <footer className="bg-[#111827] pt-16 pb-8">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-5 gap-10 mb-14">
                    {/* Brand col */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-[#E11D48] flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-white" style={{ fontWeight: 700, fontSize: 16 }}>LearningPath</span>
                        </div>
                        <p className="text-[#6B7280] mb-5" style={{ fontSize: 14, lineHeight: 1.65 }}>
                            The modern platform for structured learning and real career growth.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, href: '#' },
                                { icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" /></svg>, href: '#' },
                                { icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>, href: '#' },
                            ].map((s, i) => (
                                <a key={i} href={s.href} className="w-8 h-8 rounded-lg bg-[#1F2937] hover:bg-[#374151] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-all">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link cols */}
                    {cols.map(col => (
                        <div key={col.label}>
                            <p className="text-white mb-4" style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</p>
                            <ul className="space-y-2.5">
                                {col.links.map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-[#6B7280] hover:text-[#D1D5DB] transition-colors" style={{ fontSize: 14 }}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-[#1F2937] flex items-center justify-between">
                    <p className="text-[#6B7280]" style={{ fontSize: 13 }}>
                        © 2026 LearningPath, Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                            <a key={link} href="#" className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors" style={{ fontSize: 13 }}>
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export function LandingPage() {
    return (
        <div className="bg-white overflow-x-hidden">
            <HeroSection />
            <TrustSection />
            <FeaturesSection />
            <LearningPathsSection />
            <HowItWorksSection />
            <DashboardPreviewSection />
            <OrganizationSection />
            <TestimonialsSection />
            <CTASection />
            <Footer />
        </div>
    );
}

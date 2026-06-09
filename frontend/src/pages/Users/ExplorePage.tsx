import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronRight, ChevronDown, Play,
    Sparkles, TrendingUp, Star, Users, Clock, Bookmark, BookmarkCheck,
    Code2, Server, Layout, Palette, Database, TestTube2, BarChart3,
    MessageCircle, BrainCircuit, Target, ArrowUpRight, Eye, RotateCcw,
    Filter, BookOpen, Route
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.stores';
import { searchCourses } from '../../services/course/course.service';
import type { Course } from '../../services/course/course.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import { getLearningPaths } from '../../services/learning-path/learning-path.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

type Tab = 'all' | 'courses' | 'paths' | 'recommended' | 'saved';

export function ExplorePage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [tab, setTab] = useState<Tab>('all');
    const [courses, setCourses] = useState<Course[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState<number | null>(null);
    const [profile, setProfile] = useState<any>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');

    async function loadData() {
        try {
            setIsLoading(true);

            // ── MOCK EXPLORE DATA FETCHING (TRÁNH LỖI 429) ───────────────────────────────────
            // Thay vì gọi API lấy danh sách khóa học và lộ trình học từ server, hệ thống sẽ
            // dùng mock data trực tiếp và nạp các bản đăng ký học viên từ sessionStorage.
            /* Tạm thời comment API để tránh lỗi 429
            const [allCourses, paths] = await Promise.all([
                searchCourses(),
                getLearningPaths()
            ]);
            setCourses(allCourses);
            setLearningPaths(paths);

            if (user) {
                const myEnrollments = await getMyEnrollments();
                setEnrollments(myEnrollments);
            }
            */

            // Thay thế bằng Mock Data
            const { MOCK_COURSES, MOCK_LEARNING_PATHS, MOCK_ENROLLMENTS, MOCK_LEARNER_PROFILE_FULL } = await import('../../db/data');
            setCourses(MOCK_COURSES);
            setLearningPaths(MOCK_LEARNING_PATHS);
            const isLearner = user?.roleName?.toLowerCase() === 'learner';
            if (user && isLearner) {
                const storedEnrollments = sessionStorage.getItem('explore_cache_enrollments');
                setEnrollments(storedEnrollments ? JSON.parse(storedEnrollments) : MOCK_ENROLLMENTS);
                setProfile(MOCK_LEARNER_PROFILE_FULL);
            } else {
                setEnrollments([]);
                setProfile(null);
            }

        } catch (error) {
            console.error('Failed to load explore data:', error);
            toast.error('Failed to load courses.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        loadData();
    }, [user]);

    const handleEnroll = async (courseId: number) => {
        if (!user) {
            toast.error('Please sign in to enroll in courses.');
            navigate('/login');
            return;
        }

        const role = user.roleName?.toLowerCase();
        if (role !== 'learner') {
            toast.error(`As a ${user.roleName}, you cannot enroll in courses.`);
            return;
        }

        try {
            setEnrollingId(courseId);

            // ── MOCK ENROLLMENT ACTION (TỰ ĐĂNG KÝ KHÓA HỌC CỤC BỘ) ─────────────────────────
            // Để tránh lỗi 429, hệ thống không gửi API đăng ký khóa học lên server.
            // Thay vào đó, nó sẽ tạo một bản ghi Đăng ký giả lập mới và lưu trữ vào sessionStorage.
            /* Tạm thời comment API để tránh lỗi 429
            await enrollCourse(courseId);
            toast.success('Successfully enrolled!');

            // Refresh enrollments
            const myEnrollments = await getMyEnrollments();
            setEnrollments(myEnrollments);
            */

            // Thay thế bằng Mock Enroll cục bộ
            const courseToEnroll = courses.find(c => c.courseId === courseId);
            if (!courseToEnroll) return;

            const newEnrollment: Enrollment = {
                enrollmentId: Date.now(),
                enrolledAt: new Date().toISOString(),
                status: 'active',
                progress: 0,
                lastAccessedAt: new Date().toISOString(),
                completedAt: null,
                expiresAt: null,
                course: courseToEnroll,
            };

            const updated = [...enrollments, newEnrollment];
            setEnrollments(updated);
            sessionStorage.setItem('explore_cache_enrollments', JSON.stringify(updated));
            toast.success('Successfully enrolled! (Mock)');

        } catch (error: any) {
            console.error('Enrollment error:', error);
            toast.error('Failed to enroll.');
        } finally {
            setEnrollingId(null);
        }
    };

    const isEnrolled = (courseId: number) => {
        return enrollments.some(e => e.course?.courseId === courseId);
    };

    const handleEnrollPath = async (path: LearningPath) => {
        if (!user) {
            toast.error('Please sign in to enroll in learning paths.');
            navigate('/login');
            return;
        }

        const role = user.roleName?.toLowerCase();
        if (role !== 'learner') {
            toast.error(`As a ${user.roleName}, you cannot enroll in paths.`);
            return;
        }

        const pathCourses = path.learningPathCourses || [];
        if (pathCourses.length === 0) return;

        const unenrolledCourses = pathCourses.filter(pc => !isEnrolled(pc.courseId));

        if (unenrolledCourses.length === 0) {
            toast.success('You are already enrolled in all courses of this path!');
            return;
        }

        try {
            setIsLoading(true);
            const newEnrollments = [...enrollments];
            
            unenrolledCourses.forEach(pc => {
                const newEnrollment: Enrollment = {
                    enrollmentId: Date.now() + Math.random(),
                    enrolledAt: new Date().toISOString(),
                    status: 'active',
                    progress: 0,
                    lastAccessedAt: new Date().toISOString(),
                    completedAt: null,
                    expiresAt: null,
                    course: pc.course,
                };
                newEnrollments.push(newEnrollment);
            });

            setEnrollments(newEnrollments);
            sessionStorage.setItem('explore_cache_enrollments', JSON.stringify(newEnrollments));
            toast.success(`Successfully enrolled in ${unenrolledCourses.length} course(s) on this path! (Mock)`);
        } catch (error) {
            console.error('Path enrollment error:', error);
            toast.error('Failed to enroll in path.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filters
    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLanguage = selectedLanguage === 'all' ||
            (course.language && course.language.toLowerCase() === selectedLanguage.toLowerCase());

        return matchesSearch && matchesLanguage;
    });

    const getCourseLevel = (course: Course) => {
        for (const path of learningPaths) {
            if (path.learningPathCourses?.some(lpc => lpc.courseId === course.courseId)) {
                return path.level.charAt(0).toUpperCase() + path.level.slice(1);
            }
        }
        return 'Intermediate';
    };

    const calculateMatchPercentage = (course: Course, learnerProfile: any) => {
        if (!learnerProfile) return 80;

        let score = 55;
        const goal = (learnerProfile.learningGoal || '').toLowerCase();
        const title = course.title.toLowerCase();
        const description = (course.description || '').toLowerCase();

        const keywords = ['react', 'node', 'express', 'figma', 'ui/ux', 'typescript', 'docker', 'graphql', 'vitest', 'api'];
        let matchedKeywords = 0;

        keywords.forEach(kw => {
            if (goal.includes(kw)) {
                if (title.includes(kw) || description.includes(kw)) {
                    matchedKeywords++;
                }
            }
        });

        score += matchedKeywords * 15;

        const userLevel = (learnerProfile.level || 'Intermediate').toLowerCase();
        const matchesLevelPath = learningPaths.some(path =>
            path.level.toLowerCase() === userLevel &&
            path.learningPathCourses?.some(lpc => lpc.courseId === course.courseId)
        );

        if (matchesLevelPath) {
            score += 15;
        }

        return Math.min(score, 99);
    };

    const getCourseGradient = (index: number) => {
        const gradients = [
            'from-[#3B82F6] to-[#1D4ED8]', // Blue
            'from-[#10B981] to-[#047857]', // Emerald
            'from-[#EC4899] to-[#BE123C]', // Rose
            'from-[#8B5CF6] to-[#5B21B6]', // Purple
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <main className="max-w-[1440px] mx-auto px-8 py-8">

                {/* Page Header */}
                <div className="flex items-end justify-between mb-7">
                    <div>
                        <h1 className="text-[32px] text-[#111827] mb-1.5" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Explore
                        </h1>
                        <p className="text-[#6B7280] text-[15px]">
                            Discover courses, learning paths, and skills tailored to your goals.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        {user?.roleName?.toLowerCase() === 'learner' && (
                            <>
                                <button onClick={() => navigate('/learner/my-learning')} className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                                    View My Learning
                                </button>
                                <button onClick={() => navigate('/learner/my-learning')} className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                    <Play className="w-4 h-4 fill-white" />
                                    Continue Learning
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Hero Discovery */}
                <section className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#FFF1F2] to-white p-7 mb-8">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#E11D48]/5 blur-3xl pointer-events-none" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#E11D48]" />
                            <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Discover Your Next Skill</span>
                        </div>
                        <h2 className="text-[26px] text-[#111827] mb-4" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                            What do you want to learn today?
                        </h2>

                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                            <input
                                placeholder="Try “Spring Boot”, “Frontend Roadmap”, or “SQL”"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-32 py-4 bg-white border border-[#E5E7EB] rounded-xl text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] shadow-sm"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                Search
                            </button>
                        </div>
                    </div>
                </section>

                {/* Tabs */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 p-1 bg-white border border-[#E5E7EB] rounded-lg">
                        {([
                            { id: 'all', label: 'All' },
                            { id: 'paths', label: 'Learning Paths' },
                            { id: 'courses', label: 'Courses' },
                        ] as { id: Tab; label: string }[]).map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`px-3.5 py-1.5 text-sm rounded-md transition-colors ${tab === t.id ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:text-[#111827]'
                                    }`}
                                style={{ fontWeight: 500 }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-9">
                    {/* Featured Paths */}
                    {(tab === 'all' || tab === 'paths') && (
                        <section>
                            <SectionHeader 
                                title="Featured Learning Paths" 
                                subtitle="Curated career-focused journeys" 
                                actionLabel={tab === 'all' ? "View All" : ""} 
                                onAction={() => setTab('paths')}
                            />
                            {isLoading ? (
                                <div className="grid grid-cols-3 gap-4 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {(tab === 'all' ? learningPaths.slice(0, 3) : learningPaths).map((path, index) => {
                                        const colors = ['#E11D48', '#6366F1', '#8B5CF6', '#10B981'];
                                        const pathCourses = path.learningPathCourses || [];
                                        
                                        // Check if user is enrolled in at least one course in the path
                                        const userEnrolledInPath = pathCourses.some(pc => isEnrolled(pc.courseId));
                                        
                                        // Calculate personal completion rate
                                        const completedInPath = pathCourses.filter(pc =>
                                            enrollments.some(e => e.course?.courseId === pc.courseId && (e.status === 'completed' || e.progress === 100))
                                        ).length;
                                        const personalProgress = pathCourses.length > 0
                                            ? Math.round((completedInPath / pathCourses.length) * 100)
                                            : 0;

                                        return (
                                            <PathCard
                                                key={path.learningPathId}
                                                learningPathId={path.learningPathId}
                                                title={path.title}
                                                description={path.description || 'Step-by-step master curriculum.'}
                                                courses={pathCourses.length}
                                                duration="35h"
                                                difficulty={path.level}
                                                enrolled="1,250"
                                                completion={75}
                                                accent={colors[index % colors.length]}
                                                isPathEnrolled={userEnrolledInPath}
                                                personalProgress={personalProgress}
                                                onEnroll={() => handleEnrollPath(path)}
                                            />
                                        );
                                    })}
                                    {learningPaths.length === 0 && (
                                        <p className="text-sm text-slate-500 col-span-3 py-6 text-center">No learning paths found.</p>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Trending Courses / Catalog */}
                    {(tab === 'all' || tab === 'courses') && (
                        <section>
                            <SectionHeader 
                                title="Trending Courses" 
                                subtitle="What learners are taking this week" 
                                actionLabel={tab === 'all' ? "View All" : ""} 
                                onAction={() => setTab('courses')}
                            />
                            {isLoading ? (
                                <div className="grid grid-cols-5 gap-4 animate-pulse">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-56 bg-slate-100 rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-5 gap-4">
                                    {(tab === 'all' ? filteredCourses.slice(0, 5) : filteredCourses).map((course, index) => {
                                        const difficultyLevel = getCourseLevel(course);
                                        return (
                                            <CourseCard
                                                key={course.courseId}
                                                title={course.title}
                                                provider={course.user?.fullName || "Senior Instructor"}
                                                rating={4.8}
                                                students="8.5k"
                                                duration={`${course.duration || 8}h`}
                                                difficulty={difficultyLevel}
                                                tags={[course.language || 'English']}
                                                thumb={getCourseGradient(index)}
                                                badge={index === 0 ? "Popular" : index === 1 ? "Trending" : undefined}
                                                isEnrolled={isEnrolled(course.courseId)}
                                                onEnroll={() => handleEnroll(course.courseId)}
                                                enrolling={enrollingId === course.courseId}
                                            />
                                        );
                                    })}
                                    {filteredCourses.length === 0 && (
                                        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 flex flex-col items-center text-center col-span-5">
                                            <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mb-4">
                                                <Search className="w-6 h-6 text-[#9CA3AF]" />
                                            </div>
                                            <h3 className="text-[16px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>No results found</h3>
                                            <p className="text-sm text-[#6B7280] mb-5 max-w-sm">Try changing your filters or searching another keyword.</p>
                                            <button onClick={() => { setSearchTerm(''); setSelectedLanguage('all'); }} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                                Reset Filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

function SectionHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction?: () => void }) {
    return (
        <div className="flex items-end justify-between mb-4">
            <div>
                <h2 className="text-[18px] text-[#111827]" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>
            </div>
            {actionLabel && (
                <button onClick={onAction} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors" style={{ fontWeight: 500 }}>
                    {actionLabel}
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function RecommendCard({ courseId, title, type, match, reason, difficulty, duration, accent, Icon, isEnrolled, onEnroll, enrolling }: {
    courseId: number; title: string; type: 'Course' | 'Path'; match: number; reason: string; difficulty: string; duration: string; accent: string; Icon: React.ComponentType<{ className?: string }>;
    isEnrolled: boolean; onEnroll: () => void; enrolling: boolean;
}) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all">
            <div className="h-24 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                <Icon className="w-9 h-9 text-white" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/95 text-[10px] rounded" style={{ color: accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{type}</span>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-[#111827]/80 backdrop-blur text-white text-[10px] rounded" style={{ fontWeight: 600 }}>
                    <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                    {match}% match
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-[14px] text-[#111827] mb-1 font-bold line-clamp-1">{title}</h3>
                <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{reason}</p>
                <div className="flex items-center gap-1.5 mb-3">
                    <DifficultyBadge level={difficulty} />
                    <span className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <Clock className="w-3 h-3" />
                        {duration}
                    </span>
                </div>
                {isEnrolled ? (
                    <div className="w-full text-center py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                        Enrolled
                    </div>
                ) : (
                    <button
                        onClick={onEnroll}
                        disabled={enrolling}
                        className="w-full py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll'}
                    </button>
                )}
            </div>
        </div>
    );
}

function CategoryCard({ Icon, title, courses, paths, accent }: { Icon: React.ComponentType<{ className?: string }>; title: string; courses: number; paths: number; accent?: boolean }) {
    return (
        <button className={`text-left p-4 rounded-2xl border bg-white hover:shadow-sm transition-all ${accent ? 'border-[#E11D48]/30 bg-gradient-to-br from-white to-[#FFF1F2]' : 'border-[#E5E7EB] hover:border-[#E11D48]/20'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent ? 'bg-[#E11D48] text-white' : 'bg-[#F8FAFC] text-[#111827]'
                }`}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>{title}</h3>
            <p className="text-xs text-[#6B7280]">
                <span className={accent ? 'text-[#E11D48]' : ''} style={{ fontWeight: 600 }}>{courses}</span> courses · {paths} paths
            </p>
        </button>
    );
}

function PathCard({ learningPathId, title, description, courses, duration, difficulty, enrolled, completion, accent, isPathEnrolled, personalProgress, onEnroll }: {
    learningPathId: number; title: string; description: string; courses: number; duration: string; difficulty: string; enrolled: string; completion: number; accent: string;
    isPathEnrolled: boolean; personalProgress: number; onEnroll: () => void;
}) {
    const navigate = useNavigate();
    const showProgress = isPathEnrolled ? personalProgress : completion;
    const progressLabel = isPathEnrolled ? 'My Progress' : 'Avg. Completion';

    const segments = window.location.pathname.split('/');
    const rolePrefix = segments[1];
    const isDashboardRoute = ['learner', 'provider', 'admin', 'academic'].includes(rolePrefix);
    const detailUrl = isDashboardRoute
        ? `/${rolePrefix}/learning-path/${learningPathId}`
        : `/learning-path/${learningPathId}`;

    return (
        <div 
            onClick={() => navigate(detailUrl)} 
            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all flex flex-col justify-between cursor-pointer"
        >
            <div>
                <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                    <div className="absolute inset-0 flex items-center justify-center gap-2 px-6">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                {i < 4 && <div className="w-8 h-px bg-white/60" />}
                            </div>
                        ))}
                    </div>
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] rounded capitalize" style={{ color: accent, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                        {difficulty}
                    </span>
                </div>
                <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-[15px] text-[#111827]" style={{ fontWeight: 600 }}>{title}</h3>
                    </div>
                    <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mb-3">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{courses} courses</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-[#6B7280]" style={{ fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{progressLabel}</span>
                                <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{showProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${isPathEnrolled ? 'bg-[#E11D48]' : 'bg-[#10B981]'}`} style={{ width: `${showProgress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); navigate(detailUrl); }}
                    className="flex-1 py-2 bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors text-center"
                >
                    View Detail
                </button>
                {isPathEnrolled && personalProgress === 100 ? (
                    <div className="flex-1 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 text-center flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        Completed ✓
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEnroll(); }}
                        className="flex-1 py-2 bg-[#E11D48] text-white hover:bg-[#BE123C] text-xs font-semibold rounded-lg transition-colors text-center"
                    >
                        {isPathEnrolled ? 'Resume Path' : 'Enroll Path'}
                    </button>
                )}
            </div>
        </div>
    );
}

function CourseCard({ title, provider, rating, students, duration, difficulty, tags, thumb, badge, isEnrolled, onEnroll, enrolling }: {
    title: string; provider: string; rating: number; students: string; duration: string; difficulty: string; tags: string[]; thumb: string; badge?: string;
    isEnrolled: boolean; onEnroll: () => void; enrolling: boolean;
}) {
    const badgeMap: Record<string, { color: string; tint: string }> = {
        Popular: { color: '#E11D48', tint: '#FEF2F2' },
        Trending: { color: '#F59E0B', tint: '#FFFBEB' },
        New: { color: '#0EA5E9', tint: '#F0F9FF' },
        Recommended: { color: '#10B981', tint: '#ECFDF5' },
    };
    const b = badge ? badgeMap[badge] : null;
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all flex flex-col justify-between">
            <div>
                <div className={`h-28 relative bg-gradient-to-br ${thumb} flex items-center justify-center`}>
                    <BookOpen className="w-9 h-9 text-white" />
                    {b && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px]" style={{ background: b.tint, color: b.color, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{badge}</span>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-[14px] text-[#111827] mb-1 line-clamp-1" style={{ fontWeight: 600 }}>{title}</h3>
                    <p className="text-xs text-[#6B7280] mb-2">{provider}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-3">
                        <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                            <span className="text-[#111827]" style={{ fontWeight: 600 }}>{rating}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{students}</span>
                        <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <DifficultyBadge level={difficulty} />
                        {tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 text-[10px] bg-[#F8FAFC] text-[#6B7280] rounded capitalize" style={{ fontWeight: 500 }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 pt-0">
                {isEnrolled ? (
                    <div className="w-full text-center py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                        Already Enrolled
                    </div>
                ) : (
                    <button
                        onClick={onEnroll}
                        disabled={enrolling}
                        className="w-full py-2 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] disabled:bg-slate-200 disabled:text-slate-400 transition-colors font-semibold"
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll'}
                    </button>
                )}
            </div>
        </div>
    );
}

function DifficultyBadge({ level }: { level: string }) {
    const map: Record<string, { tint: string; color: string }> = {
        Beginner: { tint: '#ECFDF5', color: '#047857' },
        Intermediate: { tint: '#FFFBEB', color: '#B45309' },
        Advanced: { tint: '#FEF2F2', color: '#B91C1C' },
    };
    const m = map[level] || map.Beginner;
    return (
        <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: m.tint, color: m.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {level}
        </span>
    );
}

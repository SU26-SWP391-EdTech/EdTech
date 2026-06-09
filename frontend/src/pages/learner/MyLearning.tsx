import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Bell, Flame, ChevronRight, BookOpen, Route, Award, GraduationCap,
    Play, Clock, TrendingUp, CheckCircle2, Circle, Bookmark, BookmarkX,
    Target, Trophy, Zap, Calendar, ArrowUpRight, Filter, MoreHorizontal,
    FileText, Sparkles, Layers, ChevronDown, BarChart3, ChevronLeft, ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.stores';
import { getMyEnrollments } from '../../services/enrollment/enrollment.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import { getLearningPaths } from '../../services/learning-path/learning-path.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

type Tab = 'all' | 'in-progress' | 'completed' | 'saved' | 'archived';

export function MyLearning() {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<'dashboard' | 'all-paths' | 'all-courses'>('dashboard');
    const [tab, setTab] = useState<Tab>('all');
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'recent' | 'progress-high' | 'progress-low'>('recent');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);
                // ── MOCK PROGRESS FETCHING (TRÁNH LỖI 429 VÀ ĐỒC LẬP BACKEND) ─────────────────
                // Để loại bỏ các cuộc gọi API liên tiếp khi chuyển trang gây lỗi 429,
                // chúng ta lấy dữ liệu lộ trình học mặc định từ data.ts và đồng bộ danh sách khóa học
                // đã đăng ký từ sessionStorage (được cập nhật khi người dùng nhấn Đăng ký ở ExplorePage).
                /* Tạm thời comment API để tránh lỗi 429
                const [enrollmentData, pathData] = await Promise.all([
                    getMyEnrollments(),
                    getLearningPaths(),
                ]);
                setEnrollments(enrollmentData);
                setLearningPaths(pathData);
                */

                // Thay thế bằng Mock Data
                const { MOCK_LEARNING_PATHS, MOCK_ENROLLMENTS } = await import('../../db/data');
                const storedEnrollments = sessionStorage.getItem('explore_cache_enrollments');

                setEnrollments(storedEnrollments ? JSON.parse(storedEnrollments) : MOCK_ENROLLMENTS);
                setLearningPaths(MOCK_LEARNING_PATHS);

            } catch (err: any) {
                console.error('Failed to fetch learning progress:', err);
                setError('Failed to load learning progress. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }
        if (user) {
            fetchData();
        }
    }, [user]);

    function timeAgo(dateString?: string | null): string {
        if (!dateString) return 'Never';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins || 1}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#6B7280] font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Calculations
    const inProgressCourses = enrollments.filter(e => e.status === 'active' && e.progress < 100);
    const completedCourses = enrollments.filter(e => e.status === 'completed' || e.progress === 100);

    // Latest accessed active enrollment for Continue Learning highlight
    const latestActiveEnrollment = [...enrollments]
        .filter(e => e.status === 'active')
        .sort((a, b) => {
            const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
            const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
            return dateB - dateA;
        })[0];

    const displayEnrollment = latestActiveEnrollment || enrollments[0];

    let parentPathTitle = 'Individual Course';
    if (displayEnrollment) {
        const parentPath = learningPaths.find(p =>
            p.learningPathCourses?.some(lpc => lpc.courseId === displayEnrollment.course.courseId)
        );
        if (parentPath) {
            parentPathTitle = parentPath.title;
        }
    }

    // Filtered enrollments for the main tabs
    const filteredEnrollments = enrollments.filter(e => {
        if (tab === 'all') return true;
        if (tab === 'in-progress') return e.status === 'active' && e.progress < 100;
        if (tab === 'completed') return e.status === 'completed' || e.progress === 100;
        if (tab === 'archived') return e.status === 'cancelled' || e.status === 'expired';
        return true; // fallback for 'saved'
    });

    const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
        if (sortBy === 'progress-high') {
            return b.progress - a.progress;
        }
        if (sortBy === 'progress-low') {
            return a.progress - b.progress;
        }
        // Default to 'recent' (lastAccessedAt)
        const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        return dateB - dateA;
    });

    const getPathAccent = (level: string) => {
        const lvl = level.toLowerCase();
        if (lvl === 'beginner') return '#F59E0B'; // Amber
        if (lvl === 'intermediate') return '#E11D48'; // Rose
        return '#8B5CF6'; // Purple
    };

    const getCourseGradient = (index: number) => {
        const gradients = [
            'from-[#F59E0B] to-[#D97706]',
            'from-[#E11D48] to-[#BE123C]',
            'from-[#10B981] to-[#059669]',
            'from-[#6366F1] to-[#4F46E5]',
            'from-[#3B82F6] to-[#2563EB]',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <main className="max-w-[1440px] mx-auto px-8 py-8">
                {activeView === 'dashboard' && (
                    <>
                        {/* Page Header */}
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h1 className="text-[32px] text-[#111827] mb-1.5" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                                    My Learning
                                </h1>
                                <p className="text-[#6B7280] text-[15px]">
                                    Track your enrolled courses, learning paths, progress, and saved content.
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => navigate('/learner/explore')}
                                    className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors"
                                    style={{ fontWeight: 500 }}
                                >
                                    Explore More
                                </button>
                                {displayEnrollment && (
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                        <Play className="w-4 h-4 fill-white" />
                                        Continue Learning
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <StatCard icon={<BookOpen className="w-4 h-4" />} label="Courses in Progress" value={inProgressCourses.length.toString()} delta={`${inProgressCourses.length} active`} color="#E11D48" tint="#FEF2F2" />
                            <StatCard icon={<Route className="w-4 h-4" />} label="Learning Paths Enrolled" value={learningPaths.length.toString()} delta={`${learningPaths.length} active`} color="#F59E0B" tint="#FFFBEB" />
                            <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Completed Courses" value={completedCourses.length.toString()} delta={`${completedCourses.length} done`} color="#10B981" tint="#ECFDF5" />
                        </div>

                        {/* Main grid */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left content */}
                            <div className="col-span-12 space-y-8">
                                {/* Continue Learning Highlight */}
                                <section>
                                    {displayEnrollment ? (
                                        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#FFF1F2]">
                                            <div className="grid grid-cols-5">
                                                <div className="col-span-2 relative bg-gradient-to-br from-[#1F2937] to-[#111827] p-6 flex flex-col justify-between min-h-[260px]">
                                                    <div>
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur text-white text-[11px] rounded-md" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                                                            {displayEnrollment.status === 'active' ? 'Now Playing' : 'Review'}
                                                        </span>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/25 transition-colors">
                                                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <p className="text-white/60 text-xs mb-1" style={{ fontWeight: 500 }}>
                                                            Lesson {Math.round(displayEnrollment.course.totalLessons * (displayEnrollment.progress / 100))} of {displayEnrollment.course.totalLessons}
                                                        </p>
                                                        <p className="text-white text-sm truncate" style={{ fontWeight: 500 }}>
                                                            {displayEnrollment.course.title}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-span-3 p-6 flex flex-col">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Route className="w-3.5 h-3.5 text-[#E11D48]" />
                                                        <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600 }}>{parentPathTitle}</span>
                                                    </div>
                                                    <h2 className="text-[22px] text-[#111827] mb-1 truncate" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                                                        {displayEnrollment.course.title}
                                                    </h2>
                                                    <p className="text-sm text-[#6B7280] mb-5 line-clamp-2">
                                                        {displayEnrollment.course.description || 'Master this course with comprehensive materials.'}
                                                    </p>

                                                    <div className="mb-5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-[#6B7280]" style={{ fontWeight: 500 }}>Course progress</span>
                                                            <span className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>{displayEnrollment.progress}%</span>
                                                        </div>
                                                        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-[#E11D48] to-[#F43F5E] rounded-full" style={{ width: `${displayEnrollment.progress}%` }} />
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280]">
                                                            <span className="flex items-center gap-1.5">
                                                                <BookOpen className="w-3.5 h-3.5" />
                                                                {displayEnrollment.course.totalLessons - Math.round(displayEnrollment.course.totalLessons * (displayEnrollment.progress / 100))} lessons left
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {Math.round(displayEnrollment.course.duration * (1 - displayEnrollment.progress / 100))}h remaining
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-auto">
                                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                                            <Play className="w-4 h-4 fill-white" />
                                                            {displayEnrollment.status === 'completed' ? 'Review Course' : 'Continue Lesson'}
                                                        </button>
                                                        <button className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                                                            View Course
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#FFF1F2] p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
                                            <Sparkles className="w-10 h-10 text-[#E11D48] mb-3 animate-pulse" />
                                            <h2 className="text-xl font-bold text-[#111827] mb-1">Start Your Learning Journey</h2>
                                            <p className="text-sm text-[#6B7280] max-w-md mb-6">
                                                You are not enrolled in any courses yet. Explore our curated courses and roadmap to begin learning.
                                            </p>
                                            <button
                                                onClick={() => navigate('/learner/explore')}
                                                className="px-6 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors font-medium"
                                            >
                                                Browse Courses
                                            </button>
                                        </div>
                                    )}
                                </section>

                                {/* My Learning Paths */}
                                <section>
                                    <SectionHeader
                                        title="My Learning Paths"
                                        subtitle={`${learningPaths.length} paths available`}
                                        actionLabel="View all"
                                        onAction={() => { setActiveView('all-paths'); window.scrollTo(0, 0); }}
                                    />
                                    <div className="grid grid-cols-3 gap-4">
                                        {learningPaths.slice(0, 3).map((path) => {
                                            const pathCourses = path.learningPathCourses || [];
                                            const completedInPath = pathCourses.filter(pc =>
                                                completedCourses.some(e => e.course.courseId === pc.courseId)
                                            ).length;
                                            const progress = pathCourses.length > 0
                                                ? Math.round((completedInPath / pathCourses.length) * 100)
                                                : 0;
                                            const remainingHours = pathCourses
                                                .filter(pc => !completedCourses.some(e => e.course.courseId === pc.courseId))
                                                .reduce((sum, pc) => sum + (pc.course?.duration || 0), 0);

                                            const isAnyStarted = pathCourses.some(pc =>
                                                enrollments.some(e => e.course.courseId === pc.courseId)
                                            );
                                            const status = progress === 100 ? 'completed' : (isAnyStarted ? 'in-progress' : 'not-started');

                                            return (
                                                <PathCard
                                                    key={path.learningPathId}
                                                    title={path.title}
                                                    description={path.description || 'Curated roadmap to guide your learning.'}
                                                    progress={progress}
                                                    coursesDone={completedInPath}
                                                    coursesTotal={pathCourses.length}
                                                    remaining={`${remainingHours}h`}
                                                    difficulty={path.level.charAt(0).toUpperCase() + path.level.slice(1)}
                                                    status={status}
                                                    accent={getPathAccent(path.level)}
                                                    onClick={() => navigate(`/learner/learning-path/${path.learningPathId}`)}
                                                />
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Enrolled Courses */}
                                <section>
                                    <SectionHeader
                                        title="Enrolled Courses"
                                        subtitle={`${filteredEnrollments.length} courses`}
                                        actionLabel="See all courses"
                                        onAction={() => { setActiveView('all-courses'); window.scrollTo(0, 0); }}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        {sortedEnrollments.length > 0 ? (
                                            sortedEnrollments.slice(0, 4).map((enrollment, index) => {
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
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 text-center py-12 bg-white border border-[#E5E7EB] rounded-2xl">
                                                <p className="text-sm text-[#6B7280]">No courses found for this tab.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </>
                )}

                {activeView === 'all-paths' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => { setActiveView('dashboard'); window.scrollTo(0, 0); }}
                            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>

                        <div>
                            <h1 className="text-[32px] text-[#111827] mb-1.5 font-bold animate-fade-in" style={{ letterSpacing: '-0.02em' }}>
                                My Learning Paths
                            </h1>
                            <p className="text-[#6B7280] text-[15px]">
                                All learning paths you have registered to learn.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4">
                            {learningPaths.map((path) => {
                                const pathCourses = path.learningPathCourses || [];
                                const completedInPath = pathCourses.filter(pc =>
                                    completedCourses.some(e => e.course.courseId === pc.courseId)
                                ).length;
                                const progress = pathCourses.length > 0
                                    ? Math.round((completedInPath / pathCourses.length) * 100)
                                    : 0;
                                const remainingHours = pathCourses
                                    .filter(pc => !completedCourses.some(e => e.course.courseId === pc.courseId))
                                    .reduce((sum, pc) => sum + (pc.course?.duration || 0), 0);

                                const isAnyStarted = pathCourses.some(pc =>
                                    enrollments.some(e => e.course.courseId === pc.courseId)
                                );
                                const status = progress === 100 ? 'completed' : (isAnyStarted ? 'in-progress' : 'not-started');

                                return (
                                    <PathCard
                                        key={path.learningPathId}
                                        title={path.title}
                                        description={path.description || 'Curated roadmap to guide your learning.'}
                                        progress={progress}
                                        coursesDone={completedInPath}
                                        coursesTotal={pathCourses.length}
                                        remaining={`${remainingHours}h`}
                                        difficulty={path.level.charAt(0).toUpperCase() + path.level.slice(1)}
                                        status={status}
                                        accent={getPathAccent(path.level)}
                                        onClick={() => navigate(`/learner/learning-path/${path.learningPathId}`)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeView === 'all-courses' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => { setActiveView('dashboard'); window.scrollTo(0, 0); }}
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
                )}
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, delta, color, tint }: { icon: React.ReactNode; label: string; value: string; delta: string; color: string; tint: string }) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: tint, color }}>
                    {icon}
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color, fontWeight: 600 }}>
                    <TrendingUp className="w-3 h-3" />
                    {delta}
                </div>
            </div>
            <div className="text-[28px] text-[#111827]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
            <div className="text-xs text-[#6B7280] mt-1">{label}</div>
        </div>
    );
}

function FilterChip({ label }: { label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:text-[#111827] transition-colors" style={{ fontWeight: 500 }}>
            {label}
            <ChevronDown className="w-3.5 h-3.5" />
        </button>
    );
}

function SectionHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction?: () => void }) {
    return (
        <div className="flex items-end justify-between mb-4">
            <div>
                <h2 className="text-[18px] text-[#111827]" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>
            </div>
            <button onClick={onAction} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors" style={{ fontWeight: 500 }}>
                {actionLabel}
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

type PathStatus = 'in-progress' | 'completed' | 'saved' | 'not-started';
function PathCard({ title, description, progress, coursesDone, coursesTotal, remaining, difficulty, status, accent, onClick }: {
    title: string; description: string; progress: number; coursesDone: number; coursesTotal: number; remaining: string; difficulty: string; status: PathStatus; accent: string; onClick?: () => void;
}) {
    const statusMap: Record<PathStatus, { label: string; tint: string; color: string }> = {
        'in-progress': { label: 'In Progress', tint: '#FFFBEB', color: '#B45309' },
        completed: { label: 'Completed', tint: '#ECFDF5', color: '#047857' },
        saved: { label: 'Saved', tint: '#F1F5F9', color: '#475569' },
        'not-started': { label: 'Not Started', tint: '#F8FAFC', color: '#6B7280' },
    };
    const s = statusMap[status];
    return (
        <div onClick={onClick} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all cursor-pointer">
            <div className="h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                <div className="absolute inset-0 flex items-center justify-center gap-2 px-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${i < Math.round((progress / 100) * 4) ? 'bg-white' : 'bg-white/30'}`} />
                            {i < 3 && <div className={`w-6 h-px ${i < Math.round((progress / 100) * 4) - 1 ? 'bg-white' : 'bg-white/30'}`} />}
                        </div>
                    ))}
                </div>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] rounded" style={{ color: accent, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    {difficulty}
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: s.tint, color: s.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{s.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1 -m-1 text-[#9CA3AF] hover:text-[#111827]"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <h3 className="text-[15px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>{title}</h3>
                <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{description}</p>
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-[#6B7280]">{coursesDone}/{coursesTotal} courses</span>
                        <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: accent }} />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mb-3">
                    <Clock className="w-3 h-3" />
                    {remaining} remaining
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="flex-1 py-1.5 bg-[#111827] text-white rounded-lg text-xs hover:bg-black transition-colors" style={{ fontWeight: 500 }}>
                        {status === 'saved' || status === 'not-started' ? 'Start Path' : 'Continue Path'}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-xs hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                        Roadmap
                    </button>
                </div>
            </div>
        </div>
    );
}

type CourseStatus = 'in-progress' | 'completed' | 'not-started' | 'archived';
function CourseCard({ title, provider, category, duration, done, total, progress, lastAccessed, status, thumb }: {
    title: string; provider: string; category: string; duration: string; done: number; total: number; progress: number; lastAccessed: string; status: CourseStatus; thumb: string;
}) {
    const statusMap: Record<CourseStatus, { label: string; tint: string; color: string }> = {
        'in-progress': { label: 'In Progress', tint: '#FFFBEB', color: '#B45309' },
        completed: { label: 'Completed', tint: '#ECFDF5', color: '#047857' },
        'not-started': { label: 'Not Started', tint: '#F8FAFC', color: '#6B7280' },
        archived: { label: 'Archived', tint: '#F1F5F9', color: '#475569' },
    };
    const s = statusMap[status];
    const cta = status === 'completed' ? 'View Certificate' : status === 'archived' ? 'Review' : 'Continue';
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex gap-4 hover:shadow-md hover:border-[#E11D48]/20 transition-all">
            <div className={`flex-shrink-0 w-[88px] h-[88px] rounded-xl bg-gradient-to-br ${thumb} flex items-center justify-center`}>
                <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[14px] text-[#111827] line-clamp-1" style={{ fontWeight: 600 }}>{title}</h3>
                    <span className="px-1.5 py-0.5 text-[10px] rounded whitespace-nowrap" style={{ background: s.tint, color: s.color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-2">
                    <span>{provider}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                    <span>{category}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                    <span>{duration}</span>
                </div>
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#6B7280]">{done}/{total} lessons</span>
                        <span className="text-[11px] text-[#111827]" style={{ fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${status === 'completed' ? 'bg-[#10B981]' : 'bg-[#E11D48]'}`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[11px] text-[#9CA3AF]">Last accessed {lastAccessed}</span>
                    <button className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${status === 'completed' ? 'bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]' : 'bg-[#111827] text-white hover:bg-black'
                        }`} style={{ fontWeight: 500 }}>
                        {cta}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ icon, color, tint, title, desc, time }: { icon: React.ReactNode; color: string; tint: string; title: string; desc: string; time: string }) {
    return (
        <div className="relative flex items-start gap-4">
            <div className="relative z-10 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center" style={{ background: tint, color }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>{title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
            </div>
            <span className="text-xs text-[#9CA3AF] pt-1 whitespace-nowrap">{time}</span>
        </div>
    );
}

function ProgressRing({ percent }: { percent: number }) {
    const r = 32;
    const c = 2 * Math.PI * r;
    const offset = c - (percent / 100) * c;
    return (
        <div className="relative w-[80px] h-[80px]">
            <svg viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r={r} stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle cx="40" cy="40" r={r} stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-[#111827]" style={{ fontWeight: 700 }}>{percent}%</span>
            </div>
        </div>
    );
}

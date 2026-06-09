import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Play, ChevronRight, BookOpen, Route, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.stores';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

import StatCard from '../../components/learner/MyLearning/StatCard';
import PathCard from '../../components/learner/MyLearning/PathCard';
import CourseCard from '../../components/learner/MyLearning/CourseCard';
import ContinueHighlight from '../../components/learner/MyLearning/ContinueHighlight';
import AllPathsView from '../../components/learner/MyLearning/AllPathsView';
import AllCoursesView from '../../components/learner/MyLearning/AllCoursesView';

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

    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);
                
                // Load dynamic mock data and sessionStorage cache
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
        return true;
    });

    const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
        if (sortBy === 'progress-high') {
            return b.progress - a.progress;
        }
        if (sortBy === 'progress-low') {
            return a.progress - b.progress;
        }
        const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        return dateB - dateA;
    });

    const getPathAccent = (level: string) => {
        const lvl = level.toLowerCase();
        if (lvl === 'beginner') return '#F59E0B';
        if (lvl === 'intermediate') return '#E11D48';
        return '#8B5CF6';
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
                                    <button 
                                        onClick={() => navigate('/learner/explore')}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" 
                                        style={{ fontWeight: 500 }}
                                    >
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
                            <div className="col-span-12 space-y-8">
                                {/* Continue Learning Highlight */}
                                <section>
                                    <ContinueHighlight
                                        displayEnrollment={displayEnrollment}
                                        parentPathTitle={parentPathTitle}
                                        onContinueClick={() => navigate('/learner/explore')}
                                        onViewCourseClick={() => navigate('/learner/explore')}
                                        onBrowseClick={() => navigate('/learner/explore')}
                                    />
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
                                                        onCtaClick={() => navigate('/learner/explore')}
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
                    <AllPathsView
                        learningPaths={learningPaths}
                        completedCourses={completedCourses}
                        enrollments={enrollments}
                        getPathAccent={getPathAccent}
                        onBack={() => { setActiveView('dashboard'); window.scrollTo(0, 0); }}
                        onPathClick={(pathId) => navigate(`/learner/learning-path/${pathId}`)}
                    />
                )}

                {activeView === 'all-courses' && (
                    <AllCoursesView
                        sortedEnrollments={sortedEnrollments}
                        tab={tab}
                        setTab={setTab}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        timeAgo={timeAgo}
                        getCourseGradient={getCourseGradient}
                        onBack={() => { setActiveView('dashboard'); window.scrollTo(0, 0); }}
                        onCtaClick={() => navigate('/learner/explore')}
                    />
                )}
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
            <button onClick={onAction} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors" style={{ fontWeight: 500 }}>
                {actionLabel}
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.stores';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../../services/learning-path/learning-path.service';

type Tab = 'all' | 'in-progress' | 'completed' | 'saved' | 'archived';

export function useMyLearning() {
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
                const { MOCK_LEARNING_PATHS, MOCK_ENROLLMENTS } = await import('../../../db/data');
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

    const inProgressCourses = enrollments.filter(e => e.status === 'active' && e.progress < 100);
    const completedCourses = enrollments.filter(e => e.status === 'completed' || e.progress === 100);

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

    return {
        navigate,
        activeView,
        setActiveView,
        tab,
        setTab,
        enrollments,
        learningPaths,
        isLoading,
        error,
        sortBy,
        setSortBy,
        timeAgo,
        inProgressCourses,
        completedCourses,
        displayEnrollment,
        parentPathTitle,
        filteredEnrollments,
        sortedEnrollments,
        getPathAccent,
        getCourseGradient,
    };
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { searchCourses } from '../../services/course/course.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import { getLearningPaths, followLearningPath, unfollowLearningPath, getFollowedLearningPathIds } from '../../services/learning-path/learning-path.service';
import type { Course } from '../../services/course/course.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

type Tab = 'all' | 'courses' | 'paths' | 'recommended' | 'saved';

export function useExplore() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as Tab | null;

    const user = useAuthStore((state) => state.user);

    const [tab, setTab] = useState<Tab>('all');
    const [courses, setCourses] = useState<Course[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [enrolledPathIds, setEnrolledPathIds] = useState<number[]>([]);
    const [followedPathIds, setFollowedPathIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState<number | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('all');

    async function loadData() {
        try {
            setIsLoading(true);
 
            const [coursesRes, pathsRes] = await Promise.all([
                searchCourses({ status: 'approved' }),
                getLearningPaths(),
            ]);

            const coursesData = coursesRes.data?.items || [];
            setCourses(coursesData);
            setLearningPaths(pathsRes);

            const isLearner = user?.roleName?.toLowerCase() === 'learner';
            if (user && isLearner) {
                const [enrollmentsData, followedIds] = await Promise.all([
                    getMyEnrollments(),
                    getFollowedLearningPathIds(),
                ]);
                setEnrollments(enrollmentsData);
                setFollowedPathIds(followedIds);

                // Determine enrolled path IDs dynamically: user is enrolled in path if they are enrolled in at least one course of the path
                const enrolledPaths = pathsRes.filter(path => {
                    const pathCourses = path.learningPathCourses || [];
                    if (pathCourses.length === 0) return false;
                    return pathCourses.some(pc =>
                        enrollmentsData.some(e => e.course?.courseId === pc.courseId)
                    );
                }).map(p => p.learningPathId);

                setEnrolledPathIds(enrolledPaths);

            } else {
                setEnrollments([]);
                setEnrolledPathIds([]);
                setFollowedPathIds([]);
            }
        } catch (error) {
            console.error('Failed to load explore data:', error);
            toast.error('Failed to load courses.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        if (tabParam && ['all', 'courses', 'paths', 'recommended', 'saved'].includes(tabParam)) {
            setTab(tabParam);
        }
    }, [tabParam]);

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
            await enrollCourse(courseId);
            toast.success('Successfully enrolled in course!');
            await loadData();
        } catch (error: any) {
            console.error('Enrollment error:', error);
            toast.error(error.response?.data?.message || 'Failed to enroll.');
        } finally {
            setEnrollingId(null);
        }
    };

    const isEnrolled = (courseId: number) => {
        return enrollments.some(e => e.course?.courseId === courseId);
    };

    const handleFollow = async (learningPathId: number) => {
        if (!user) {
            toast.error('Please sign in to follow learning paths.');
            navigate('/login');
            return;
        }

        const role = user.roleName?.toLowerCase();
        if (role !== 'learner') {
            toast.error(`As a ${user.roleName}, you cannot follow learning paths.`);
            return;
        }

        try {
            await followLearningPath(learningPathId);
            toast.success('Followed learning path successfully!');
            await loadData();
        } catch (error: any) {
            console.error('Follow error:', error);
            toast.error(error.response?.data?.message || 'Failed to follow.');
        }
    };

    const handleUnfollow = async (learningPathId: number) => {
        if (!user) return;
        try {
            await unfollowLearningPath(learningPathId);
            toast.success('Unfollowed learning path successfully!');
            await loadData();
        } catch (error: any) {
            console.error('Unfollow error:', error);
            toast.error(error.response?.data?.message || 'Failed to unfollow.');
        }
    };


    // Filters
    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLanguage = selectedLanguage === 'all' ||
            (course.language && course.language.toLowerCase() === selectedLanguage.toLowerCase());

        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        const enrollmentStatus = isEnrolled(course.courseId);
        const matchesEnrollment = isLearner ? !enrollmentStatus : true;

        return matchesSearch && matchesLanguage && matchesEnrollment;
    });

    const filteredPaths = learningPaths.filter((path) => {
        const q = searchTerm.trim().toLowerCase();
        const pathCourses = path.learningPathCourses || [];

        const matchesSearch = !q ||
            path.title.toLowerCase().includes(q) ||
            (path.description || '').toLowerCase().includes(q) ||
            pathCourses.some(pc =>
                pc.course?.title?.toLowerCase().includes(q) ||
                (pc.course?.description || '').toLowerCase().includes(q) ||
                (pc.course?.language || '').toLowerCase().includes(q)
            );

        const matchesLanguage = selectedLanguage === 'all' ||
            pathCourses.some(pc => pc.course?.language?.toLowerCase() === selectedLanguage.toLowerCase());

        return matchesSearch && matchesLanguage;
    });

    const getCourseGradient = (index: number) => {
        const gradients = [
            'from-[#3B82F6] to-[#1D4ED8]', // Blue
            'from-[#10B981] to-[#047857]', // Emerald
            'from-[#EC4899] to-[#BE123C]', // Rose
            'from-[#8B5CF6] to-[#5B21B6]', // Purple
        ];
        return gradients[index % gradients.length];
    };

    return {
        tab,
        setTab,
        searchTerm,
        setSearchTerm,
        selectedLanguage,
        setSelectedLanguage,
        isLoading,
        enrollingId,
        filteredCourses,
        filteredPaths,
        enrollments,
        enrolledPathIds,
        followedPathIds,
        isEnrolled,
        handleEnroll,
        handleFollow,
        handleUnfollow,
        getCourseGradient,
        user,
    };
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { searchCourses } from '../../services/course/course.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import { getLearningPaths } from '../../services/learning-path/learning-path.service';
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
    const [isLoading, setIsLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState<number | null>(null);
    const [profile, setProfile] = useState<any>(null);

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
                const enrollmentsData = await getMyEnrollments();
                setEnrollments(enrollmentsData);

                // Determine enrolled path IDs dynamically: user is enrolled in path if they are enrolled in at least one course of the path
                const enrolledPaths = pathsRes.filter(path => {
                    const pathCourses = path.learningPathCourses || [];
                    if (pathCourses.length === 0) return false;
                    return pathCourses.some(pc =>
                        enrollmentsData.some(e => e.course?.courseId === pc.courseId)
                    );
                }).map(p => p.learningPathId);

                setEnrolledPathIds(enrolledPaths);

                setProfile({
                    fullName: user.fullName,
                    email: user.email,
                    streakCount: 0,
                    completedCourses: enrollmentsData.filter(e => e.status === 'completed' || e.progress === 100).length,
                    learningHours: enrollmentsData.reduce((acc, curr) => acc + Math.round((curr.course.duration || 10) * (curr.progress / 100)), 0),
                    enrolledPaths: enrolledPaths.length,
                });
            } else {
                setEnrollments([]);
                setEnrolledPathIds([]);
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

        // Sort courses by position to find the first course in the learning path
        const sortedPathCourses = [...pathCourses].sort((a, b) => a.position - b.position);
        const firstCourse = sortedPathCourses[0];

        if (isEnrolled(firstCourse.courseId)) {
            toast.success('You are already enrolled in the first course of this path!');
            return;
        }

        try {
            setIsLoading(true);
            await enrollCourse(firstCourse.courseId);
            toast.success(`Successfully enrolled in ${path.title}!`);
            await loadData();
        } catch (error: any) {
            console.error('Path enrollment error:', error);
            toast.error(error.response?.data?.message || 'Failed to enroll in path.');
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

        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        const enrollmentStatus = isEnrolled(course.courseId);
        const matchesEnrollment = isLearner ? !enrollmentStatus : true;

        return matchesSearch && matchesLanguage && matchesEnrollment;
    });

    const filteredPaths = learningPaths.filter((path) => {
        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        const userEnrolledInPath = enrolledPathIds.includes(path.learningPathId);
        return isLearner ? !userEnrolledInPath : true;
    });

    const getCourseLevel = (course: Course) => {
        for (const path of learningPaths) {
            if (path.learningPathCourses?.some(lpc => lpc.courseId === course.courseId)) {
                return path.level.charAt(0).toUpperCase() + path.level.slice(1);
            }
        }
        return 'Intermediate';
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
        isEnrolled,
        handleEnroll,
        handleEnrollPath,
        getCourseLevel,
        getCourseGradient,
        user,
    };
}

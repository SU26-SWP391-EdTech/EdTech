import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.stores';
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
            const { MOCK_COURSES, MOCK_LEARNING_PATHS, MOCK_ENROLLMENTS, MOCK_LEARNER_PROFILE_FULL } = await import('../../db/data');
            setCourses(MOCK_COURSES);
            setLearningPaths(MOCK_LEARNING_PATHS);
            
            const isLearner = user?.roleName?.toLowerCase() === 'learner';
            if (user && isLearner) {
                const isNewUser = !['learner@edtech.com', 'provider@edtech.com', 'manager@edtech.com', 'admin@edtech.com'].includes(user.email.toLowerCase());
                const storedEnrollments = sessionStorage.getItem('explore_cache_enrollments');
                setEnrollments(storedEnrollments ? JSON.parse(storedEnrollments) : (isNewUser ? [] : MOCK_ENROLLMENTS));
                
                const storedPaths = sessionStorage.getItem('explore_cache_enrolled_paths');
                setEnrolledPathIds(storedPaths ? JSON.parse(storedPaths) : (isNewUser ? [] : [1, 2]));

                if (isNewUser) {
                    setProfile({
                        fullName: user.fullName,
                        email: user.email,
                        streakCount: 0,
                        completedCourses: 0,
                        learningHours: 0,
                        enrolledPaths: 0,
                    });
                } else {
                    setProfile(MOCK_LEARNER_PROFILE_FULL);
                }
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

            const updatedPaths = [...enrolledPathIds, path.learningPathId];
            setEnrolledPathIds(updatedPaths);
            sessionStorage.setItem('explore_cache_enrolled_paths', JSON.stringify(updatedPaths));

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

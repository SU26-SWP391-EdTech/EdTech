import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getMyEnrollments } from '../../services/enrollment/enrollment.service';
import type { MyLearningCourse, MyLearningTab } from '../../types/learner/my-learning.types';
import {
    filterMyLearningCourses,
    getMyLearningStats,
    mapEnrollmentToMyLearningCourse,
} from '../../utils/learner/myLearningMappers';

export function useMyLearning() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<MyLearningTab>('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState<MyLearningCourse[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function loadEnrollments() {
            setIsLoading(true);

            try {
                const enrollments = await getMyEnrollments();
                if (!cancelled) {
                    setCourses(enrollments.map(mapEnrollmentToMyLearningCourse));
                }
            } catch (error: any) {
                console.error('Failed to load my learning:', error);
                if (!cancelled) {
                    toast.error(error.response?.data?.message || 'Failed to load your learning list.');
                    setCourses([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadEnrollments();

        return () => {
            cancelled = true;
        };
    }, []);

    const stats = useMemo(() => getMyLearningStats(courses), [courses]);

    const filteredCourses = useMemo(() => {
        const byTab = filterMyLearningCourses(courses, tab);
        const keyword = search.trim().toLowerCase();

        if (!keyword) return byTab;

        return byTab.filter(course => (
            course.title.toLowerCase().includes(keyword) ||
            course.language.toLowerCase().includes(keyword)
        ));
    }, [courses, search, tab]);

    function openCourse(courseId: number) {
        navigate(`/learner/courses/detail?id=${courseId}`);
    }

    function continueCourse(courseId: number) {
        navigate(`/learner/lesson?courseId=${courseId}`);
    }

    return {
        tab,
        setTab,
        search,
        setSearch,
        isLoading,
        courses,
        filteredCourses,
        stats,
        openCourse,
        continueCourse,
    };
}

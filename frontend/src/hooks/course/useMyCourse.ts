import { useState } from "react";
import { useAuthStore } from "../../stores/auth/auth.stores";
import { getMyCourses, deleteCourse, type Course, submitCourseToReview } from "../../services/course/course.service";

export type CourseStatusFilter = 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export function useMyCourse() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<CourseStatusFilter>('ALL');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [activeNav, setActiveNav] = useState('My Courses');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filtered = courses.filter(c =>
        (statusFilter === 'ALL' || c.status?.toUpperCase() === statusFilter) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const counts = {
        ALL: courses.length,
        DRAFT: courses.filter(c => c.status?.toUpperCase() === 'DRAFT').length,
        PENDING: courses.filter(c => c.status?.toUpperCase() === 'PENDING').length,
        APPROVED: courses.filter(c => c.status?.toUpperCase() === 'APPROVED').length,
        REJECTED: courses.filter(c => c.status?.toUpperCase() === 'REJECTED').length,
    };

    // Only DRAFT or REJECTED courses can be deleted
    const canDelete = (status: string) => {
        const s = status?.toUpperCase();
        return s === 'DRAFT' || s === 'REJECTED';
    };

    const user = useAuthStore((state) => state.user);

    const fetchCourses = async () => {
        if (!user?.userId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getMyCourses(user.userId);
            setCourses(data);
        } catch (error) {
            console.error("[MyCourses] Error fetching courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id: number) => {
        try {
            await deleteCourse(id);
            setCourses(prev => prev.filter(c => c.courseId !== id));
        } catch (error) {
            console.error("[MyCourses] Error deleting course:", error);
            throw error;
        }
    };

    const handleSubmitForReview = async (id: number) => {
        try {
            await submitCourseToReview(id);
            setCourses(prev => prev.map(c => c.courseId === id ? { ...c, status: 'pending' } : c));
        } catch (error) {
            console.error("[MyCourses] Error submitting course for review:", error);
            throw error;
        }
    };

    return {
        courses,
        setCourses,
        loading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        deleteId,
        setDeleteId,
        activeNav,
        setActiveNav,
        filtered,
        counts,
        canDelete,
        fetchCourses,
        handleDeleteCourse,
        handleSubmitForReview
    };
}

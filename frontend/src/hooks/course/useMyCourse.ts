import { useState } from "react";
import { useAuthStore } from "../../stores/auth/auth.stores";
import { getMyCourses, type Course } from "../../services/course/course.service";

export function useMyCourse() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<Course | 'ALL'>('ALL');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [activeNav, setActiveNav] = useState('My Courses');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filtered = courses.filter(c =>
        (statusFilter === 'ALL' || c.status === statusFilter.status) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const counts = {
        ALL: courses.length,
        DRAFT: courses.filter(c => c.status === 'draft').length,
        PENDING: courses.filter(c => c.status === 'pending').length,
        APPROVED: courses.filter(c => c.status === 'approved').length,
        REJECTED: courses.filter(c => c.status === 'rejected').length,
    };

    // Only DRAFT courses can be deleted
    const canDelete = (status: Course) => status.status === 'draft' || status.status === 'rejected';

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
        }
    }
    return {
        courses,
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
        fetchCourses
    };
}

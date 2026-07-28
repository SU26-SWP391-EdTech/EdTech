import { useState } from "react";
import { useAuthStore } from "../../stores/auth/auth.stores";
import { getMyCourses, deleteCourse, type Course, submitCourseToReview } from "../../services/course/course.service";

export type CourseStatusFilter = 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Custom hook quản lý danh sách khóa học của Course Provider (My Courses).
 * Cung cấp chức năng lọc theo trạng thái, tìm kiếm tên, xóa khóa học nháp/bị từ chối và nộp khóa học để kiểm duyệt.
 */
export function useMyCourse() {
    // States
    const [courses, setCourses] = useState<Course[]>([]);                        // Toàn bộ danh sách khóa học của user
    const [search, setSearch] = useState('');                                    // Chuỗi tìm kiếm tên khóa học
    const [statusFilter, setStatusFilter] = useState<CourseStatusFilter>('ALL'); // Bộ lọc trạng thái khóa học
    const [deleteId, setDeleteId] = useState<number | null>(null);               // ID khóa học đang chuẩn bị xóa
    const [activeNav, setActiveNav] = useState('My Courses');                    // Tên menu điều hướng đang hoạt động
    const [loading, setLoading] = useState(true);                                // Trạng thái tải dữ liệu
    const [error, setError] = useState<string | null>(null);                     // Lỗi khi gọi API

    // Lọc khóa học thỏa mãn đồng thời bộ lọc trạng thái và từ khóa tìm kiếm
    const filtered = courses.filter(c =>
        (statusFilter === 'ALL' || c.status?.toUpperCase() === statusFilter) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    // Đếm số lượng khóa học theo từng trạng thái để hiển thị badge/tab số lượng
    const counts = {
        ALL: courses.length,
        DRAFT: courses.filter(c => c.status?.toUpperCase() === 'DRAFT').length,
        PENDING: courses.filter(c => c.status?.toUpperCase() === 'PENDING').length,
        APPROVED: courses.filter(c => c.status?.toUpperCase() === 'APPROVED').length,
        REJECTED: courses.filter(c => c.status?.toUpperCase() === 'REJECTED').length,
    };

    // Chỉ cho phép xóa khóa học khi đang ở trạng thái DRAFT hoặc REJECTED
    const canDelete = (status: string) => {
        const s = status?.toUpperCase();
        return s === 'DRAFT' || s === 'REJECTED';
    };

    // Lấy thông tin user hiện tại từ auth store
    const user = useAuthStore((state) => state.user);

    // Tải danh sách khóa học của giảng viên hiện tại
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

    // Thực hiện xóa khóa học (sau khi xác nhận)
    const handleDeleteCourse = async (id: number) => {
        try {
            await deleteCourse(id);
            setCourses(prev => prev.filter(c => c.courseId !== id));
        } catch (error) {
            console.error("[MyCourses] Error deleting course:", error);
            throw error;
        }
    };

    // Gửi yêu cầu duyệt khóa học nháp
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

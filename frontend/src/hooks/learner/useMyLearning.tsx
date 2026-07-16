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

/**
 * Custom hook quản lý thông tin học tập cá nhân của Học viên (Learner - "My Learning").
 * Tải danh sách khóa học học viên đã tham gia, hiển thị số liệu thống kê (hoàn thành, đang học, chưa bắt đầu),
 * hỗ trợ bộ lọc tab trạng thái, công cụ tìm kiếm và các hành động điều hướng (xem chi tiết, tiếp tục học bài học tiếp theo).
 */
export function useMyLearning() {
    const navigate = useNavigate();

    // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
    const [tab, setTab] = useState<MyLearningTab>('all');                 // Tab phân loại trạng thái học tập ('all', 'in_progress', 'completed')
    const [search, setSearch] = useState('');                             // Chuỗi tìm kiếm khóa học của học viên
    const [isLoading, setIsLoading] = useState(true);                     // Trạng thái đang call API tải danh sách đăng ký học
    const [courses, setCourses] = useState<MyLearningCourse[]>([]);       // Danh sách khóa học đã tham gia (đã map sang kiểu hiển thị)

    // --- 2. EFFECT: TẢI DANH SÁCH ĐĂNG KÝ HỌC (ENROLLMENTS) ---
    useEffect(() => {
        let cancelled = false; // Cờ chống race condition nếu component bị unmount trước khi API trả về kết quả

        async function loadEnrollments() {
            setIsLoading(true);

            try {
                const enrollments = await getMyEnrollments();
                if (!cancelled) {
                    // Map danh sách Enrollment thô từ Backend sang danh sách khóa học dạng hiển thị
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
            cancelled = true; // Clean up hủy bỏ cập nhật state khi unmount
        };
    }, []);

    // --- 3. LOGIC TÍNH TOÁN VÀ BỘ LỌC (COMPUTED VALUES) ---
    // Tính toán số liệu thống kê học tập (Số khóa học hoàn thành, đang học, tổng số giờ...)
    const stats = useMemo(() => getMyLearningStats(courses), [courses]);

    // Lọc danh sách khóa học hiển thị theo Tab đang chọn và theo ô nhập liệu Tìm kiếm
    const filteredCourses = useMemo(() => {
        const byTab = filterMyLearningCourses(courses, tab);
        const keyword = search.trim().toLowerCase();

        if (!keyword) return byTab;

        return byTab.filter(course => (
            course.title.toLowerCase().includes(keyword) ||
            course.language.toLowerCase().includes(keyword)
        ));
    }, [courses, search, tab]);

    // --- 4. HÀM ĐIỀU HƯỚNG HỌC TẬP (NAVIGATION) ---
    /**
     * Chuyển sang trang xem chi tiết thông tin khóa học (Landing page của learner).
     */
    function openCourse(courseId: number) {
        navigate(`/learner/courses/detail?id=${courseId}`);
    }

    /**
     * Chuyển hướng thẳng tới lớp học để tiếp tục bài học dang dở của học viên.
     */
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

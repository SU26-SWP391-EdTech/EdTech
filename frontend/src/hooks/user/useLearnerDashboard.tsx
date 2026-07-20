import React, { useEffect, useState } from 'react';
import { Flame, Clock, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { getMyEnrollments, type Enrollment } from '../../services/enrollment/enrollment.service';
import { getLearningPaths, type LearningPath, getFollowedLearningPathIds } from '../../services/learning-path/learning-path.service';
import type { NodeState } from '../../components/User/dashboard/learner/RoadmapNode';
import { getLearnerProfile } from '../../services/learner/learner.services';
import { getStreak } from '../../utils/learner/streakUtils';

/**
 * Custom hook quản lý dữ liệu trang Dashboard dành cho Học viên (Learner Dashboard).
 * Tải đồng thời thông tin:
 * - Hồ sơ học viên (streak học tập, điểm PvP).
 * - Các khóa học đã đăng ký (enrollments) để tính toán thống kê (số khóa học đã xong, tổng giờ học).
 * - Danh sách lộ trình học tập (learning paths) và danh sách các lộ trình học viên đang theo dõi (followed).
 * - Tạo sơ đồ học tập (Roadmap Nodes) động theo từng lộ trình học tập, phản ánh trạng thái đã đăng ký (enrolled) hay chưa (not-enrolled).
 */
export function useLearnerDashboard() {
    const user = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);                           // Hồ sơ chi tiết học viên
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);             // Các khóa học đang tham gia
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);       // Toàn bộ lộ trình học tập
    const [followedPathIds, setFollowedPathIds] = useState<number[]>([]);         // Mảng ID các lộ trình đang theo dõi
    const [isLoading, setIsLoading] = useState<boolean>(true);                    // Trạng thái đang tải dữ liệu

    // --- 1. EFFECT: TẢI TOÀN BỘ DỮ LIỆU BAN ĐẦU ---
    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                // Thực hiện gọi API song song để tối ưu hóa thời gian tải trang
                const [profileData, enrollmentsData, pathsData, followedIds] = await Promise.all([
                    getLearnerProfile(user.userId),
                    getMyEnrollments(),
                    getLearningPaths(),
                    getFollowedLearningPathIds()
                ]);

                // Đếm số lượng khóa học đã hoàn thành (tiến độ 100% hoặc trạng thái completed)
                const completedCount = enrollmentsData.filter(
                    e => e.status === 'completed' || e.progress === 100
                ).length;

                // Tính toán tổng số giờ học dựa trên thời lượng khóa học và tiến độ tương ứng
                const totalHours = enrollmentsData.reduce((acc, curr) => {
                    const duration = curr.course.duration || 10;
                    return acc + Math.round(duration * (curr.progress / 100));
                }, 0);

                const streakData = getStreak(user.userId);

                setProfile({
                    ...profileData,
                    streakCount: streakData.currentStreak,
                    completedCourses: completedCount,
                    learningHours: totalHours,
                });

                setEnrollments(enrollmentsData);
                setLearningPaths(pathsData);
                setFollowedPathIds(followedIds);
            } catch (error) {
                console.error("Failed to load dashboard data from API:", error);
                setProfile(null);
                setEnrollments([]);
                setLearningPaths([]);
                setFollowedPathIds([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    // --- 2. TỔNG HỢP CÁC CHỈ SỐ THỐNG KÊ (STATS CARD DATA) ---
    const activeStats = [
        {
            id: 'streak',
            label: 'Day Streak',
            value: (profile?.streakCount ?? 0).toString(),
            sub: 'Active daily learning',
            icon: React.createElement(Flame, { className: "w-5 h-5" }),
            color: '#F59E0B',
            bg: '#FFF7ED',
            sparkData: (profile?.streakCount ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : [0, 2, 3, 5, 4, 8, profile?.streakCount ?? 0],
        },
        {
            id: 'completed',
            label: 'Courses Done',
            value: (profile?.completedCourses ?? 0).toString(),
            sub: 'Completed courses',
            icon: React.createElement(GraduationCap, { className: "w-5 h-5" }),
            color: '#10B981',
            bg: '#F0FDF4',
            sparkData: (profile?.completedCourses ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, profile?.completedCourses ?? 0],
        },
        {
            id: 'hours',
            label: 'Hours Learned',
            value: (profile?.learningHours ?? 0).toString(),
            sub: 'Total study time',
            icon: React.createElement(Clock, { className: "w-5 h-5" }),
            color: '#3B82F6',
            bg: '#EFF6FF',
            sparkData: (profile?.learningHours ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : [0, 15, 30, 45, 60, 90, profile?.learningHours ?? 0],
        },
    ];

    // --- 3. KHÓA HỌC ĐANG HỌC DANG DỞ (CONTINUE LEARNING) ---
    // Lọc ra các khóa học đang học để hiển thị trên phần "Học tiếp" của dashboard
    const continueCourses = enrollments
        .filter(e => e.status === 'active' && e.progress < 100)
        .slice(0, 3)
        .map((enrollment, idx) => {
            // Xác định xem khóa học này có thuộc lộ trình nào không để hiển thị nhãn lộ trình
            const parentPath = learningPaths.find(p =>
                p.learningPathCourses?.some(lpc => lpc.courseId === enrollment.course.courseId)
            );
            const pathTitle = parentPath ? parentPath.title : 'Individual Course';

            const gradients = [
                'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
                'linear-gradient(135deg, #065F46 0%, #0EA5E9 100%)',
                'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)',
            ];

            return {
                id: enrollment.enrollmentId,
                courseId: enrollment.course.courseId,
                title: enrollment.course.title,
                path: pathTitle,
                progress: enrollment.progress,
                gradient: gradients[idx % gradients.length],
                initials: enrollment.course.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
                thumbnailUrl: enrollment.course.thumbnailUrl || undefined,
            };
        });

    const [selectedPathId, setSelectedPathId] = useState<number | null>(null); // ID lộ trình đang được học viên chọn xem sơ đồ

    const followedPaths = learningPaths.filter(path =>
        followedPathIds.includes(path.learningPathId)
    );

    // Tự động chọn lộ trình đầu tiên trong số các lộ trình đang theo dõi làm mặc định
    useEffect(() => {
        if (followedPathIds.length > 0) {
            if (selectedPathId === null || !followedPathIds.includes(selectedPathId)) {
                setSelectedPathId(followedPathIds[0]);
            }
        } else {
            setSelectedPathId(null);
        }
    }, [followedPathIds, selectedPathId]);

    // --- 4. TẠO SƠ ĐỒ LỘ TRÌNH HỌC TẬP DƯỚI DẠNG ROADMAP NODES ---
    const activePath = learningPaths.find(path =>
        path.learningPathId === selectedPathId
    ) || null;

    const pathCourses = activePath ? [...(activePath.learningPathCourses || [])].sort((a, b) => a.position - b.position) : [];

    // Duyệt qua danh sách khóa học thuộc lộ trình và gắn trạng thái đã đăng ký (enrolled / not-enrolled)
    const roadmapNodes = pathCourses.map((lpc, idx) => {
        const enrollment = enrollments.find(e => e.course.courseId === lpc.courseId);
        const state: NodeState = enrollment ? 'enrolled' : 'not-enrolled';

        return {
            id: lpc.courseId,
            label: lpc.course?.title || `Course ${idx + 1}`,
            state,
            course: lpc.course?.description || 'Curated course in this path',
        };
    });

    const enrolledCount = roadmapNodes.filter(n => n.state === 'enrolled').length;

    return {
        profile,
        activeStats,
        continueCourses,
        activePath,
        followedPaths,
        selectedPathId,
        setSelectedPathId,
        roadmapNodes,
        enrolledCount,
        enrollments,
        isLoading
    };
}

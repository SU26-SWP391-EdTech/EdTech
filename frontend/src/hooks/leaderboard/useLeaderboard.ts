import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';
import {
    getLeaderboardCourses,
    getCourseLeaderboardData,
    getOverallLeaderboardData
} from '../../services/leaderboard/leaderboard.service';
import type { LeaderboardEntry, CourseRankInfo, LeaderboardTab, EnrollFilter } from '../../types/leaderboard/leaderboard.types';

/**
 * Custom hook quản lý Bảng xếp hạng học tập (Leaderboard).
 * Hỗ trợ các chức năng: hiển thị bảng xếp hạng theo Khóa học (Course Rank) hoặc Tổng hợp toàn hệ thống (Overall Rank),
 * tìm kiếm học viên, lọc theo tình trạng tham gia học, tích hợp thử thách PvP giả lập nhận thêm điểm thưởng PvP,
 * và lưu điểm PvP tạm thời trong LocalStorage để đồng bộ bảng xếp hạng thời gian thực.
 */
export function useLeaderboard() {
    const user = useAuthStore(state => state.user);
    const currentUserId = user?.userId || 1;

    // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
    // Trạng thái điều hướng & bộ lọc trên giao diện
    const [tab, setTab] = useState<LeaderboardTab>('course');                 // Tab đang chọn ('course' hoặc 'overall')
    const [selectedCourseId, setSelectedCourseId] = useState<number>(1);       // ID khóa học đang chọn xem bảng xếp hạng
    const [search, setSearch] = useState<string>('');                         // Chuỗi tìm kiếm tên học viên
    const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false); // Ẩn/hiện dropdown chọn khóa học
    const [enrollFilter, setEnrollFilter] = useState<EnrollFilter>('all');    // Lọc khóa học: 'all' (Tất cả), 'enrolled' (Đã tham gia), 'not_enrolled' (Chưa tham gia)
    const [challengeModalEntry, setChallengeModalEntry] = useState<LeaderboardEntry | null>(null); // Thông tin đối thủ được chọn để gửi thách đấu PvP

    // Trạng thái lưu trữ dữ liệu
    const [courses, setCourses] = useState<CourseRankInfo[]>([]);             // Danh sách khóa học có xếp hạng kèm thứ hạng của user
    const [isLoading, setIsLoading] = useState<boolean>(true);                // Trạng thái loading dữ liệu

    // Cấu trúc ma trận dữ liệu hỗ trợ cập nhật tương tác thời gian thực
    const [courseLeaderboards, setCourseLeaderboards] = useState<Record<number, LeaderboardEntry[]>>({}); // Map: [courseId] -> Danh sách học viên xếp hạng
    const [overallLeaderboard, setOverallLeaderboard] = useState<(LeaderboardEntry & { coursesCompleted: number })[]>([]); // Danh sách xếp hạng tổng hợp

    // --- 2. EFFECT: TẢI DANH SÁCH KHÓA HỌC & BẢNG XẾP HẠNG BAN ĐẦU ---
    useEffect(() => {
        async function initData() {
            try {
                setIsLoading(true);
                // Gọi API lấy các khóa học xếp hạng ứng với học viên hiện tại
                const fetchedCourses = await getLeaderboardCourses(currentUserId);
                setCourses(fetchedCourses);

                // Ưu tiên chọn khóa học đầu tiên mà học viên đang đăng ký học
                const firstEnrolled = fetchedCourses.find(c => c.isEnrolled);
                if (firstEnrolled) {
                    setSelectedCourseId(firstEnrolled.courseId);
                } else if (fetchedCourses.length > 0) {
                    setSelectedCourseId(fetchedCourses[0].courseId);
                }

                // Tải dữ liệu bảng xếp hạng chi tiết của từng khóa học
                const courseDataMap: Record<number, LeaderboardEntry[]> = {};
                fetchedCourses.forEach(c => {
                    // Sao chép sâu (deep clone) dữ liệu mock để có thể sửa đổi điểm số (PvP) cục bộ mà không ảnh hưởng cache service
                    courseDataMap[c.courseId] = JSON.parse(JSON.stringify(getCourseLeaderboardData(c.courseId)));
                });
                setCourseLeaderboards(courseDataMap);

                // Tải dữ liệu bảng xếp hạng tổng hợp hệ thống
                const overallData = JSON.parse(JSON.stringify(getOverallLeaderboardData()));
                setOverallLeaderboard(overallData);
            } catch (err) {
                console.error('Failed to load leaderboard data:', err);
                toast.error('Failed to retrieve leaderboard data.');
            } finally {
                setIsLoading(false);
            }
        }
        initData();
    }, [currentUserId]);

    // --- 3. EFFECT: ĐỒNG BỘ ĐIỂM THƯỞNG PVP TỪ LOCAL STORAGE ---
    // Khôi phục điểm PvP đã lưu của user từ các lần chơi trước để đảm bảo thứ hạng được cập nhật chuẩn
    useEffect(() => {
        const savedPoints = localStorage.getItem(`leaderboard_pvp_points_user_${currentUserId}`);
        if (savedPoints) {
            const pvpBonus = Number(savedPoints);
            if (pvpBonus > 0) {
                // Cập nhật điểm PvP cộng thêm vào Bảng xếp hạng khóa học
                setCourseLeaderboards(prev => {
                    const copy = { ...prev };
                    Object.keys(copy).forEach(cId => {
                        const list = [...copy[Number(cId)]];
                        const meIndex = list.findIndex(e => e.isCurrentUser);
                        if (meIndex !== -1) {
                            list[meIndex] = {
                                ...list[meIndex],
                                pvp: pvpBonus,
                                total: list[meIndex].total + pvpBonus - list[meIndex].pvp
                            };
                            // Sắp xếp lại thứ hạng theo tổng điểm mới giảm dần
                            list.sort((a, b) => b.total - a.total);
                            list.forEach((e, idx) => { e.rank = idx + 1; });
                            copy[Number(cId)] = list;
                        }
                    });
                    return copy;
                });

                // Cập nhật điểm PvP cộng thêm vào Bảng xếp hạng tổng hợp
                setOverallLeaderboard(prev => {
                    const list = [...prev];
                    const meIndex = list.findIndex(e => e.isCurrentUser);
                    if (meIndex !== -1) {
                        list[meIndex] = {
                            ...list[meIndex],
                            pvp: pvpBonus,
                            total: list[meIndex].total + pvpBonus - list[meIndex].pvp
                        };
                        list.sort((a, b) => b.total - a.total);
                        list.forEach((e, idx) => { e.rank = idx + 1; });
                    }
                    return list;
                });
            }
        }
    }, [currentUserId, isLoading]);

    // --- 4. LOGIC LỌC DỮ LIỆU BẢNG XẾP HẠNG (COMPUTED VALUES) ---
    // Lọc danh sách khóa học hiển thị trong Dropdown chọn khóa học
    const filteredCoursesDropdown = useMemo(() => {
        return courses.filter(c => {
            if (enrollFilter === 'enrolled') return c.isEnrolled;
            if (enrollFilter === 'not_enrolled') return !c.isEnrolled;
            return true;
        });
    }, [courses, enrollFilter]);

    // Lấy thông tin khóa học hiện tại đang được chọn
    const selectedCourse = useMemo(() => {
        return courses.find(c => c.courseId === selectedCourseId) || {
            courseId: selectedCourseId,
            title: 'Select Course',
            enrolledCount: 0,
            yourRank: 0,
            isEnrolled: false
        };
    }, [courses, selectedCourseId]);

    // Xác định danh sách xếp hạng active tương ứng với Tab được chọn
    const activeList = useMemo(() => {
        if (tab === 'course') {
            return courseLeaderboards[selectedCourseId] || [];
        }
        return overallLeaderboard;
    }, [tab, selectedCourseId, courseLeaderboards, overallLeaderboard]);

    // Lọc danh sách xếp hạng active theo từ khóa tìm kiếm học viên
    const searchedList = useMemo(() => {
        return activeList.filter(e =>
            e.fullName.toLowerCase().includes(search.toLowerCase())
        );
    }, [activeList, search]);

    // Lấy thông tin thứ hạng hiện tại của chính user trong khóa học đang chọn
    const currentUserCourseEntry = useMemo(() => {
        const list = courseLeaderboards[selectedCourseId] || [];
        return list.find(e => e.isCurrentUser);
    }, [courseLeaderboards, selectedCourseId]);

    // Lấy thông tin thứ hạng hiện tại của chính user trên toàn hệ thống
    const currentUserOverallEntry = useMemo(() => {
        return overallLeaderboard.find(e => e.isCurrentUser);
    }, [overallLeaderboard]);

    // --- 5. HÀM XỬ LÝ THÁCH ĐẤU PVP (PVP CHALLENGE ACTIONS) ---
    /**
     * Mô phỏng gửi một yêu cầu thách đấu PvP với học viên khác.
     * Khi chiến thắng, học viên nhận thêm 5 điểm PvP. Điểm này sẽ lưu vào localStorage và
     * tự động tính toán lại toàn bộ thứ hạng cục bộ của học viên trên bảng xếp hạng.
     */
    const handleSendChallenge = () => {
        if (!challengeModalEntry) return;

        const targetName = challengeModalEntry.fullName;
        setChallengeModalEntry(null); // Đóng modal thách đấu

        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)), // Tạo hiệu ứng chờ thách đấu
            {
                loading: `Challenging ${targetName}...`,
                success: () => {
                    // Cập nhật điểm PvP trong Local Storage
                    const currentSaved = localStorage.getItem(`leaderboard_pvp_points_user_${currentUserId}`);
                    const newPvpPoints = (currentSaved ? Number(currentSaved) : 0) + 5;
                    localStorage.setItem(`leaderboard_pvp_points_user_${currentUserId}`, String(newPvpPoints));

                    // Cập nhật điểm PvP trực tiếp trên Bảng xếp hạng khóa học của state
                    setCourseLeaderboards(prev => {
                        const copy = { ...prev };
                        const list = copy[selectedCourseId] ? [...copy[selectedCourseId]] : [];
                        const meIndex = list.findIndex(e => e.isCurrentUser);
                        if (meIndex !== -1) {
                            list[meIndex] = {
                                ...list[meIndex],
                                pvp: list[meIndex].pvp + 5,
                                total: list[meIndex].total + 5
                            };
                            list.sort((a, b) => b.total - a.total);
                            list.forEach((e, idx) => { e.rank = idx + 1; });
                            copy[selectedCourseId] = list;
                        }
                        return copy;
                    });

                    // Cập nhật điểm PvP trực tiếp trên Bảng xếp hạng tổng hợp của state
                    setOverallLeaderboard(prev => {
                        const list = [...prev];
                        const meIndex = list.findIndex(e => e.isCurrentUser);
                        if (meIndex !== -1) {
                            list[meIndex] = {
                                ...list[meIndex],
                                pvp: list[meIndex].pvp + 5,
                                total: list[meIndex].total + 5
                            };
                            list.sort((a, b) => b.total - a.total);
                            list.forEach((e, idx) => { e.rank = idx + 1; });
                        }
                        return list;
                    });

                    // Cập nhật thứ hạng hiển thị trong danh sách khóa học
                    setCourses(prev => {
                        return prev.map(c => {
                            if (c.courseId === selectedCourseId) {
                                const list = courseLeaderboards[selectedCourseId] || [];
                                const meIndex = list.findIndex(e => e.isCurrentUser);
                                return {
                                    ...c,
                                    yourRank: meIndex !== -1 ? list[meIndex].rank : c.yourRank
                                };
                            }
                            return c;
                        });
                    });

                    return `You won the challenge against ${targetName}! +5 PvP pts.`;
                },
                error: 'Failed to send challenge.',
            }
        );
    };

    return {
        tab,
        setTab,
        selectedCourseId,
        setSelectedCourseId,
        search,
        setSearch,
        showCourseDropdown,
        setShowCourseDropdown,
        enrollFilter,
        setEnrollFilter,
        challengeModalEntry,
        setChallengeModalEntry,
        courses,
        filteredCoursesDropdown,
        selectedCourse,
        searchedList,
        currentUserCourseEntry,
        currentUserOverallEntry,
        isLoading,
        handleSendChallenge
    };
}

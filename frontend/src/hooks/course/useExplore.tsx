import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { searchCourses, extractCourseTags } from '../../services/course/course.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import { getLearningPaths, followLearningPath, unfollowLearningPath, getFollowedLearningPathIds } from '../../services/learning-path/learning-path.service';
import type { Course } from '../../services/course/course.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

type Tab = 'all' | 'courses' | 'paths' | 'recommended' | 'saved';

/**
 * Custom hook quản lý chức năng Khám phá (Explore) gồm cả Khóa học (Courses) và Lộ trình học tập (Learning Paths).
 * Hỗ trợ chuyển đổi giữa các Tab danh mục, tìm kiếm đa dạng, lọc theo ngôn ngữ, đăng ký khóa học,
 * theo dõi/bỏ theo dõi lộ trình học tập, tự động xác định trạng thái học tập của user hiện tại.
 */
export function useExplore() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as Tab | null;

    // Lấy thông tin user hiện tại từ auth store
    const user = useAuthStore((state) => state.user);

    // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
    const [tab, setTab] = useState<Tab>('all');                               // Tab đang hiển thị ('all' | 'courses' | 'paths' | ...)
    const [courses, setCourses] = useState<Course[]>([]);                     // Danh sách khóa học được duyệt trong hệ thống
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);   // Danh sách tất cả lộ trình học tập
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);         // Danh sách đăng ký học tập của học viên
    const [enrolledPathIds, setEnrolledPathIds] = useState<number[]>([]);     // Mảng chứa ID các lộ trình mà học viên đang theo học
    const [followedPathIds, setFollowedPathIds] = useState<number[]>([]);     // Mảng chứa ID các lộ trình mà học viên đã bấm Follow
    const [isLoading, setIsLoading] = useState(true);                        // Trạng thái loading toàn bộ trang khám phá
    const [enrollingId, setEnrollingId] = useState<number | null>(null);       // ID khóa học đang trong quá trình call API đăng ký học

    // Các trạng thái của bộ lọc
    const [searchTerm, setSearchTerm] = useState('');                         // Từ khóa tìm kiếm
    const [selectedLanguage, setSelectedLanguage] = useState('all');          // Bộ lọc ngôn ngữ học tập ('all', 'English', 'Vietnamese'...)

    /**
     * Tải dữ liệu các khóa học đã được duyệt, danh sách các lộ trình học tập,
     * và nếu user đã đăng nhập, tải thông tin đăng ký học tập & danh sách follow của họ.
     */
    async function loadData() {
        try {
            setIsLoading(true);
 
            // Gọi song song API lấy khóa học đã duyệt và các lộ trình học tập
            const [coursesRes, pathsRes] = await Promise.all([
                searchCourses({ status: 'approved' }),
                getLearningPaths(),
            ]);

            const coursesData = coursesRes.data?.items || [];
            setCourses(coursesData);
            setLearningPaths(pathsRes);

            const isLearner = user?.roleName?.toLowerCase() === 'learner';
            if (user && isLearner) {
                // Tải danh sách khóa học đã tham gia và các lộ trình học tập đã follow
                const [enrollmentsData, followedIds] = await Promise.all([
                    getMyEnrollments(),
                    getFollowedLearningPathIds(),
                ]);
                setEnrollments(enrollmentsData);
                setFollowedPathIds(followedIds);

                // Xác định động các lộ trình đã tham gia học:
                // Nếu learner đã đăng ký ít nhất 1 khóa học trong lộ trình đó thì được tính là đã học lộ trình đó
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

    // Tự động tải lại dữ liệu khi user thay đổi (Đăng nhập/Đăng xuất/Đổi tài khoản)
    useEffect(() => {
        loadData();
    }, [user]);

    // Đồng bộ trạng thái tab từ URL param (nếu có) vào component state
    useEffect(() => {
        if (tabParam && ['all', 'courses', 'paths', 'recommended', 'saved'].includes(tabParam)) {
            setTab(tabParam);
        }
    }, [tabParam]);

    // --- 2. XỬ LÝ ĐĂNG KÝ KHÓA HỌC (ENROLLMENT) ---
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

    // Kiểm tra nhanh xem learner đã đăng ký khóa học cụ thể này chưa
    const isEnrolled = (courseId: number) => {
        return enrollments.some(e => e.course?.courseId === courseId);
    };

    // --- 3. XỬ LÝ THEO DÕI LỘ TRÌNH HỌC TẬP (FOLLOW/UNFOLLOW PATH) ---
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

    // --- 4. BỘ LỌC DỮ LIỆU ĐƯỢC HIỂN THỊ (FILTERED COMPUTED VALUES) ---
    // Lọc danh sách khóa học hiển thị
    const filteredCourses = courses.filter((course) => {
        // Tìm kiếm theo tên hoặc mô tả khóa học
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Lọc theo ngôn ngữ
        const matchesLanguage = selectedLanguage === 'all' ||
            (course.language && course.language.toLowerCase() === selectedLanguage.toLowerCase());

        // Lọc theo Tag
        const courseTags = extractCourseTags(course);
        const matchesTag = !selectedTag || courseTags.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase());

        // Nếu đã đăng nhập làm learner, ẩn các khóa học đã đăng ký học rồi để chỉ hiển thị các khóa học mới
        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        const enrollmentStatus = isEnrolled(course.courseId);
        const matchesEnrollment = isLearner ? !enrollmentStatus : true;

        return matchesSearch && matchesLanguage && matchesTag && matchesEnrollment;
    });

    // Lọc danh sách lộ trình học tập hiển thị
    const filteredPaths = learningPaths.filter((path) => {
        const q = searchTerm.trim().toLowerCase();
        const pathCourses = path.learningPathCourses || [];

        // Tìm kiếm trong tên lộ trình, mô tả lộ trình hoặc thông tin các khóa học trực thuộc lộ trình
        const matchesSearch = !q ||
            path.title.toLowerCase().includes(q) ||
            (path.description || '').toLowerCase().includes(q) ||
            pathCourses.some(pc =>
                pc.course?.title?.toLowerCase().includes(q) ||
                (pc.course?.description || '').toLowerCase().includes(q) ||
                (pc.course?.language || '').toLowerCase().includes(q)
            );

        // Lọc lộ trình dựa trên ngôn ngữ của các khóa học nằm trong lộ trình đó
        const matchesLanguage = selectedLanguage === 'all' ||
            pathCourses.some(pc => pc.course?.language?.toLowerCase() === selectedLanguage.toLowerCase());

        return matchesSearch && matchesLanguage;
    });

    // Hàm lấy chuỗi Gradient đẹp mắt ngẫu nhiên để làm ảnh nền cho thẻ khóa học
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
        selectedTag,
        setSelectedTag,
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

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { searchCourses, approveCourse, rejectCourse } from '../../services/course/course.service';
import type { BackendCourse } from '../../services/course/course.service';
import toast from 'react-hot-toast';
import type { Course, CourseStatus, Category } from '../../types/course/course-management.types';

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        return response?.data?.message || fallback;
    }
    return fallback;
}

/**
 * Custom hook quản lý danh sách khóa học dành cho Giảng viên (Provider) và Quản lý đào tạo (Academic Manager).
 * Hỗ trợ các chức năng: tìm kiếm, lọc trạng thái, sắp xếp theo cột, drag-and-drop sắp xếp vị trí hiển thị,
 * phê duyệt (approve), từ chối (reject) và xóa khóa học.
 */
export function useCourseManagement() {
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định xem URL hiện tại thuộc về trang Provider (Giảng viên) hay Academic Manager (Kiểm duyệt)
    const isProvider = location.pathname.startsWith('/provider');
    const isPendingPage = location.pathname.includes('pending-courses');

    // Lấy thông tin tài khoản hiện tại từ auth store
    const user = useAuthStore((state) => state.user);
    const userId = user?.userId;

    // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
    const [courses, setCourses] = useState<Course[]>([]);                     // Danh sách gốc khóa học
    const [isLoading, setIsLoading] = useState(false);                        // Trạng thái đang call API load khóa học
    const [search, setSearch] = useState('');                                 // Chuỗi tìm kiếm khóa học
    const [statusFilter, setStatusFilter] = useState(isPendingPage ? 'Pending Review' : 'All Status'); // Trạng thái cần lọc
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined); // ID khóa học đang được chọn xem chi tiết
    const [sortField, setSortField] = useState<'title' | 'students' | 'created' | 'updated'>('created'); // Trường dùng để sắp xếp
    const [sortAsc, setSortAsc] = useState(false);                            // Cờ sắp xếp tăng dần/giảm dần

    /**
     * Tải danh sách khóa học từ Backend và map dữ liệu về đúng định dạng hiển thị cho giao diện.
     */
    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string | number> = {};
            // Nếu là Provider, chỉ lấy các khóa học do chính giảng viên đó tạo
            if (isProvider && userId) {
                params.userId = userId;
            }
            // Nếu ở trang kiểm duyệt, chỉ lấy các khóa học đang chờ duyệt
            if (isPendingPage) {
                params.status = 'pending';
            }
            const res = await searchCourses(params);
            const backendCourses = res.data?.items || [];
            
            // Map dữ liệu Backend sang dữ liệu Frontend UI
            const mapped: Course[] = backendCourses.map((item: BackendCourse): Course => {
                const initials = item.user?.fullName ? item.user.fullName.split(' ').map(n => n[0]).join('') : 'U';
                const formattedDuration = item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : '0h';
                const formattedCreated = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const formattedUpdated = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : formattedCreated;

                let statusVal: CourseStatus = 'Draft';
                if (item.status === 'approved') statusVal = 'Published';
                else if (item.status === 'pending') statusVal = 'Pending Review';
                else if (item.status === 'rejected') statusVal = 'Rejected';

                return {
                    id: item.courseId,
                    title: item.title,
                    description: item.description || '',
                    provider: item.user?.fullName || 'Unknown',
                    providerInitials: initials,
                    providerColor: '#7C3AED',
                    category: 'Web Development' as Category,
                    status: statusVal,
                    students: item.enrollmentCount || 0,
                    rating: 0,
                    duration: formattedDuration,
                    lessons: item.totalLessons || 0,
                    created: formattedCreated,
                    updated: formattedUpdated,
                    thumbBg: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                    thumbIcon: null,
                    progress: 0,
                    language: item.language || 'English',
                    thumbnailUrl: item.thumbnailUrl,
                    projectUrl: item.projectUrl,
                };
            });

            setCourses(mapped);

            const initialFiltered = mapped.filter(c => {
                if (isPendingPage) return c.status === 'Pending Review';
                return true;
            });
            if (initialFiltered.length > 0) {
                setSelectedId(initialFiltered[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isPendingPage, isProvider, userId]);

    // Tự động fetch khóa học khi người dùng đổi trang hoặc ID tài khoản thay đổi
    useEffect(() => {
        // Loading remote data on route/account changes is the synchronization purpose of this effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCourses();
    }, [fetchCourses]);

    // --- 2. LOGIC TÌM KIẾM, LỌC VÀ SẮP XẾP (COMPUTED VALUES) ---
    const filtered = useMemo(() => {
        return courses
            .filter(c => {
                const q = search.toLowerCase();
                // Kiểm tra từ khóa trong tiêu đề, tên provider và mô tả
                const matchQ = !q || c.title.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
                // Kiểm tra bộ lọc trạng thái
                const matchSt = isPendingPage ? c.status === 'Pending Review' : (statusFilter === 'All Status' || c.status === statusFilter);
                return matchQ && matchSt;
            })
            .sort((a, b) => {
                const dir = sortAsc ? 1 : -1;
                if (sortField === 'students') return (a.students - b.students) * dir;
                if (sortField === 'title') return a.title.localeCompare(b.title) * dir;
                if (sortField === 'created') return (new Date(a.created).getTime() - new Date(b.created).getTime()) * dir;
                if (sortField === 'updated') return (new Date(a.updated).getTime() - new Date(b.updated).getTime()) * dir;
                return (a.id - b.id) * dir;
            });
    }, [courses, isPendingPage, search, statusFilter, sortField, sortAsc]);

    // Khóa học đang được chọn để hiển thị thông tin chi tiết trên sidebar/panel phụ
    const selectedCourse = filtered.find(c => c.id === selectedId) ?? filtered[0];

    // Tính toán số liệu thống kê tổng hợp để hiển thị trên Dashboard Dashboard Cards
    const stats = {
        total: courses.length,
        published: courses.filter(c => c.status === 'Published').length,
        draft: courses.filter(c => c.status === 'Draft').length,
        pending: courses.filter(c => c.status === 'Pending Review').length,
        enrollments: courses.reduce((s, c) => s + c.students, 0),
    };

    /**
     * Thay đổi chiều sắp xếp hoặc trường thông tin sắp xếp danh sách.
     */
    const toggleSort = (field: typeof sortField) => {
        console.log('toggleSort clicked: field =', field, 'current sortField =', sortField, 'current sortAsc =', sortAsc);
        if (sortField === field) {
            setSortAsc(prev => !prev);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    // --- 3. LOGIC KÉO THẢ SẮP XẾP HÀNG (DRAG AND DROP) ---
    const [draggedCourseIndex, setDraggedCourseIndex] = useState<number | null>(null);

    const handleCourseDragOver = (fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx) return;
        const updated = [...courses];
        const fromItem = filtered[fromIdx];
        const toItem = filtered[toIdx];
        const mainFromIdx = courses.findIndex(c => c.id === fromItem.id);
        const mainToIdx = courses.findIndex(c => c.id === toItem.id);
        if (mainFromIdx !== -1 && mainToIdx !== -1) {
            const temp = updated[mainFromIdx];
            updated.splice(mainFromIdx, 1);
            updated.splice(mainToIdx, 0, temp);
            setCourses(updated);
            setDraggedCourseIndex(toIdx);
        }
    };

    // --- 4. HÀM KIỂM DUYỆT KHÓA HỌC (ACADEMIC MANAGER) ---
    /**
     * Duyệt đưa khóa học lên Publish công khai.
     */
    const handleApproveCourse = async (courseId: number) => {
        try {
            await approveCourse(courseId);
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Published' } : c));
            toast.success('Course approved successfully!');
        } catch (e: unknown) {
            console.error('Failed to approve course:', e);
            toast.error(getApiErrorMessage(e, 'Failed to approve course'));
        }
    };

    /**
     * Từ chối duyệt khóa học và gửi kèm lý do từ chối.
     */
    const handleRejectCourse = async (courseId: number, reason: string) => {
        try {
            await rejectCourse(courseId, reason);
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Rejected' } : c));
            toast.success('Course rejected successfully!');
        } catch (e: unknown) {
            console.error('Failed to reject course:', e);
            toast.error(getApiErrorMessage(e, 'Failed to reject course'));
        }
    };

    return {
        isProvider,
        navigate,
        courses,
        isLoading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        selectedId,
        setSelectedId,
        sortField,
        sortAsc,
        fetchCourses,
        filtered,
        selectedCourse,
        stats,
        toggleSort,
        draggedCourseIndex,
        setDraggedCourseIndex,
        handleCourseDragOver,
        isPendingPage,
        handleApproveCourse,
        handleRejectCourse,
    };
}

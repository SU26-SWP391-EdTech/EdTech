import { useState, useEffect, useMemo } from 'react';
import {
  getLearningPaths,
  createLearningPath,
  updateLearningPath,
  addCourseToLearningPath,
  removeCourseFromLearningPath,
  getCoursesInLearningPath,
  deleteLearningPath,
  type LearningPathLevel
} from '../../services/learning-path/learning-path.service';
import { searchCourses, type Course } from '../../services/course/course.service';
import { mapBackendToFrontend, formatDuration, parseDurationToMins } from '../../utils/learning-path/learningPathHelpers';
import type { LearningPath } from '../../utils/learning-path/learningPathHelpers';

/**
 * Custom hook quản lý danh sách Lộ trình học tập (Learning Paths) dành cho Quản lý / Giảng viên.
 * Hỗ trợ các chức năng: tìm kiếm lộ trình, phân trang danh sách hiển thị, tính toán số liệu thống kê lộ trình,
 * tạo mới hoặc cập nhật thông tin lộ trình (bao gồm quản lý việc thêm/sửa/xóa các khóa học trực thuộc lộ trình),
 * và xóa lộ trình học tập.
 */
export function useLearningPath() {
  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [search, setSearch] = useState('');                                   // Chuỗi tìm kiếm lộ trình học
  const [selectedId, setSelectedId] = useState<number | null>(null);         // ID của lộ trình đang chọn xem chi tiết
  const [showModal, setShowModal] = useState(false);                          // Trạng thái hiển thị modal Tạo/Sửa lộ trình
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);  // Lộ trình đang được chọn để chỉnh sửa
  const [viewingPath, setViewingPath] = useState<LearningPath | null>(null);  // Lộ trình đang được chọn để xem chi tiết
  const [paths, setPaths] = useState<LearningPath[]>([]);                     // Danh sách tất cả lộ trình học tập trong hệ thống
  const [deletingPathId, setDeletingPathId] = useState<number | null>(null);  // ID của lộ trình đang xác nhận xóa
  const [loading, setLoading] = useState(true);                               // Trạng thái đang tải dữ liệu từ API
  const [allCourses, setAllCourses] = useState<Course[]>([]);                 // Danh sách tất cả khóa học (dùng để chọn vào lộ trình)

  // Trạng thái phân trang danh sách lộ trình
  const [currentPage, setCurrentPage] = useState(1);                          // Trang hiện tại
  const ITEMS_PER_PAGE = 3;                                                   // Số lượng lộ trình tối đa hiển thị trên mỗi trang

  /**
   * Tải toàn bộ danh sách lộ trình học và danh sách các khóa học từ Backend,
   * sau đó map dữ liệu về đúng cấu trúc hiển thị ở Frontend.
   */
  const fetchPathsAndCourses = async () => {
    setLoading(true);
    try {
      const [pathsData, coursesResponse] = await Promise.all([
        getLearningPaths(),
        searchCourses()
      ]);
      const mapped = (pathsData || []).map(mapBackendToFrontend);
      setPaths(mapped);

      const courses = coursesResponse?.data?.items || [];
      setAllCourses(courses);

      if (mapped.length > 0) {
        if (selectedId === null || !mapped.some(p => p.id === selectedId)) {
          setSelectedId(mapped[0].id);
        }
      } else {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Error loading learning paths and courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động load dữ liệu khi hook mount lần đầu
  useEffect(() => {
    fetchPathsAndCourses();
  }, []);

  // --- 2. LOGIC TÌM KIẾM VÀ PHÂN TRANG (COMPUTED VALUES) ---
  // Lọc lộ trình dựa trên từ khóa tìm kiếm trong tiêu đề và mô tả
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return paths.filter(p => {
      return !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [search, paths]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE); // Tổng số trang sau khi lọc
  const activePage = Math.min(currentPage, totalPages || 1);     // Trang hoạt động thực tế

  // Cắt mảng danh sách lộ trình để hiển thị theo trang hiện tại
  const paginatedPaths = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, activePage]);

  // Lộ trình được chọn xem chi tiết, mặc định lấy phần tử đầu tiên nếu chưa chọn
  const selectedPath = paths.find(p => p.id === selectedId) ?? paths[0];

  // Tính toán số liệu thống kê tổng hợp của tất cả lộ trình học tập
  const stats = useMemo(() => {
    const totalCourses = paths.reduce((s, p) => s + p.courses, 0);
    const totalDurationMins = paths.reduce((s, p) => {
      return s + parseDurationToMins(p.duration);
    }, 0);
    const avgCourses = paths.length > 0
      ? Math.round((totalCourses / paths.length) * 10) / 10
      : 0;
    const avgDurationMins = paths.length > 0 ? Math.round(totalDurationMins / paths.length) : 0;
    const avgDuration = avgDurationMins > 0 ? formatDuration(avgDurationMins) : 'N/A';

    return {
      total: paths.length,
      totalCourses,
      avgDuration,
      avgCourses,
    };
  }, [paths]);

  // --- 3. HÀM THAO TÁC DỮ LIỆU LỘ TRÌNH (CREATE/UPDATE/DELETE ACTIONS) ---
  /**
   * Lưu thông tin lộ trình học tập (Tạo mới hoặc Cập nhật).
   * Do lộ trình học bao gồm cả liên kết tuần tự tới các khóa học bên trong, luồng xử lý:
   * 1. Lưu thông tin cơ bản của lộ trình.
   * 2. (Khi update) Xóa toàn bộ liên kết khóa học hiện tại.
   * 3. Thực hiện thêm tuần tự từng khóa học đã chọn để bảo lưu vị trí (position) sắp xếp của lộ trình.
   * 
   * @param savedData - Dữ liệu nhập từ modal Form lộ trình
   */
  const handleSavePath = async (savedData: {
    title: string;
    description: string;
    courses: Course[];
    thumbnailUrl?: string;
    slug?: string;
    level?: LearningPathLevel;
  }) => {
    if (!savedData.courses || savedData.courses.length === 0) {
      alert("A learning path must contain at least one course.");
      return;
    }
    setLoading(true);
    try {
      const bannerUrl = savedData.thumbnailUrl;

      if (editingPath) {
        // --- CHẾ ĐỘ CHỈNH SỬA ---
        // 1. Cập nhật thông tin cơ bản
        await updateLearningPath(editingPath.id, {
          title: savedData.title,
          description: savedData.description,
          bannerUrl: bannerUrl || undefined,
          slug: savedData.slug || undefined,
          level: savedData.level || undefined,
        });

        // 2. Lấy danh sách khóa học hiện tại của lộ trình từ Backend
        const currentCourses = await getCoursesInLearningPath(editingPath.id);

        // 3. Xóa các khóa học cũ ra khỏi lộ trình
        for (const course of currentCourses) {
          await removeCourseFromLearningPath(editingPath.id, course.courseId);
        }

        // 4. Thêm lại các khóa học mới theo thứ tự tuần tự
        for (let i = 0; i < savedData.courses.length; i++) {
          const course = savedData.courses[i];
          await addCourseToLearningPath(editingPath.id, {
            courseId: course.courseId,
            position: i + 1
          });
        }
      } else {
        // --- CHẾ ĐỘ TẠO MỚI ---
        // 1. Gửi yêu cầu tạo lộ trình
        const newPath = await createLearningPath({
          title: savedData.title,
          description: savedData.description,
          bannerUrl: bannerUrl || undefined,
          level: savedData.level || 'beginner',
          slug: savedData.slug || undefined,
        });

        // 2. Thêm tuần tự các khóa học đã được gán vào lộ trình mới
        for (let i = 0; i < savedData.courses.length; i++) {
          const course = savedData.courses[i];
          await addCourseToLearningPath(newPath.learningPathId, {
            courseId: course.courseId,
            position: i + 1
          });
        }
      }

      // Tải lại dữ liệu sau khi lưu thành công
      await fetchPathsAndCourses();

      setShowModal(false);
      setEditingPath(null);
      setViewingPath(null);
    } catch (err) {
      console.error("Failed to save learning path:", err);
      alert("An error occurred while saving the learning path. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xác nhận và thực hiện xóa lộ trình học tập.
   */
  const handleConfirmDelete = async () => {
    if (deletingPathId !== null) {
      setLoading(true);
      try {
        await deleteLearningPath(deletingPathId);
        // Cập nhật nhanh danh sách phía client
        setPaths(prev => prev.filter(p => p.id !== deletingPathId));
        if (selectedId === deletingPathId) {
          const remaining = paths.filter(p => p.id !== deletingPathId);
          if (remaining.length > 0) {
            setSelectedId(remaining[0].id);
          } else {
            setSelectedId(null);
          }
        }
      } catch (err: any) {
        console.error("Failed to delete learning path:", err);
        alert(err.response?.data?.message || "Failed to delete learning path. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    setDeletingPathId(null); // Đóng modal xác nhận xóa
  };

  return {
    search,
    setSearch,
    selectedId,
    setSelectedId,
    showModal,
    setShowModal,
    editingPath,
    setEditingPath,
    viewingPath,
    setViewingPath,
    deletingPathId,
    setDeletingPathId,
    loading,
    allCourses,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    totalPages,
    activePage,
    paginatedPaths,
    selectedPath,
    stats,
    handleSavePath,
    handleConfirmDelete,
    fetchPathsAndCourses
  };
}

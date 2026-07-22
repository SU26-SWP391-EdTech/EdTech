import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code, Layers, Database, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth/auth.stores';
import type { Course } from '../../services/course/course.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';
import { getLearningPathById } from '../../services/learning-path/learning-path.service';
import { getLessonsByCourse } from '../../services/lesson/lesson.service';

export type NodeState = 'completed' | 'current' | 'upcoming' | 'locked';

export interface CourseNode {
  id: number;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  state: NodeState;
  icon: React.ReactNode;
  color: string;
  topics: string[];
  thumbnailUrl?: string | null;
  course: Course;
}

export interface Module {
  id: number;
  title: string;
  lessons: { id: number; title: string; done: boolean; duration: string }[];
}

function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes || 0));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Custom hook quản lý thông tin chi tiết Lộ trình học tập (Learning Path Detail) cho Học viên.
 * Hỗ trợ các chức năng: tự động tính toán sơ đồ lộ trình (roadmap nodes) dưới dạng chuỗi các khóa học tuần tự,
 * xác định trạng thái học tập của từng nút khóa học (Hoàn thành, Đang học, Khóa học tiếp theo, Đã khóa),
 * tải danh sách bài học thuộc khóa học đang active, hiển thị tiến độ học tập trung bình,
 * đăng ký khóa học đơn lẻ, và điều hướng vào bài học cụ thể.
 */
export function useLearningPathDetail() {
  const { id } = useParams<{ id: string }>(); // Lấy ID lộ trình học tập từ URL params
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [path, setPath] = useState<LearningPath | null>(null);             // Thông tin chi tiết lộ trình học
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);         // Danh sách các khóa học học viên đã đăng ký học
  const [isLoading, setIsLoading] = useState(true);                        // Trạng thái đang tải dữ liệu từ API
  const [liked, setLiked] = useState<Set<number>>(new Set());              // Set chứa ID các lộ trình được thích (like)
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null); // ID khóa học đang được chọn hiển thị giáo trình chi tiết
  const [activeCourseLessons, setActiveCourseLessons] = useState<any[]>([]); // Danh sách bài học của khóa học đang active

  // --- 2. EFFECT: TẢI DỮ LIỆU LỘ TRÌNH VÀ ENROLLMENTS ---
  useEffect(() => {
    async function loadPathData() {
      if (!id) return;
      try {
        setIsLoading(true);

        // Tải thông tin lộ trình theo ID
        const targetPath = await getLearningPathById(parseInt(id));
        if (!targetPath) {
          toast.error('Learning Path not found!');
          navigate('/learner/explore');
          return;
        }

        setPath(targetPath);

        // Nếu user đã đăng nhập với vai trò Learner, tải danh sách đăng ký học tập của họ
        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        let activeEnrollments: Enrollment[] = [];
        if (user && isLearner) {
          activeEnrollments = await getMyEnrollments();
        }
        setEnrollments(activeEnrollments);

        // Tìm kiếm khóa học hiện tại mà học viên đang học dở để mặc định hiển thị chi tiết bài học
        const pathCourses = targetPath.learningPathCourses || [];
        const currentCourse = pathCourses.find(pc => {
          const e = activeEnrollments.find((e: Enrollment) => e.course?.courseId === pc.courseId);
          return e && e.progress < 100; // Khóa học đang học dở (tiến độ dưới 100%)
        }) || pathCourses[0];

        if (currentCourse) {
          setActiveCourseId(currentCourse.courseId);
        }
      } catch (err) {
        console.error('Failed to load learning path details:', err);
        toast.error('Error loading roadmap data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPathData();
  }, [id, navigate, user]);

  // --- 3. EFFECT: TẢI DANH SÁCH BÀI HỌC CỦA KHÓA HỌC DANG ACTIVE ---
  useEffect(() => {
    async function loadActiveCourseLessons() {
      if (!activeCourseId) {
        setActiveCourseLessons([]);
        return;
      }
      try {
        const lessons = await getLessonsByCourse(activeCourseId);
        setActiveCourseLessons(lessons);
      } catch (err) {
        console.error('Failed to load active course lessons:', err);
        setActiveCourseLessons([]);
      }
    }
    loadActiveCourseLessons();
  }, [activeCourseId]);

  // Danh sách khóa học được sắp xếp theo đúng thứ tự (position) trong lộ trình
  const pathCourses = [...(path?.learningPathCourses || [])].sort((a, b) => a.position - b.position);

  // --- 4. LOGIC XÂY DỰNG SƠ ĐỒ LỘ TRÌNH (COMPUTED ROADMAP NODES) ---
  // Cho phép tự do mở khóa và truy cập/đăng ký tất cả các khóa học trong lộ trình
  const roadmapNodes: CourseNode[] = pathCourses.map((pc, idx) => {
    const enrollment = enrollments.find(e => e.course?.courseId === pc.courseId);
    const enrolled = !!enrollment;
    const completed = enrollment?.status === 'completed' || enrollment?.progress === 100;

    let state: NodeState = 'upcoming';
    if (completed) {
      state = 'completed'; // Đã hoàn thành khóa học
    } else if (enrolled) {
      state = 'current';   // Đang trong tiến trình học khóa học này
    } else {
      state = 'upcoming';  // Có thể tự do đăng ký/mở khóa học
    }

    // Gán icon động tùy thuộc vào nội dung tiêu đề khóa học
    let icon = React.createElement(Code, { className: "w-5 h-5" });
    if (pc.course?.title.toLowerCase().includes('figma') || pc.course?.title.toLowerCase().includes('design')) {
      icon = React.createElement(Layers, { className: "w-5 h-5" });
    } else if (pc.course?.title.toLowerCase().includes('database') || pc.course?.title.toLowerCase().includes('api')) {
      icon = React.createElement(Database, { className: "w-5 h-5" });
    } else if (pc.course?.title.toLowerCase().includes('docker')) {
      icon = React.createElement(Shield, { className: "w-5 h-5" });
    }

    return {
      id: pc.courseId,
      title: pc.course?.title || '',
      description: pc.course?.description || 'Learn key industry standard concepts.',
      duration: formatDuration(pc.course?.duration || 0),
      lessons: pc.course?.totalLessons || 12,
      progress: enrollment?.progress || 0,
      state,
      icon,
      color: ['#E11D48', '#D97706', '#059669', '#2563EB', '#7C3AED', '#0891B2'][idx % 6],
      topics: pc.course?.language ? [pc.course.language] : ['Development'],
      thumbnailUrl: pc.course?.thumbnailUrl,
      course: pc.course,
    };
  });

  // Tính toán số liệu thống kê tổng hợp của lộ trình
  const totalCourses = pathCourses.length;
  const completedCourses = roadmapNodes.filter(n => n.state === 'completed').length;
  const totalMinutes = roadmapNodes.reduce((sum, n) => sum + (n.course?.duration || 0), 0);
  const totalDurationLabel = formatDuration(totalMinutes);
  
  // Tính toán tiến độ trung bình của học viên trên lộ trình hiện tại
  const totalProgressSum = roadmapNodes.reduce((acc, n) => acc + n.progress, 0);
  const overallProgress = totalCourses > 0 ? Math.round(totalProgressSum / totalCourses) : 0;

  // Lấy node tương ứng với khóa học đang được chọn xem chi tiết bài học
  const selectedNode = roadmapNodes.find(n => n.id === activeCourseId) || roadmapNodes[0];
  const activeCourse = selectedNode?.course;

  /**
   * Tạo cấu trúc Modules bài học giả lập cho khóa học đang chọn,
   * tự động đánh dấu hoàn thành (`done`) dựa trên tỉ lệ phần trăm tiến độ (`progress`) của học viên.
   */
  const generateModulesForCourse = (course: Course, progress: number, lessonsList: any[]): Module[] => {
    if (!course || !lessonsList || lessonsList.length === 0) return [];

    let lessonsPassed = Math.floor((progress / 100) * lessonsList.length);

    const lessons = lessonsList.map((l, index) => {
      const done = index < lessonsPassed;
      return {
        id: Number(l.lessonId),
        title: l.title,
        done,
        duration: l.duration || (l.videoDuration ? `${Math.round(l.videoDuration / 60)}m` : '15m'),
      };
    });

    return [
      {
        id: 1,
        title: 'Lesson Curriculum',
        lessons,
      }
    ];
  };

  // Danh sách module bài học hiển thị chi tiết giáo trình ở panel phụ
  const currentModules = activeCourse ? generateModulesForCourse(activeCourse, selectedNode.progress, activeCourseLessons) : [];

  /**
   * Tiếp tục học khóa học cụ thể.
   * Nếu khóa học đang bị khóa (`locked`), hiển thị thông báo lỗi yêu cầu hoàn thành các khóa trước.
   */
  const handleContinueCourse = (courseId: number) => {
    const node = roadmapNodes.find(n => n.id === courseId);
    if (!node) return;

    if (node.state === 'completed' || node.state === 'current') {
      navigate(`/learner/lesson?courseId=${courseId}`);
    } else {
      navigate(`/learner/courses/detail?id=${courseId}`);
    }
  };

  // --- 5. HÀM XỬ LÝ HÀNH ĐỘNG (LEARNER ACTIONS) ---
  /**
   * Đăng ký tham gia một khóa học đơn lẻ thuộc lộ trình.
   */
  const handleEnrollSingleCourse = async (courseId: number) => {
    if (!user) {
      toast.error('Please sign in to enroll.');
      navigate('/login');
      return;
    }

    const role = user.roleName?.toLowerCase();
    if (role !== 'learner') {
      toast.error(`As a ${user.roleName}, you cannot enroll in courses.`);
      return;
    }

    try {
      setIsLoading(true);
      await enrollCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      // Tải lại danh sách enrollments để cập nhật giao diện
      const activeEnrollments = await getMyEnrollments();
      setEnrollments(activeEnrollments);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Bắt đầu vào học một bài học cụ thể.
   * Đảm bảo học viên đã đăng ký khóa học đó trước khi truy cập.
   */
  const handleStartLesson = (lessonId: number) => {
    if (!user) {
      toast.error('Please sign in to study.');
      navigate('/login');
      return;
    }

    const role = user.roleName?.toLowerCase();
    if (role !== 'learner') {
      toast.error(`As a ${user.roleName}, you cannot study.`);
      return;
    }
    
    if (!activeCourseId) return;
    
    const enrollmentIdx = enrollments.findIndex(e => e.course?.courseId === activeCourseId);
    if (enrollmentIdx === -1) {
      toast.error('Please enroll in the course first to start this lesson.');
      return;
    }

    navigate(`/learner/lesson?courseId=${activeCourseId}&lessonId=${lessonId}`);
  };

  return {
    path,
    isLoading,
    liked,
    setLiked,
    activeCourseId,
    setActiveCourseId,
    roadmapNodes,
    totalCourses,
    totalDurationLabel,
    completedCourses,
    overallProgress,
    activeCourse,
    currentModules,
    handleEnrollSingleCourse,
    handleStartLesson,
    handleContinueCourse,
  };
}

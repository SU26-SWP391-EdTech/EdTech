import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';
import type { Module, LessonStatus } from '../../types/course/course-detail.types';
import { getCourseById, approveCourse, rejectCourse, searchCourses } from '../../services/course/course.service';
import { getLessonsByCourse } from '../../services/lesson/lesson.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import { getAcademicProfile } from '../../services/user/user.service';
import api from '../../lib/axios';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';
import type { Module, LessonStatus } from '../../types/course/course-detail.types';
import { getCourseById, approveCourse, rejectCourse, searchCourses } from '../../services/course/course.service';
import { getLessonsByCourse } from '../../services/lesson/lesson.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import { getAcademicProfile } from '../../services/user/user.service';
import api from '../../lib/axios';

/**
 * Xác định phân loại của bài học (Assessment, Video, Reading, hoặc kết hợp).
 * Ưu tiên nhận diện bài kiểm tra (Assessment) trước qua các trường dữ liệu hoặc localStorage.
 * 
 * @param lesson - Đối tượng bài học cần kiểm tra
 * @returns Phân loại bài học dưới dạng chuỗi ('Assessment' | 'Video & Reading' | 'Video' | 'Reading')
 */
function getLessonType(lesson: any) {
  if (lesson.type === 'Assessment') return 'Assessment';
  if (lesson.hasAssessment) return 'Assessment';
  if (lesson.assessments && lesson.assessments.length > 0) return 'Assessment';

  const lessonId = lesson.lessonId || lesson.id;
  if (lessonId) {
    const savedAss = localStorage.getItem(`assessments_lesson_${lessonId}`);
    if (savedAss) {
      try {
        const parsed = JSON.parse(savedAss);
        if (parsed && parsed.length > 0) {
          return 'Assessment';
        }
      } catch (e) {}
    }
  }

  const hasVideo = Boolean(lesson.videoUrl);
  const hasReading = Boolean(lesson.content);

  if (hasVideo && hasReading) return 'Video & Reading';
  if (hasVideo) return 'Video';
  if (hasReading) return 'Reading';
  return 'Reading';
}

/**
 * Tính toán thời lượng làm bài hoặc học của một bài học (phút).
 * 
 * @param lesson - Đối tượng bài học
 * @returns Thời lượng tính bằng phút
 */
function getLessonDurationMinutes(lesson: any) {
  if (getLessonType(lesson) === 'Assessment') return 15; // Mặc định bài kiểm tra là 15 phút
  const hasVideo = Boolean(lesson.videoUrl);
  const hasReading = Boolean(lesson.content);
  const videoMin = lesson.videoDuration ? Math.round(Number(lesson.videoDuration) / 60) : 0;

  if (hasVideo && hasReading) {
    return videoMin + 10;
  }
  if (hasVideo) {
    return videoMin;
  }
  if (hasReading) {
    return 10;
  }
  return 10; // Thời gian mặc định nếu không xác định được
}

/**
 * Định dạng số phút học của khóa học thành chuỗi hiển thị (Giờ/Phút).
 * 
 * @param totalMinutes - Tổng số phút
 * @returns Chuỗi định dạng thời gian
 */
function formatCourseHours(totalMinutes: number) {
  const hours = totalMinutes / 60;
  if (hours === 0) return '0 hours';
  if (hours < 1) return `${totalMinutes} min`;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hours`;
}

/**
 * Custom hook quản lý chi tiết khóa học, danh sách bài học, thông tin giảng viên/provider,
 * trạng thái đăng ký học của learner và các chức năng phê duyệt/từ chối dành cho Admin/Manager.
 */
export function useCourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Lấy thông tin user hiện tại và role
  const user = useAuthStore((state) => state.user);
  const role = user?.roleName?.toLowerCase() || 'guest';

  // Lấy ID khóa học từ URL query params hoặc state chuyển trang, mặc định là khóa học số 1
  const courseId = Number(searchParams.get('id') || location.state?.courseId || 1);

  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [course, setCourse] = useState<any>(null);                        // Thông tin chung của khóa học
  const [lessonsList, setLessonsList] = useState<any[]>([]);              // Danh sách bài học của khóa học
  const [enrollments, setEnrollments] = useState<any[]>([]);              // Danh sách các khóa học học viên đã đăng ký
  const [providerProfile, setProviderProfile] = useState<any>(null);      // Hồ sơ của giảng viên/nhà cung cấp khóa học
  const [providerCoursesCount, setProviderCoursesCount] = useState(0);    // Số lượng khóa học đã duyệt của giảng viên này
  const [isLoading, setIsLoading] = useState(true);                        // Trạng thái loading chung
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set()); // Tập hợp ID các bài học đã hoàn thành

  /**
   * Tải toàn bộ thông tin chi tiết khóa học, danh sách bài học, thông tin provider 
   * và tiến độ học tập (nếu user là learner đã đăng ký học).
   */
  async function loadData() {
    try {
      setIsLoading(true);
      // Gọi song song API lấy khóa học và danh sách bài học
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessonsList(lessonsData);

      const providerId = courseData.user?.userId;

      // Nếu có giảng viên, tải thêm hồ sơ học thuật và danh sách khóa học của họ
      if (providerId) {
        const [profileResult, coursesResult] = await Promise.allSettled([
          getAcademicProfile(providerId),
          searchCourses({ userId: providerId, status: 'approved' }),
        ]);

        if (profileResult.status === 'fulfilled') {
          setProviderProfile(profileResult.value);
        } else {
          setProviderProfile(null);
        }

        if (coursesResult.status === 'fulfilled') {
          setProviderCoursesCount(coursesResult.value.data?.items?.length || 0);
        } else {
          setProviderCoursesCount(0);
        }
      } else {
        setProviderProfile(null);
        setProviderCoursesCount(0);
      }

      // Nếu user là learner, kiểm tra xem đã đăng ký khóa này chưa và lấy tiến độ học
      if (role === 'learner') {
        const enrollData = await getMyEnrollments();
        setEnrollments(enrollData);

        const isEnrolled = enrollData.some((e: any) => e.course?.courseId === courseId);
        if (isEnrolled) {
          // Lấy trạng thái hoàn thành của từng bài học
          const progressPromises = lessonsData.map(async (l: any) => {
            try {
              const res = await api.get(`/progress/lessonId/${l.lessonId}/complete`);
              return { lessonId: String(l.lessonId), status: res.data?.status };
            } catch {
              return { lessonId: String(l.lessonId), status: null };
            }
          });
          const progressResults = await Promise.all(progressPromises);
          const completedIds = new Set<string>();
          progressResults.forEach((r) => {
            if (r.status === 'COMPLETED') {
              completedIds.add(r.lessonId);
            }
          });
          setCompletedLessonIds(completedIds);
        } else {
          setCompletedLessonIds(new Set());
        }
      } else {
        setCompletedLessonIds(new Set());
      }
    } catch (error) {
      console.warn('Failed to load real course details, using mock fallback:', error);
      // Dữ liệu giả lập (mock fallback) phòng trường hợp API lỗi để tránh crash trang
      setCourse({
        courseId,
        title: courseId === 8 ? 'Node.js Backend Engineering' : 'Course Detail',
        description: 'Design REST APIs, build robust authentication, and deploy microservices with modern Node.js and NestJS.',
        duration: 12,
        language: 'English',
        enrollmentCount: 120,
        user: { userId: 4, fullName: 'Minh Tran' },
      });
      setProviderProfile(null);
      setProviderCoursesCount(0);
      setLessonsList([
        { lessonId: 'l1', title: 'Introduction to Node.js', videoDuration: 600, type: 'Video', duration: '10m' },
        { lessonId: 'l2', title: 'Building REST APIs', videoDuration: 900, type: 'Video', duration: '15m' },
        { lessonId: 'l3', title: 'JWT Authentication', videoDuration: 1200, type: 'Video', duration: '20m' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Tải lại dữ liệu khi ID khóa học hoặc Role thay đổi
  useEffect(() => {
    loadData();
  }, [courseId, role]);

  // Tránh lỗi null object khi chưa tải xong dữ liệu
  const matchedCourse = course || {
    courseId,
    title: 'Loading course...',
    description: '',
    duration: 0,
    language: 'English',
    enrollmentCount: 0,
    user: { userId: 0, fullName: 'Unknown' },
  };

  const providerId = matchedCourse.user?.userId;
  const resolvedProviderProfile = {
    userId: providerId,
    fullName: providerProfile?.fullName || matchedCourse.user?.fullName || 'Tech Mentor',
    expertise: providerProfile?.expertise || 'Course Provider',
    bio: providerProfile?.bio || '',
    rating: 4.8,
  };
  const relatedCourses: any[] = []; // Chờ nâng cấp danh sách khóa học liên quan

  const outcomes = [
    'Gain a deep understanding of core concepts and principles.',
    'Build real-world projects to apply and reinforce your knowledge.',
    'Learn industry best practices and design patterns.',
    'Establish a solid foundation for advanced studies and career growth.'
  ];
  const skills = ['Technology', 'Programming', 'Development'];

  // Kiểm tra xem learner hiện tại đã tham gia khóa học này chưa
  const isEnrolled = role === 'learner' && enrollments.some(e => e.course?.courseId === matchedCourse.courseId);

  // --- 2. HÀM ĐĂNG KÝ HỌC (ENROLL COURSE) ---
  const handleEnroll = async () => {
    if (role === 'guest') {
      toast.error('Please sign in to enroll in courses.');
      navigate('/login');
      return;
    }

    if (role !== 'learner') {
      toast.error('Only learners can enroll in courses.');
      return;
    }

    try {
      setIsLoading(true);
      await enrollCourse(matchedCourse.courseId);
      toast.success('Successfully enrolled in course!');
      const enrollData = await getMyEnrollments();
      setEnrollments(enrollData);
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll.');
    } finally {
      setIsLoading(false);
    }
  };

  // Các role đặc biệt không tham gia học (khách, provider, admin, manager)
  const isSpecialRole = ['guest', 'course provider', 'admin', 'academic manager'].includes(role);

  const currentEnrollment = enrollments.find(e => e.course?.courseId === matchedCourse.courseId);
  const progressVal = isSpecialRole ? 0 : (isEnrolled ? (currentEnrollment?.progress ?? 0) : 0);
  const enrolled = isEnrolled;

  const totalLessons = lessonsList.length;
  const totalLessonMinutes = lessonsList.reduce((sum, lesson) => sum + getLessonDurationMinutes(lesson), 0);
  const courseDurationLabel = formatCourseHours(totalLessonMinutes);
  const completedLessons = enrolled ? completedLessonIds.size : 0;

  // Kiểm tra bài học có bị khóa do chưa hoàn thành bài học tiên quyết (prerequisite) không
  const isLockedByPrerequisites = (l: any) => {
    if (!l.prerequisites || l.prerequisites.length === 0) return false;
    return l.prerequisites.some((prereq: any) => {
      const reqId = String(prereq.prerequisiteLessonId);
      return !completedLessonIds.has(reqId);
    });
  };

  // Xác định bài học tiếp theo cần học (chưa hoàn thành và không bị khóa bởi bài tiên quyết)
  const currentLessonId = enrolled ? lessonsList.find((l) => {
    const isCompleted = completedLessonIds.has(String(l.lessonId));
    const isLocked = isLockedByPrerequisites(l);
    return !isCompleted && !isLocked;
  })?.lessonId : null;

  // --- 3. DỰNG LẠI KHUNG CHƯƠNG TRÌNH HỌC (CURRICULUM) ---
  const dynamicCurriculum: Module[] = [
    {
      id: 'm1',
      title: 'Lesson Curriculum',
      description: 'Lessons list',
      progress: progressVal,
      lessons: lessonsList.map((l) => {
        let status: LessonStatus = 'not-started';

        if (isSpecialRole) {
          status = 'not-started';
        } else {
          if (!enrolled) {
            status = 'locked';
          } else {
            const isCompleted = completedLessonIds.has(String(l.lessonId));
            const isLocked = isLockedByPrerequisites(l);
            if (isCompleted) {
              status = 'completed';
            } else if (isLocked) {
              status = 'locked';
            } else if (l.lessonId === currentLessonId) {
              status = 'current';
            } else {
              status = 'not-started';
            }
          }
        }

        return {
          id: String(l.lessonId),
          title: l.title,
          status,
          preview: l.preview || false,
          type: getLessonType(l) as any,
          duration: l.duration || (getLessonDurationMinutes(l) ? `${getLessonDurationMinutes(l)}m` : '0m'),
          videoUrl: l.videoUrl || '',
          content: l.content || '',
          hasVideo: Boolean(l.videoUrl),
          hasReading: Boolean(l.content),
          hasAssessment: getLessonType(l) === 'Assessment',
          prerequisites: l.prerequisites || [],
        };
      }),
    }
  ];

  const instructorName = matchedCourse.user?.fullName || 'Tech Mentors';
  const instructorAvatar = instructorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const instructorAvatarUrl = providerProfile?.avatarUrl || matchedCourse.user?.avatarUrl || matchedCourse.user?.avatar || '';

  // Phân giải đường dẫn chi tiết khóa học dựa trên vai trò của người dùng
  const getCourseDetailPath = (id: number) => {
    if (role === 'learner') return `/learner/courses/detail?id=${id}`;
    if (role === 'course provider') return `/provider/courses/detail?id=${id}`;
    if (role === 'academic manager') return `/academic/courses/detail?id=${id}`;
    return `/courses/detail?id=${id}`;
  };

  // Phân giải đường dẫn hồ sơ giảng viên dựa trên vai trò của người dùng
  const getProviderProfilePath = (id: number) => {
    if (role === 'learner') return `/learner/providers/${id}`;
    if (role === 'course provider') return `/provider/providers/${id}`;
    if (role === 'academic manager') return `/academic/providers/${id}`;
    if (role === 'admin') return `/admin/providers/${id}`;
    return `/providers/${id}`;
  };

  // --- 4. HÀM HỌC TIẾP (CONTINUE COURSE) ---
  const handleContinueCourse = () => {
    if (!enrolled) {
      handleEnroll();
      return;
    }

    const nextLesson = dynamicCurriculum
      .flatMap(module => module.lessons)
      .find(lesson => lesson.status === 'current' || lesson.status === 'not-started')
      || dynamicCurriculum.flatMap(module => module.lessons)[0];

    if (!nextLesson) {
      toast.error('No lesson is available for this course yet.');
      return;
    }

    navigate(`/learner/lesson?courseId=${matchedCourse.courseId}&lessonId=${nextLesson.id}`);
  };

  // --- 5. HÀM PHÊ DUYỆT KHÓA HỌC (ADMIN/MANAGER) ---
  const handleApproveCourse = async (id: number) => {
    try {
      await approveCourse(id);
      toast.success('Course approved successfully!');
      await loadData();
    } catch (e: any) {
      console.log('Backend approve failed', e);
      toast.error(e.response?.data?.message || 'Failed to approve course.');
    }
  };

  // --- 6. HÀM TỪ CHỐI KHÓA HỌC (ADMIN/MANAGER) ---
  const handleRejectCourse = async (id: number, reason: string) => {
    try {
      await rejectCourse(id);
      toast.success('Course rejected successfully!');
      await loadData();
    } catch (e: any) {
      console.log('Backend reject failed', e);
      toast.error(e.response?.data?.message || 'Failed to reject course.');
    }
  };

  return {
    matchedCourse,
    providerProfile: resolvedProviderProfile,
    providerCoursesCount,
    relatedCourses,
    role,
    enrolled,
    progressVal,
    completedLessons,
    totalLessons,
    dynamicCurriculum,
    instructorName,
    instructorAvatar,
    instructorAvatarUrl,
    courseDurationLabel,
    skills,
    outcomes,
    handleEnroll,
    handleContinueCourse,
    getCourseDetailPath,
    getProviderProfilePath,
    navigate,
    isLoading,
    handleApproveCourse,
    handleRejectCourse,
  };
}

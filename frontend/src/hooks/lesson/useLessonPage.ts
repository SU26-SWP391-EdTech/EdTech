import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Lesson, MockEnrollment, Module, Note } from '../../types/lesson/lesson.types';
import {
  getMockCode,
  getYoutubeEmbedUrl,
  SAVED_NOTES
} from '../../utils/lesson/lessonUtils';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { getCourseById } from '../../services/course/course.service';
import { getLessonsByCourse, getLessonsByCourseForManager } from '../../services/lesson/lesson.service';
import { getMyEnrollments, updateEnrollmentProgress } from '../../services/enrollment/enrollment.service';
import api from '../../lib/axios';
import { updateStreak } from '../../utils/learner/streakUtils';

/**
 * Xác định loại hình bài học (Lesson Type) dựa vào các trường thông tin của bài học.
 * Các loại hình: 'Assessment' (Bài kiểm tra), 'Video & Reading' (Video và tài liệu đọc), 'Video', 'Reading'.
 * 
 * @param lesson - Thông tin bài học cần phân loại
 * @returns Loại hình bài học dưới dạng chuỗi
 */
function getLessonType(lesson: any) {
  if (lesson.type === 'Assessment') return 'Assessment';
  if (lesson.hasAssessment) return 'Assessment';
  if (lesson.assessments && lesson.assessments.length > 0) return 'Assessment';

  const lessonId = lesson.lessonId || lesson.id;
  if (lessonId) {
    // Kiểm tra trong localStorage xem bài học này có bài test PvP/Quiz đính kèm nào được lưu tạm không
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
 * Custom hook quản lý vòng đời và tương tác trên trang Học bài học (Lesson Page).
 * Tải thông tin giáo trình khóa học, danh sách bài học, tiến độ hoàn thành từ Backend.
 * Xử lý cơ chế mở khóa bài học dựa trên ràng buộc bài học tiên quyết (Prerequisites).
 * Tự động gửi API ghi nhận bắt đầu học khi mở bài học mới.
 * Hỗ trợ ghi chép bài học (Notes), thảo luận (Discussion), sao chép mã nguồn ví dụ, và điều hướng chuyển bài học.
 */
export function useLessonPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 1. PARSE THÔNG TIN URL ---
  const courseId = Number(searchParams.get('courseId') || 8); // ID khóa học, mặc định 8 nếu thiếu
  const activeLessonId = searchParams.get('lessonId');        // ID bài học hiện đang chọn học

  // --- 2. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [course, setCourse] = useState<any>(null);                                    // Chi tiết khóa học hiện tại
  const [lessonsList, setLessonsList] = useState<any[]>([]);                          // Danh sách bài học của khóa học
  const [enrollments, setEnrollments] = useState<any[]>([]);                          // Thông tin đăng ký học của user
  const [isLoading, setIsLoading] = useState(true);                                   // Trạng thái đang tải dữ liệu
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set()); // Tập hợp các ID bài học học viên đã hoàn thành

  const user = useAuthStore((state) => state.user);
  const role = user?.roleName?.toLowerCase() || 'guest';

  // --- 3. EFFECT: TẢI TOÀN BỘ DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Tải đồng thời thông tin khóa học và danh sách bài học tương ứng (Academic Manager dùng API manager-review)
        const fetchLessons = role === 'academic manager' 
          ? getLessonsByCourseForManager(courseId)
          : getLessonsByCourse(courseId);

        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          fetchLessons,
        ]);
        setCourse(courseData);
        setLessonsList(lessonsData);

        // Nếu là Học viên, tải thêm tiến độ đăng ký học và kiểm tra trạng thái hoàn thành của từng bài học
        if (role === 'learner') {
          const enrolls = await getMyEnrollments();
          setEnrollments(enrolls);

          // Gọi API kiểm tra xem từng bài học đã được đánh dấu hoàn thành (COMPLETED) chưa
          const progressPromises = lessonsData.map(async (l: any) => {
            try {
              const res = await api.get(`/progress/lessonId/${l.lessonId}/complete`);
              return { lessonId: String(l.lessonId), status: res.data?.status || null };
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
          setEnrollments([]);
          setCompletedLessonIds(new Set());
        }
      } catch (error) {
        console.error('Failed to load lesson page data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [courseId, role]);

  const matchedCourse: any = course || {
    courseId,
    title: 'Loading course...',
    curriculum: [],
  };

  // Định dạng danh sách bài học thô thành cấu trúc sử dụng trong giao diện Lesson Page
  const rawModules = [
    {
      id: 'm1',
      title: 'Lesson Curriculum',
      description: 'Lessons list',
      lessons: lessonsList.map(l => ({
        id: String(l.lessonId),
        title: l.title,
        duration: (() => {
          if (getLessonType(l) === 'Assessment') return '15m';
          const hasVideo = Boolean(l.videoUrl);
          const hasReading = Boolean(l.content);
          const videoMin = l.videoDuration ? Math.round(l.videoDuration / 60) : 0;
          if (hasVideo && hasReading) {
            return `${videoMin + 10}m`;
          }
          if (hasVideo) {
            return `${videoMin}m`;
          }
          if (hasReading) {
            return '10m';
          }
          return '10m';
        })(),
        type: getLessonType(l),
        preview: false,
        videoUrl: l.videoUrl || '',
        content: l.content || '',
        hasVideo: Boolean(l.videoUrl),
        hasReading: Boolean(l.content),
        hasAssessment: getLessonType(l) === 'Assessment',
        prerequisites: l.prerequisites || [],
      })),
    }
  ];

  const currentEnrollment = enrollments.find(e => e.course?.courseId === courseId);
  const isEnrolled = role === 'learner' && Boolean(currentEnrollment);
  const isSpecialRole = ['guest', 'course provider', 'admin', 'academic manager'].includes(role);
  const progressVal = isSpecialRole ? 0 : (isEnrolled ? (currentEnrollment?.progress ?? 0) : 0);

  // --- 4. CÁC STATE PHỤ TRÊN GIAO DIỆN ---
  const [videoProgress] = useState(34);                                         // Phần trăm xem video (mô phỏng)
  const [expandedModules, setExpandedModules] = useState<string[]>([]);           // Các module đang được mở rộng trên cây sidebar
  const [noteText, setNoteText] = useState('');                                   // Nội dung ghi chú mới nhập
  const [notes, setNotes] = useState<Note[]>(SAVED_NOTES);                       // Danh sách các ghi chú cá nhân của bài học
  const [copiedCode, setCopiedCode] = useState(false);                            // Trạng thái đã sao chép code ví dụ
  const [questionText, setQuestionText] = useState('');                           // Nội dung câu hỏi thảo luận mới nhập
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content'); // Tab tương tác hiện tại

  // --- 5. EFFECT: TỰ ĐỘNG KHỞI TẠO TIẾN ĐỘ HỌC BÀI HỌC (START PROGRESS) ---
  // Khi học viên chọn một bài học chưa hoàn thành, tự động gọi API `/progress/lesson/{id}/start` để ghi nhận
  useEffect(() => {
    if (role !== 'learner' || !activeLessonId || isLoading) return;
    
    const lessonStrId = String(activeLessonId);
    if (completedLessonIds.has(lessonStrId)) return;

    async function checkAndStartProgress() {
      try {
        const res = await api.get(`/progress/lessonId/${activeLessonId}/complete`);
        if (!res.data || !res.data.status) {
          try {
            await api.post(`/progress/lesson/${activeLessonId}/start`);
          } catch (startErr) {
            console.warn('Failed to start lesson progress:', startErr);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            await api.post(`/progress/lesson/${activeLessonId}/start`);
          } catch (startErr) {
            console.warn('Failed to start lesson progress:', startErr);
          }
        }
      }
    }
    checkAndStartProgress();
  }, [activeLessonId, role, isLoading]);

  const hasTrackedLessonProgress = completedLessonIds.size > 0;
  const completedFromProgressCount = !hasTrackedLessonProgress && rawModules.length > 0
    ? Math.round((progressVal / 100) * rawModules.reduce((acc: number, mod: any) => acc + (mod.lessons || []).length, 0))
    : 0;

  /**
   * Helper kiểm tra bài học có bị khóa do chưa hoàn thành các bài học tiên quyết (Prerequisites) hay không.
   */
  const isLockedByPrerequisites = (l: any) => {
    if (!l.prerequisites || l.prerequisites.length === 0) return false;
    return l.prerequisites.some((prereq: any) => {
      const reqId = String(prereq.prerequisiteLessonId);
      return !completedLessonIds.has(reqId); // Nếu có bất kỳ bài tiên quyết nào chưa hoàn thành -> Bài này bị khóa
    });
  };

  // Xác định ID bài học hiện tại mà học viên nên học (bài chưa xong đầu tiên không bị khóa)
  const currentLessonId = rawModules
    .flatMap(m => m.lessons)
    .find(l => {
      const lessonKey = String(l.id);
      const isCompleted = completedLessonIds.has(lessonKey);
      const isLocked = isLockedByPrerequisites(l);
      return !isCompleted && !isLocked;
    })?.id;

  let lessonCounter = 0;
  // Map lại cấu trúc bài học và gán trạng thái động ('completed', 'locked', 'current', 'upcoming')
  const modules: Module[] = rawModules.map((m: any) => {
    let completedInModule = 0;
    const mappedLessons = (m.lessons || []).map((l: any) => {
      lessonCounter++;
      let status: Lesson['status'] = 'upcoming';

      if (isSpecialRole) {
        if (role === 'guest') {
          status = l.preview ? 'upcoming' : 'locked';
        } else {
          status = 'upcoming';
        }
      } else {
        const lessonKey = String(l.id);
        const isCompleted = completedLessonIds.has(lessonKey);
        const isLocked = isLockedByPrerequisites(l);

        if (isCompleted) {
          status = 'completed';
          completedInModule++;
        } else if (isLocked) {
          status = 'locked';
        } else if (l.id === currentLessonId) {
          status = 'current';
        } else {
          status = 'upcoming';
        }
      }
      return {
        id: l.id,
        title: l.title,
        duration: l.duration,
        type: l.type || 'Video',
        preview: l.preview || false,
        videoUrl: l.videoUrl || '',
        content: l.content || '',
        hasVideo: l.hasVideo,
        hasReading: l.hasReading,
        hasAssessment: l.hasAssessment,
        status,
      };
    });

    const moduleProgress = m.lessons.length > 0 ? Math.round((completedInModule / m.lessons.length) * 100) : 0;

    return {
      id: m.id,
      title: m.title,
      description: m.description || '',
      progress: moduleProgress,
      lessons: mappedLessons,
    };
  });

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.status === 'completed').length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Lấy ra bài học active hiện tại dựa trên ID từ URL
  let activeLesson: Lesson | undefined;
  for (const mod of modules) {
    const found = mod.lessons.find(l => String(l.id) === String(activeLessonId));
    if (found) {
      activeLesson = found;
      break;
    }
  }

  // Fallback: nếu không tìm thấy bài học active trên URL, lấy bài học có status 'current' đầu tiên
  if (!activeLesson) {
    for (const mod of modules) {
      const found = mod.lessons.find(l => l.status === 'current');
      if (found) {
        activeLesson = found;
        break;
      }
    }
  }
  // Fallback 2: nếu vẫn không có, mặc định chọn bài học đầu tiên
  if (!activeLesson && modules.length > 0 && modules[0].lessons.length > 0) {
    activeLesson = modules[0].lessons[0];
  }

  const activeModule = modules.find(m => m.lessons.some(l => l.id === activeLesson?.id));
  const activeModuleId = activeModule ? String(activeModule.id) : '';
  const flatLessons = modules.flatMap(m => m.lessons);
  const activeLessonIndex = flatLessons.findIndex(l => l.id === activeLesson?.id);
  const isCompleted = activeLesson?.status === 'completed';
  const activeVideoUrl = activeLesson?.videoUrl?.trim();
  const youtubeEmbedUrl = getYoutubeEmbedUrl(activeVideoUrl);

  // Tự động expand module chứa bài học active trên sidebar khi load trang
  useEffect(() => {
    if (activeModuleId) {
      setExpandedModules(prev => prev.includes(activeModuleId) ? prev : [...prev, activeModuleId]);
    }
  }, [activeLessonId, activeModuleId]);

  // --- 6. HÀM XỬ LÝ HÀNH ĐỘNG (INTERACTION HANDLERS) ---
  // Ẩn/hiện module trên sidebar
  const toggleModule = (id: string | number) => {
    setExpandedModules(prev =>
      prev.includes(String(id)) ? prev.filter(m => m !== String(id)) : [...prev, String(id)]
    );
  };

  // Sao chép code ví dụ của khóa học vào clipboard
  const handleCopyCode = () => {
    setCopiedCode(true);
    navigator.clipboard.writeText(getMockCode(matchedCourse.title).code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Thêm một dòng ghi chép cá nhân tương ứng mốc thời gian video
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const mins = Math.floor((videoProgress / 100) * 18);
    const secs = Math.floor(Math.random() * 60);
    const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;
    const colors = ['#FEF3C7', '#DCFCE7', '#EDE9FE', '#DBEAFE', '#FCE7F3'];
    setNotes(prev => [
      { id: Date.now(), timestamp, content: noteText, color: colors[prev.length % colors.length] },
      ...prev,
    ]);
    setNoteText('');
    toast.success('Note added!');
  };

  // Xóa ghi chú cá nhân
  const handleDeleteNote = (noteId: number) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted.');
  };

  /**
   * Đồng bộ trạng thái hoàn thành bài học (PERSIST COMPLETION) lên Backend.
   * Gửi API PATCH `/progress/lesson/{id}/complete` và tải lại enrollments để cập nhật thanh tiến độ tổng thể.
   * 
   * @param lesson - Bài học được đánh dấu hoàn thành
   * @param showToast - Có hiển thị toast thông báo thành công/thất bại hay không
   */
  const persistLessonCompletion = async (lesson: Lesson, showToast = true) => {
    if (role !== 'learner') {
      if (showToast) toast.error('Only learners can update course progress.');
      return;
    }

    const lessonId = String(lesson.id);
    if (completedLessonIds.has(lessonId)) {
      return;
    }

    try {
      // Gọi API hoàn thành bài học
      await api.patch(`/progress/lesson/${lessonId}/complete`);

      const nextCompletedIds = new Set(completedLessonIds);
      nextCompletedIds.add(lessonId);
      setCompletedLessonIds(nextCompletedIds);

      if (showToast) toast.success('Marked lesson as completed!');
      
      // Tải lại thông tin enrollments mới nhất
      const enrolls = await getMyEnrollments();
      setEnrollments(enrolls);

      // Cập nhật streak học tập của học viên
      if (user?.userId) {
        updateStreak(user.userId);
      }
      window.dispatchEvent(new CustomEvent('streak-updated'));
    } catch (err) {
      console.error('Failed to update progress on backend:', err);
      toast.error('Failed to update progress on server.');
    }
  };

  // Xử lý khi nhấn nút "Đánh dấu hoàn thành" bài học active hiện tại
  const handleMarkComplete = () => {
    if (activeLesson) {
      persistLessonCompletion(activeLesson);
    }
  };

  // Xử lý khi click chọn một bài học từ sidebar. Ngăn chặn nếu bài học đang bị khóa.
  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked') {
      if (role === 'guest') {
        toast.error('This lesson is locked. Please enroll in the course to unlock.');
      } else {
        toast.error('You must complete the prerequisite lessons before accessing this lesson.');
      }
      return;
    }
    setSearchParams({ courseId: String(courseId), lessonId: String(lesson.id) });
  };

  // Điều hướng sang bài học phía trước (Previous Lesson)
  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prev = flatLessons[activeLessonIndex - 1];
      if (prev.status === 'locked') {
        if (role === 'guest') {
          toast.error('The previous lesson is locked. Please enroll in the course.');
        } else {
          toast.error('The previous lesson is locked. Please complete the prerequisites.');
        }
        return;
      }
      setSearchParams({ courseId: String(courseId), lessonId: String(prev.id) });
    }
  };

  // Điều hướng sang bài học tiếp theo (Next Lesson)
  const handleNextLesson = () => {
    if (activeLessonIndex < flatLessons.length - 1) {
      const next = flatLessons[activeLessonIndex + 1];
      if (next.status === 'locked') {
        if (role === 'guest') {
          toast.error('The next lesson is locked. Please enroll in the course.');
        } else {
          toast.error('The next lesson is locked. Please complete the prerequisites.');
        }
        return;
      }
      setSearchParams({ courseId: String(courseId), lessonId: String(next.id) });
    }
  };

  // Quay trở lại trang chi tiết khóa học tương ứng với vai trò của user
  const handleBackToCourse = () => {
    if (role === 'learner') {
      navigate(`/learner/courses/detail?id=${courseId}`);
    } else if (role === 'course provider') {
      navigate(`/provider/courses/detail?id=${courseId}`);
    } else if (role === 'academic manager') {
      navigate(`/academic/courses/detail?id=${courseId}`);
    } else {
      navigate(`/courses/detail?id=${courseId}`);
    }
  };

  const mockCodeInfo = getMockCode(matchedCourse.title);

  return {
    courseId,
    activeLessonId,
    matchedCourse,
    rawModules,
    enrollments,
    user,
    role,
    currentEnrollment,
    isEnrolled,
    isSpecialRole,
    progressVal,
    videoProgress,
    expandedModules,
    completedLessonIds,
    noteText,
    notes,
    copiedCode,
    questionText,
    activeTab,
    mockCodeInfo,
    hasTrackedLessonProgress,
    completedFromProgressCount,
    modules,
    totalLessons,
    completedLessons,
    overallProgress,
    activeLesson,
    activeModule,
    activeModuleId,
    flatLessons,
    activeLessonIndex,
    isCompleted,
    activeVideoUrl,
    youtubeEmbedUrl,
    setExpandedModules,
    setCompletedLessonIds,
    setNoteText,
    setNotes,
    setCopiedCode,
    setQuestionText,
    setActiveTab,
    toggleModule,
    handleCopyCode,
    handleAddNote,
    handleDeleteNote,
    persistLessonCompletion,
    handleMarkComplete,
    handleLessonClick,
    handlePrevLesson,
    handleNextLesson,
    handleBackToCourse,
    isLoading
  };
}

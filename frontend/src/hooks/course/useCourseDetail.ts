import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';
import type { Module, LessonStatus } from '../../types/course/course-detail.types';
import { getCourseById, approveCourse, rejectCourse, searchCourses } from '../../services/course/course.service';
import { getLessonsByCourse } from '../../services/lesson/lesson.service';
import { getMyEnrollments, enrollCourse } from '../../services/enrollment/enrollment.service';
import { getAcademicProfile } from '../../services/user/user.service';

function getLessonType(lesson: any) {
  const hasVideo = Boolean(lesson.videoUrl);
  const hasReading = Boolean(lesson.content);

  if (hasVideo && hasReading) return 'Video & Reading';
  if (hasVideo) return 'Video';
  if (hasReading) return 'Reading';
  return 'Reading';
}

function getLessonDurationMinutes(lesson: any) {
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
  return 10; // Default fallback for any lesson type
}

function formatCourseHours(totalMinutes: number) {
  const hours = totalMinutes / 60;
  if (hours === 0) return '0 hours';
  if (hours < 1) return `${totalMinutes} min`;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hours`;
}

export function useCourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user);
  const role = user?.roleName?.toLowerCase() || 'guest';

  // Get active course ID from URL or location state, default to 1 (since 1 is a valid course in DB)
  const courseId = Number(searchParams.get('id') || location.state?.courseId || 1);

  const [course, setCourse] = useState<any>(null);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [providerCoursesCount, setProviderCoursesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    try {
      setIsLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessonsList(lessonsData);

      const providerId = courseData.user?.userId;

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

      if (role === 'learner') {
        const enrollData = await getMyEnrollments();
        setEnrollments(enrollData);
      }
    } catch (error) {
      console.warn('Failed to load real course details, using mock fallback:', error);
      // Fallback mock course structure to prevent page crashes
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

  useEffect(() => {
    loadData();
  }, [courseId, role]);

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
  const relatedCourses: any[] = []; // empty related courses for now or static fallback

  const outcomes = [
    'Gain a deep understanding of core concepts and principles.',
    'Build real-world projects to apply and reinforce your knowledge.',
    'Learn industry best practices and design patterns.',
    'Establish a solid foundation for advanced studies and career growth.'
  ];
  const skills = ['Technology', 'Programming', 'Development'];

  const isEnrolled = role === 'learner' && enrollments.some(e => e.course?.courseId === matchedCourse.courseId);

  // Enrollment handler calling the real API
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

  const isSpecialRole = ['guest', 'course provider', 'admin', 'academic manager'].includes(role);

  const currentEnrollment = enrollments.find(e => e.course?.courseId === matchedCourse.courseId);
  const progressVal = isSpecialRole ? 0 : (isEnrolled ? (currentEnrollment?.progress ?? 0) : 0);
  const enrolled = isEnrolled;

  const totalLessons = lessonsList.length;
  const totalLessonMinutes = lessonsList.reduce((sum, lesson) => sum + getLessonDurationMinutes(lesson), 0);
  const courseDurationLabel = formatCourseHours(totalLessonMinutes);
  // Estimate completed lessons from progress percentage
  const completedLessons = enrolled ? Math.round((progressVal / 100) * totalLessons) : 0;

  // Build the dynamic curriculum with a single main module
  const dynamicCurriculum: Module[] = [
    {
      id: 'm1',
      title: 'Lesson Curriculum',
      description: 'Lessons list',
      progress: progressVal,
      lessons: lessonsList.map((l, index) => {
        let status: LessonStatus = 'not-started';
        const lessonIndex = index + 1;

        if (isSpecialRole) {
          status = 'not-started';
        } else {
          if (!enrolled) {
            status = 'locked';
          } else {
            if (lessonIndex <= completedLessons) {
              status = 'completed';
            } else if (lessonIndex === completedLessons + 1) {
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
        };
      }),
    }
  ];

  const instructorName = matchedCourse.user?.fullName || 'Tech Mentors';
  const instructorAvatar = instructorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const instructorAvatarUrl = providerProfile?.avatarUrl || matchedCourse.user?.avatarUrl || matchedCourse.user?.avatar || '';

  const getCourseDetailPath = (id: number) => {
    if (role === 'learner') return `/learner/courses/detail?id=${id}`;
    if (role === 'course provider') return `/provider/courses/detail?id=${id}`;
    if (role === 'academic manager') return `/academic/courses/detail?id=${id}`;
    return `/courses/detail?id=${id}`;
  };

  const getProviderProfilePath = (id: number) => {
    if (role === 'learner') return `/learner/providers/${id}`;
    if (role === 'course provider') return `/provider/providers/${id}`;
    if (role === 'academic manager') return `/academic/providers/${id}`;
    if (role === 'admin') return `/admin/providers/${id}`;
    return `/providers/${id}`;
  };

  const handleContinueCourse = () => {
    if (!enrolled) {
      handleEnroll();
      return;
    }

    // Direct to the first lesson that is not completed or the very first lesson
    const firstLessonId = lessonsList[0]?.lessonId;
    if (!firstLessonId) {
      toast.error('No lesson is available for this course yet.');
      return;
    }

    navigate(`/learner/lesson?courseId=${matchedCourse.courseId}&lessonId=${firstLessonId}`);
  };

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

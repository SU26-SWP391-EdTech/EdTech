import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.stores';
import { MOCK_COURSES, MOCK_PROVIDER_PROFILES } from '../../db/data';
import { approveCourse, rejectCourse } from '../../services/course.service';
import toast from 'react-hot-toast';
import type { Module, LessonStatus } from './types';

export function useCourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user);
  const role = user?.roleName?.toLowerCase() || 'guest';

  // Get active course from URL or location state
  const courseId = Number(searchParams.get('id') || location.state?.courseId || 8);
  const matchedCourse: any = MOCK_COURSES.find(c => c.courseId === courseId) || MOCK_COURSES[0];
  const providerId = matchedCourse.user?.userId;
  const providerProfile = MOCK_PROVIDER_PROFILES.find(provider => provider.userId === providerId);
  const providerCourses = MOCK_COURSES.filter(course => course.user?.userId === providerId);
  const providerLearnerCount = providerCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
  const relatedCourses = MOCK_COURSES
    .filter(course => course.courseId !== matchedCourse.courseId)
    .sort((a, b) => {
      const aScore = Number(a.language === matchedCourse.language) + Number(a.user?.userId === providerId);
      const bScore = Number(b.language === matchedCourse.language) + Number(b.user?.userId === providerId);
      return bScore - aScore;
    })
    .slice(0, 3);

  const outcomes = matchedCourse.outcomes || [];
  const prerequisites = matchedCourse.prerequisites || [];
  const audience = matchedCourse.audience || [];
  const skills = matchedCourse.skills || [];
  const curriculum = matchedCourse.curriculum || [];

  // Load and manage enrollments dynamically
  const [enrollments, setEnrollments] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('explore_cache_enrollments');
    return cached ? JSON.parse(cached) : [];
  });

  const isEnrolled = role === 'learner' && enrollments.some(e => e.course?.courseId === matchedCourse.courseId);

  // Enrollment handler
  const handleEnroll = () => {
    if (role === 'guest') {
      toast.error('Please sign in to enroll in courses.');
      navigate('/login');
      return;
    }

    if (role !== 'learner') {
      toast.error('Only learners can enroll in courses.');
      return;
    }

    const newEnrollment = {
      enrollmentId: Date.now(),
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      lastAccessedAt: new Date().toISOString(),
      completedAt: null,
      expiresAt: null,
      course: matchedCourse,
    };
    const updated = [...enrollments, newEnrollment];
    setEnrollments(updated);
    sessionStorage.setItem('explore_cache_enrollments', JSON.stringify(updated));
    toast.success('Successfully enrolled! (Mock)');
  };

  const isSpecialRole = ['guest', 'course provider', 'admin', 'academic manager'].includes(role);

  // Set progress: 0 for special roles, actual progress from enrollment for learner
  const currentEnrollment = enrollments.find(e => e.course?.courseId === matchedCourse.courseId);
  const completedLessonIds = new Set<string>((currentEnrollment?.completedLessonIds || []).map(String));
  const progressVal = isSpecialRole ? 0 : (isEnrolled ? (currentEnrollment?.progress ?? 0) : 0);
  const enrolled = isEnrolled;

  const totalLessons = curriculum.reduce((acc: number, m: any) => acc + (m.lessons || []).length, 0);
  const completedLessons = isSpecialRole
    ? 0
    : completedLessonIds.size > 0
      ? completedLessonIds.size
      : (enrolled ? Math.round((progressVal / 100) * totalLessons) : 0);

  // Dynamically map curriculum lessons status based on progress and role
  let lessonCounter = 0;
  const dynamicCurriculum: Module[] = curriculum.map((m: any) => {
    let completedInModule = 0;
    const mappedLessons = (m.lessons || []).map((l: any) => {
      lessonCounter++;
      let status: LessonStatus = 'not-started';

      if (isSpecialRole) {
        if (role === 'guest') {
          status = l.preview ? 'not-started' : 'locked';
        } else {
          status = 'not-started';
        }
      } else {
        if (!enrolled) {
          status = l.preview ? 'not-started' : 'locked';
        } else {
          if (completedLessonIds.has(String(l.id)) || lessonCounter <= completedLessons) {
            status = 'completed';
            completedInModule++;
          } else if (lessonCounter === completedLessons + 1) {
            status = 'current';
          } else {
            status = 'not-started';
          }
        }
      }
      return { ...l, status };
    });

    const moduleProgress = m.lessons.length > 0 ? Math.round((completedInModule / m.lessons.length) * 100) : 0;

    return {
      ...m,
      lessons: mappedLessons,
      progress: moduleProgress,
    };
  });

  // Category and Difficulty labels
  const categoryLabel = matchedCourse.title.toLowerCase().includes('react') || matchedCourse.title.toLowerCase().includes('next.js')
    ? 'Frontend Development'
    : 'Backend Development';
  const courseDuration = matchedCourse.duration || 0;
  const difficultyLabel = courseDuration > 15 ? 'Advanced' : courseDuration > 10 ? 'Intermediate' : 'Beginner';
  const instructorName = matchedCourse.user?.fullName || 'Tech Mentors';
  const instructorAvatar = instructorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
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

  const getContinueLessonId = () => {
    const flatLessons = dynamicCurriculum.flatMap(module => module.lessons || []);
    const currentLesson = flatLessons.find(lesson => lesson.status === 'current');
    const firstOpenLesson = flatLessons.find(lesson => lesson.status !== 'locked' && lesson.status !== 'completed');
    const firstLesson = flatLessons.find(lesson => lesson.status !== 'locked');

    return currentLesson?.id || firstOpenLesson?.id || firstLesson?.id;
  };

  const handleContinueCourse = () => {
    if (!enrolled) {
      handleEnroll();
      return;
    }

    const lessonId = getContinueLessonId();
    if (!lessonId) {
      toast.error('No lesson is available for this course yet.');
      return;
    }

    navigate(`/learner/lesson?courseId=${matchedCourse.courseId}&lessonId=${lessonId}`);
  };

  const handleApproveCourse = async (id: number) => {
    try {
      await approveCourse(id);
    } catch (e) {
      console.log('Backend approve failed', e);
    }
    
    // Update MOCK_COURSES in db/data.ts:
    const dbIndex = MOCK_COURSES.findIndex(c => c.courseId === id || c.id === id);
    if (dbIndex !== -1) {
      MOCK_COURSES[dbIndex].status = 'approved' as any;
    }
    
    // Update MOCK_COURSES in useCourseManagement:
    try {
      const { MOCK_COURSES: managementMockCourses } = await import('../CourseManagement/useCourseManagement');
      const mockIndex = managementMockCourses.findIndex(c => c.id === id || c.courseId === id);
      if (mockIndex !== -1) {
        managementMockCourses[mockIndex].status = 'Published';
      }
    } catch (e) {
      console.error(e);
    }

    toast.success('Course approved successfully!');
  };

  const handleRejectCourse = async (id: number, reason: string) => {
    try {
      await rejectCourse(id);
    } catch (e) {
      console.log('Backend reject failed', e);
    }
    
    // Update MOCK_COURSES in db/data.ts:
    const dbIndex = MOCK_COURSES.findIndex(c => c.courseId === id || c.id === id);
    if (dbIndex !== -1) {
      MOCK_COURSES[dbIndex].status = 'rejected' as any;
    }
    
    // Update MOCK_COURSES in useCourseManagement:
    try {
      const { MOCK_COURSES: managementMockCourses } = await import('../CourseManagement/useCourseManagement');
      const mockIndex = managementMockCourses.findIndex(c => c.id === id || c.courseId === id);
      if (mockIndex !== -1) {
        managementMockCourses[mockIndex].status = 'Rejected';
      }
    } catch (e) {
      console.error(e);
    }

    toast.success('Course rejected successfully!');
  };

  return {
    matchedCourse,
    providerProfile,
    providerCoursesCount: providerCourses.length,
    providerLearnerCount,
    relatedCourses,
    role,
    enrolled,
    progressVal,
    completedLessons,
    totalLessons,
    dynamicCurriculum,
    categoryLabel,
    difficultyLabel,
    instructorName,
    instructorAvatar,
    skills,
    outcomes,
    prerequisites,
    audience,
    handleEnroll,
    handleContinueCourse,
    getCourseDetailPath,
    getProviderProfilePath,
    navigate,
    handleApproveCourse,
    handleRejectCourse,
  };
}

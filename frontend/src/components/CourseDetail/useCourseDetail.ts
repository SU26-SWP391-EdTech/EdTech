import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.stores';
import { MOCK_COURSES } from '../../db/data';
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
  const matchedCourse = MOCK_COURSES.find(c => c.courseId === courseId) || MOCK_COURSES[0];

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
      progress: 42,
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
  const progressVal = isSpecialRole ? 0 : (isEnrolled ? (enrollments.find(e => e.course?.courseId === matchedCourse.courseId)?.progress || 42) : 0);
  const enrolled = isEnrolled;

  const totalLessons = curriculum.reduce((acc, m) => acc + (m.lessons || []).length, 0);
  const completedLessons = isSpecialRole ? 0 : (enrolled ? Math.round((progressVal / 100) * totalLessons) : 0);

  // Dynamically map curriculum lessons status based on progress and role
  let lessonCounter = 0;
  const dynamicCurriculum: Module[] = curriculum.map((m) => {
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
          if (lessonCounter <= completedLessons) {
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
  const difficultyLabel = matchedCourse.duration > 15 ? 'Advanced' : matchedCourse.duration > 10 ? 'Intermediate' : 'Beginner';
  const instructorName = matchedCourse.user?.fullName || 'Tech Mentors';
  const instructorAvatar = instructorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return {
    matchedCourse,
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
    navigate,
  };
}

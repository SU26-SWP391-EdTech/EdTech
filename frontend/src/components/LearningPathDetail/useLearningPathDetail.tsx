import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code, Layers, Database, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.stores';
import type { Course } from '../../services/course/course.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

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
  course: Course;
}

export interface Module {
  id: number;
  title: string;
  lessons: { title: string; done: boolean; duration: string }[];
}

export function useLearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPathData() {
      try {
        setIsLoading(true);
        const { MOCK_COURSES, MOCK_LEARNING_PATHS, MOCK_ENROLLMENTS } = await import('../../db/data');
        setCourses(MOCK_COURSES);

        const targetPath = MOCK_LEARNING_PATHS.find(p => p.learningPathId === parseInt(id || '1'));
        if (!targetPath) {
          toast.error('Learning Path not found!');
          navigate('/learner/explore');
          return;
        }

        setPath(targetPath);

        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        const storedEnrollments = sessionStorage.getItem('explore_cache_enrollments');
        const activeEnrollments = isLearner
          ? (storedEnrollments ? JSON.parse(storedEnrollments) : MOCK_ENROLLMENTS)
          : [];
        setEnrollments(activeEnrollments);

        // Find active/current course in path to display details first
        const pathCourses = targetPath.learningPathCourses || [];
        const currentCourse = pathCourses.find(pc => {
          const e = activeEnrollments.find((e: Enrollment) => e.course?.courseId === pc.courseId);
          return e && e.progress < 100;
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

  const pathCourses = path?.learningPathCourses || [];

  // Generate roadmap nodes dynamically based on active enrollments
  let foundFirstUnenrolled = false;
  const roadmapNodes: CourseNode[] = pathCourses.map((pc, idx) => {
    const enrollment = enrollments.find(e => e.course?.courseId === pc.courseId);
    const enrolled = !!enrollment;
    const completed = enrollment?.status === 'completed' || enrollment?.progress === 100;

    let state: NodeState = 'locked';
    if (completed) {
      state = 'completed';
    } else if (enrolled) {
      state = 'current';
    } else if (!foundFirstUnenrolled) {
      state = 'upcoming';
      foundFirstUnenrolled = true;
    } else {
      state = 'locked';
    }

    // Assign dynamic icon
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
      duration: `${pc.course?.duration || 10}h`,
      lessons: pc.course?.totalLessons || 12,
      progress: enrollment?.progress || 0,
      state,
      icon,
      color: ['#E11D48', '#D97706', '#059669', '#2563EB', '#7C3AED', '#0891B2'][idx % 6],
      topics: pc.course?.language ? [pc.course.language] : ['Development'],
      course: pc.course,
    };
  });

  // Calculate statistics
  const totalCourses = pathCourses.length;
  const completedCourses = roadmapNodes.filter(n => n.state === 'completed').length;
  
  // Calculate average progress
  const totalProgressSum = roadmapNodes.reduce((acc, n) => acc + n.progress, 0);
  const overallProgress = totalCourses > 0 ? Math.round(totalProgressSum / totalCourses) : 0;

  // Remaining lessons & study time
  const remainingLessons = roadmapNodes.reduce((acc, n) => {
    if (n.state === 'completed') return acc;
    const completedVal = Math.floor(n.lessons * (n.progress / 100));
    return acc + (n.lessons - completedVal);
  }, 0);

  const remainingHours = roadmapNodes.reduce((acc, n) => {
    if (n.state === 'completed') return acc;
    const courseHours = parseInt(n.duration) || 10;
    return acc + Math.round(courseHours * (1 - n.progress / 100));
  }, 0);

  // Generate modules for the selected active course dynamically
  const selectedNode = roadmapNodes.find(n => n.id === activeCourseId) || roadmapNodes[0];
  const activeCourse = selectedNode?.course;

  const generateModulesForCourse = (course: Course, progress: number): Module[] => {
    if (!course) return [];
    
    const baseModules = [
      { title: 'Introduction & Setup', lessonsCount: 4 },
      { title: 'Core Abstractions & Hooks', lessonsCount: 5 },
      { title: 'Advanced Design Patterns', lessonsCount: 4 },
      { title: 'Testing & Deployment', lessonsCount: 5 },
    ];

    let lessonsPassed = Math.floor((progress / 100) * course.totalLessons);
    let lessonsCounter = 0;

    return baseModules.map((m, idx) => {
      const lessons = Array.from({ length: m.lessonsCount }).map((_, lIdx) => {
        lessonsCounter++;
        const done = lessonsCounter <= lessonsPassed;
        return {
          title: `${course.title} - Step ${lessonsCounter}: ${m.title} Part ${lIdx + 1}`,
          done,
          duration: `${10 + (lessonsCounter % 3) * 5}m`,
        };
      });

      return {
        id: idx + 1,
        title: `${m.title} (${lessons.filter(l => l.done).length}/${lessons.length} Completed)`,
        lessons,
      };
    });
  };

  const currentModules = activeCourse ? generateModulesForCourse(activeCourse, selectedNode.progress) : [];

  const getCourseDetailPath = (courseId: number) => {
    const role = user?.roleName?.toLowerCase();
    if (role === 'learner') return `/learner/courses/detail?id=${courseId}`;
    if (role === 'course provider') return `/provider/courses/detail?id=${courseId}`;
    if (role === 'academic manager') return `/academic/courses/detail?id=${courseId}`;
    return `/courses/detail?id=${courseId}`;
  };

  const handleContinueCourse = (courseId: number) => {
    const node = roadmapNodes.find(n => n.id === courseId);
    if (!node || node.state === 'locked') {
      toast.error('This course is locked. Please complete or enroll in the previous courses first.');
      return;
    }

    navigate(getCourseDetailPath(courseId));
  };

  // Actions
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
      const newEnrollment: Enrollment = {
        enrollmentId: Date.now() + Math.random(),
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        lastAccessedAt: new Date().toISOString(),
        completedAt: null,
        expiresAt: null,
        course: courses.find(c => c.courseId === courseId)!,
      };

      const updated = [...enrollments, newEnrollment];
      setEnrollments(updated);
      sessionStorage.setItem('explore_cache_enrollments', JSON.stringify(updated));
      toast.success('Successfully enrolled in course!');
    } catch (err) {
      toast.error('Failed to enroll.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollAllPath = async () => {
    if (!user) {
      toast.error('Please sign in to enroll.');
      navigate('/login');
      return;
    }

    const role = user.roleName?.toLowerCase();
    if (role !== 'learner') {
      toast.error(`As a ${user.roleName}, you cannot enroll in paths.`);
      return;
    }

    const unenrolled = roadmapNodes.filter(n => n.state === 'upcoming' || n.state === 'locked');
    if (unenrolled.length === 0) {
      toast.success('You are already enrolled in all courses of this path!');
      return;
    }

    try {
      setIsLoading(true);
      const updated = [...enrollments];
      unenrolled.forEach(n => {
        updated.push({
          enrollmentId: Date.now() + Math.random(),
          enrolledAt: new Date().toISOString(),
          status: 'active',
          progress: 0,
          lastAccessedAt: new Date().toISOString(),
          completedAt: null,
          expiresAt: null,
          course: n.course,
        });
      });

      setEnrollments(updated);
      sessionStorage.setItem('explore_cache_enrollments', JSON.stringify(updated));
      toast.success(`Successfully enrolled in ${unenrolled.length} remaining courses!`);
    } catch (err) {
      toast.error('Failed to enroll in learning path.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLesson = (lessonTitle: string) => {
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

    const currentEnrollment = enrollments[enrollmentIdx];
    if (currentEnrollment.progress >= 100) {
      toast.success(`You've already completed this lesson: ${lessonTitle}`);
      return;
    }

    // Increment progress by 1 lesson proportion
    const lessonsCount = activeCourse?.totalLessons || 12;
    const progressInc = Math.round(100 / lessonsCount);
    const newProgress = Math.min(100, currentEnrollment.progress + progressInc);
    
    const updatedEnrollments = [...enrollments];
    updatedEnrollments[enrollmentIdx] = {
      ...currentEnrollment,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : 'active',
      completedAt: newProgress === 100 ? new Date().toISOString() : null,
    };

    setEnrollments(updatedEnrollments);
    sessionStorage.setItem('explore_cache_enrollments', JSON.stringify(updatedEnrollments));
    toast.success(`Started: ${lessonTitle}! Progress updated.`);
  };

  return {
    path,
    isLoading,
    bookmarked,
    setBookmarked,
    liked,
    setLiked,
    activeCourseId,
    setActiveCourseId,
    roadmapNodes,
    totalCourses,
    completedCourses,
    overallProgress,
    remainingLessons,
    remainingHours,
    activeCourse,
    currentModules,
    handleEnrollSingleCourse,
    handleEnrollAllPath,
    handleStartLesson,
    handleContinueCourse,
  };
}

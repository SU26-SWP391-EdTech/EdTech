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

export function useLearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [path, setPath] = useState<LearningPath | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeCourseLessons, setActiveCourseLessons] = useState<any[]>([]);

  useEffect(() => {
    async function loadPathData() {
      if (!id) return;
      try {
        setIsLoading(true);

        const targetPath = await getLearningPathById(parseInt(id));
        if (!targetPath) {
          toast.error('Learning Path not found!');
          navigate('/learner/explore');
          return;
        }

        setPath(targetPath);

        const isLearner = user?.roleName?.toLowerCase() === 'learner';
        let activeEnrollments: Enrollment[] = [];
        if (user && isLearner) {
          activeEnrollments = await getMyEnrollments();
        }
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

  const pathCourses = [...(path?.learningPathCourses || [])].sort((a, b) => a.position - b.position);

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

  // Calculate statistics
  const totalCourses = pathCourses.length;
  const completedCourses = roadmapNodes.filter(n => n.state === 'completed').length;
  const totalMinutes = roadmapNodes.reduce((sum, n) => sum + (n.course?.duration || 0), 0);
  const totalDurationLabel = formatDuration(totalMinutes);
  
  // Calculate average progress
  const totalProgressSum = roadmapNodes.reduce((acc, n) => acc + n.progress, 0);
  const overallProgress = totalCourses > 0 ? Math.round(totalProgressSum / totalCourses) : 0;

  // Generate modules for the selected active course dynamically
  const selectedNode = roadmapNodes.find(n => n.id === activeCourseId) || roadmapNodes[0];
  const activeCourse = selectedNode?.course;

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

  const currentModules = activeCourse ? generateModulesForCourse(activeCourse, selectedNode.progress, activeCourseLessons) : [];

  const handleContinueCourse = (courseId: number) => {
    const node = roadmapNodes.find(n => n.id === courseId);
    if (!node || node.state === 'locked') {
      toast.error('This course is locked. Please complete or enroll in the previous courses first.');
      return;
    }

    navigate(`/learner/lesson?courseId=${courseId}`);
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
      await enrollCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      const activeEnrollments = await getMyEnrollments();
      setEnrollments(activeEnrollments);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll.');
    } finally {
      setIsLoading(false);
    }
  };


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

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
import { getLessonsByCourse } from '../../services/lesson/lesson.service';
import { getMyEnrollments, updateEnrollmentProgress } from '../../services/enrollment/enrollment.service';
import api from '../../lib/axios';

function getLessonType(lesson: any) {
  const hasVideo = Boolean(lesson.videoUrl);
  const hasReading = Boolean(lesson.content);

  if (hasVideo && hasReading) return 'Video & Reading';
  if (hasVideo) return 'Video';
  if (hasReading) return 'Reading';
  return 'Reading';
}

export function useLessonPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse courseId and lessonId from URL
  const courseId = Number(searchParams.get('courseId') || 8);
  const activeLessonId = searchParams.get('lessonId');

  const [course, setCourse] = useState<any>(null);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  const user = useAuthStore((state) => state.user);
  const role = user?.roleName?.toLowerCase() || 'guest';

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourse(courseId),
        ]);
        setCourse(courseData);
        setLessonsList(lessonsData);

        if (role === 'learner') {
          const enrolls = await getMyEnrollments();
          setEnrollments(enrolls);

          // Fetch progress status for each lesson concurrently
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

  const rawModules = [
    {
      id: 'm1',
      title: 'Lesson Curriculum',
      description: 'Lessons list',
      lessons: lessonsList.map(l => ({
        id: String(l.lessonId),
        title: l.title,
        duration: (() => {
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
        prerequisites: l.prerequisites || [],
      })),
    }
  ];

  const currentEnrollment = enrollments.find(e => e.course?.courseId === courseId);
  const isEnrolled = role === 'learner' && Boolean(currentEnrollment);
  const isSpecialRole = ['guest', 'course provider', 'admin', 'academic manager'].includes(role);
  const progressVal = isSpecialRole ? 0 : (isEnrolled ? (currentEnrollment?.progress ?? 0) : 0);

  // States
  const [videoProgress] = useState(34);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>(SAVED_NOTES);
  const [copiedCode, setCopiedCode] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content');

  // Auto-start active lesson if it is not completed or started yet
  useEffect(() => {
    if (role !== 'learner' || !activeLessonId || isLoading) return;
    
    const lessonStrId = String(activeLessonId);
    if (completedLessonIds.has(lessonStrId)) return;

    async function checkAndStartProgress() {
      try {
        // Try getting progress status
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

  // Map modules and status
  const hasTrackedLessonProgress = completedLessonIds.size > 0;
  const completedFromProgressCount = !hasTrackedLessonProgress && rawModules.length > 0
    ? Math.round((progressVal / 100) * rawModules.reduce((acc: number, mod: any) => acc + (mod.lessons || []).length, 0))
    : 0;

  // Helper to check if lesson has unmet prerequisites
  const isLockedByPrerequisites = (l: any) => {
    if (!l.prerequisites || l.prerequisites.length === 0) return false;
    return l.prerequisites.some((prereq: any) => {
      const reqId = String(prereq.prerequisiteLessonId);
      return !completedLessonIds.has(reqId);
    });
  };

  // Find the first uncompleted and unlocked lesson
  const currentLessonId = rawModules
    .flatMap(m => m.lessons)
    .find(l => {
      const lessonKey = String(l.id);
      const isCompleted = completedLessonIds.has(lessonKey);
      const isLocked = isLockedByPrerequisites(l);
      return !isCompleted && !isLocked;
    })?.id;

  let lessonCounter = 0;
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

  // Active lesson matching
  let activeLesson: Lesson | undefined;
  for (const mod of modules) {
    const found = mod.lessons.find(l => String(l.id) === String(activeLessonId));
    if (found) {
      activeLesson = found;
      break;
    }
  }

  // Fallback to first current or first lesson overall
  if (!activeLesson) {
    for (const mod of modules) {
      const found = mod.lessons.find(l => l.status === 'current');
      if (found) {
        activeLesson = found;
        break;
      }
    }
  }
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

  // Auto-expand active module on mount/active lesson changes
  useEffect(() => {
    if (activeModuleId) {
      setExpandedModules(prev => prev.includes(activeModuleId) ? prev : [...prev, activeModuleId]);
    }
  }, [activeLessonId, activeModuleId]);



  const toggleModule = (id: string | number) => {
    setExpandedModules(prev =>
      prev.includes(String(id)) ? prev.filter(m => m !== String(id)) : [...prev, String(id)]
    );
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    navigator.clipboard.writeText(getMockCode(matchedCourse.title).code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

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

  const handleDeleteNote = (noteId: number) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted.');
  };

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
      // 1. Call progress complete API
      await api.patch(`/progress/lesson/${lessonId}/complete`);

      const nextCompletedIds = new Set(completedLessonIds);
      nextCompletedIds.add(lessonId);
      setCompletedLessonIds(nextCompletedIds);

      if (showToast) toast.success('Marked lesson as completed!');
      
      const enrolls = await getMyEnrollments();
      setEnrollments(enrolls);
    } catch (err) {
      console.error('Failed to update progress on backend:', err);
      toast.error('Failed to update progress on server.');
    }
  };

  const handleMarkComplete = () => {
    if (activeLesson) {
      persistLessonCompletion(activeLesson);
    }
  };

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

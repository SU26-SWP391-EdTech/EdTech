import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Lesson, MockEnrollment, Module, Note } from '../../types/lesson/lesson.types';
import {
  getMockCode,
  getQuizQuestionsForCourse,
  getYoutubeEmbedUrl,
  SAVED_NOTES
} from '../../utils/lesson/lessonUtils';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { getCourseById } from '../../services/course/course.service';
import { getLessonsByCourse } from '../../services/lesson/lesson.service';
import { getMyEnrollments, updateEnrollmentProgress } from '../../services/enrollment/enrollment.service';

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
        } else {
          setEnrollments([]);
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
      title: 'Course Curriculum',
      description: 'Lessons list',
      lessons: lessonsList.map(l => ({
        id: String(l.lessonId),
        title: l.title,
        duration: l.videoDuration ? `${Math.round(l.videoDuration / 60)}m` : '15m',
        type: l.content ? 'Reading' : 'Video',
        preview: false,
        videoUrl: l.videoUrl || '',
        content: l.content || '',
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
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>(SAVED_NOTES);
  const [copiedCode, setCopiedCode] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content');

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Assignment interactive state
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  // Sync completedLessonIds from progressVal
  useEffect(() => {
    if (currentEnrollment) {
      const lessonsCount = lessonsList.length;
      const completedCount = Math.round((progressVal / 100) * lessonsCount);
      const nextCompleted = new Set<string>();
      lessonsList.forEach((l, idx) => {
        if (idx < completedCount) {
          nextCompleted.add(String(l.lessonId));
        }
      });
      setCompletedLessonIds(nextCompleted);
    } else {
      setCompletedLessonIds(new Set());
    }
  }, [currentEnrollment, lessonsList, progressVal]);

  // Map modules and status
  const hasTrackedLessonProgress = completedLessonIds.size > 0;
  const completedFromProgressCount = !hasTrackedLessonProgress && rawModules.length > 0
    ? Math.round((progressVal / 100) * rawModules.reduce((acc: number, mod: any) => acc + (mod.lessons || []).length, 0))
    : 0;
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
        if (lessonCounter <= completedFromProgressCount || completedLessonIds.has(lessonKey)) {
          status = 'completed';
          completedInModule++;
        } else if (lessonCounter === completedFromProgressCount + 1) {
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

  // Reset interactive tabs/states when switching lessons
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setAssignmentSubmitted(false);
    setAssignmentText('');
    setAssignmentFile(null);
  }, [activeLessonId]);

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

    const nextCompletedIds = new Set(completedLessonIds);
    nextCompletedIds.add(lessonId);
    setCompletedLessonIds(nextCompletedIds);

    const progress = totalLessons > 0 ? Math.round((nextCompletedIds.size / totalLessons) * 100) : 0;
    
    try {
      await updateEnrollmentProgress(courseId, progress);
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

  // 30 seconds auto-completion timer
  useEffect(() => {
    if (!activeLesson || activeLesson.status === 'completed') {
      return;
    }

    const canCompleteByViewing =
      activeLesson.type === 'Reading' ||
      (activeLesson.type === 'Video' && Boolean(youtubeEmbedUrl));

    if (!canCompleteByViewing) {
      return;
    }

    const timer = window.setTimeout(() => {
      persistLessonCompletion(activeLesson, false);
      toast.success(
        activeLesson.type === 'Reading'
          ? 'Reading completed after 30 seconds.'
          : 'Video lesson completed.'
      );
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [activeLesson?.id, activeLesson?.type, activeLesson?.status, youtubeEmbedUrl]);

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked') {
      toast.error('This lesson is locked. Please enroll in the course to unlock.');
      return;
    }
    setSearchParams({ courseId: String(courseId), lessonId: String(lesson.id) });
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prev = flatLessons[activeLessonIndex - 1];
      if (prev.status === 'locked') {
        toast.error('The previous lesson is locked.');
        return;
      }
      setSearchParams({ courseId: String(courseId), lessonId: String(prev.id) });
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < flatLessons.length - 1) {
      const next = flatLessons[activeLessonIndex + 1];
      if (next.status === 'locked') {
        toast.error('The next lesson is locked. Please enroll in the course.');
        return;
      }
      setSearchParams({ courseId: String(courseId), lessonId: String(next.id) });
    }
  };

  const handleQuizSubmit = (questionsList: any[]) => {
    let score = 0;
    questionsList.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (activeLesson) {
      persistLessonCompletion(activeLesson, false);
    }
    if (score === questionsList.length) {
      toast.success(`Perfect score! ${score}/${questionsList.length}. Lesson completed.`);
    } else {
      toast.error(`You scored ${score}/${questionsList.length}. Lesson completed, but you can try again.`);
    }
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentText.trim() && !assignmentFile) return;
    setAssignmentSubmitted(true);
    if (activeLesson) {
      persistLessonCompletion(activeLesson, false);
    }
    toast.success('Assignment submitted successfully!');
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

  const quizQuestionsList = getQuizQuestionsForCourse(matchedCourse.title);
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
    quizAnswers,
    quizSubmitted,
    quizScore,
    assignmentSubmitted,
    assignmentText,
    assignmentFile,
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
    quizQuestionsList,
    mockCodeInfo,
    setExpandedModules,
    setCompletedLessonIds,
    setNoteText,
    setNotes,
    setCopiedCode,
    setQuestionText,
    setActiveTab,
    setQuizAnswers,
    setQuizSubmitted,
    setQuizScore,
    setAssignmentSubmitted,
    setAssignmentText,
    setAssignmentFile,
    toggleModule,
    handleCopyCode,
    handleAddNote,
    handleDeleteNote,
    persistLessonCompletion,
    handleMarkComplete,
    handleLessonClick,
    handlePrevLesson,
    handleNextLesson,
    handleQuizSubmit,
    handleAssignmentSubmit,
    handleBackToCourse,
    isLoading
  };
}

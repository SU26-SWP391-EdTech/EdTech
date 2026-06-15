import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { searchCourses } from '../../services/course/course.service';
import type { BackendCourse } from '../../services/course/course.service';
import {
  createLesson,
  getLessonById,
  getLessonsByCourse,
  updateLesson,
} from '../../services/lesson/lesson.service';
import type { Lesson } from '../../services/lesson/lesson.service';

export type LessonType = 'video' | 'reading' | 'quiz' | 'assignment' | 'practice' | 'external';
export type ModalType = 'resource' | 'quiz' | 'publish' | null;
export type LessonStatus = 'draft' | 'pending' | 'published';

export interface Objective { id: string; text: string; }
export interface Resource { id: string; name: string; type: string; size: string; visibility: 'public' | 'enrolled'; }
export interface QuizQuestion { id: string; text: string; type: string; options: string[]; correct: number; }
export interface ChecklistItem { key: string; label: string; }

export const checklist: ChecklistItem[] = [
  { key: 'title', label: 'Lesson title provided' },
  { key: 'type', label: 'Lesson type selected' },
  { key: 'content', label: 'Lesson content/video provided' },
  { key: 'objectives', label: 'Learning objectives defined' },
  { key: 'duration', label: 'Estimated duration set' },
  { key: 'resources', label: 'Lesson resources added' },
  { key: 'completion', label: 'Completion rule defined' },
  { key: 'ready', label: 'Lesson marked as ready' },
];

export function useCreateLesson() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // ── Form state ──────────────────────────────────────────────────
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [completionRule] = useState('Watch video until 90%');
  const [status, setStatus] = useState<LessonStatus>('draft');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [titleError, setTitleError] = useState(false);

  // ── UI state ────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalType>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Lesson draft saved successfully.');
  const [isSaving, setIsSaving] = useState(false);

  // ── Data state ──────────────────────────────────────────────────
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [savedLessonId, setSavedLessonId] = useState<number | null>(null);
  const [localLessonId, setLocalLessonId] = useState<string | null>(null);
  const [draftCourseTitle, setDraftCourseTitle] = useState<string | null>(null);

  // ── Resource modal state ────────────────────────────────────────
  const [rName, setRName] = useState('');
  const [rType, setRType] = useState('PDF');
  const [rVisibility, setRVisibility] = useState<'public' | 'enrolled'>('enrolled');

  // ── Quiz modal state ────────────────────────────────────────────
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('Multiple Choice');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [shortAnswer, setShortAnswer] = useState('');

  // ── Derived values ──────────────────────────────────────────────
  const selectedCourse = courses.find(c => c.courseId === selectedCourseId) ?? null;

  const lessonOrder = useMemo(() => {
    if (editingLessonId || savedLessonId) {
      const idx = lessons.findIndex(l => Number(l.lessonId) === (editingLessonId ?? savedLessonId));
      if (idx !== -1) return idx + 1;
    }
    return lessons.length + 1;
  }, [lessons, editingLessonId, savedLessonId]);

  // ── Effects ─────────────────────────────────────────────────────

  // 1. Parse URL search params
  useEffect(() => {
    const queryCourseId = Number(searchParams.get('courseId') || searchParams.get('id'));
    const queryLessonIdStr = searchParams.get('lessonId');
    const queryLessonId = Number(queryLessonIdStr);

    if (Number.isFinite(queryCourseId) && queryCourseId > 0) {
      setSelectedCourseId(queryCourseId);
    }
    if (queryLessonIdStr && queryLessonIdStr.startsWith('l-')) {
      setLocalLessonId(queryLessonIdStr);
    } else if (Number.isFinite(queryLessonId) && queryLessonId > 0) {
      setEditingLessonId(queryLessonId);
      setSavedLessonId(queryLessonId);
    }

    const targetModuleId = searchParams.get('targetModuleId');
    if (targetModuleId) {
      try {
        const saved = localStorage.getItem('create_course_draft');
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.title) setDraftCourseTitle(draft.title);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [searchParams]);

  // 2. Load courses from API
  useEffect(() => {
    async function loadCourses() {
      try {
        const params = user?.userId ? { userId: user.userId } : undefined;
        const response = await searchCourses(params);
        const items = response.data?.items || [];
        setCourses(items);
        setSelectedCourseId(current => current ?? items[0]?.courseId ?? null);
      } catch (error) {
        console.error('Failed to load courses:', error);
        showFeedback('Could not load courses from database.');
      }
    }
    loadCourses();
  }, [user?.userId]);

  // 3. Load lessons when selected course changes
  useEffect(() => {
    if (!selectedCourseId) { setLessons([]); return; }
    const cid = selectedCourseId;
    async function loadLessons() {
      try {
        setLessons(await getLessonsByCourse(cid));
      } catch {
        setLessons([]);
      }
    }
    loadLessons();
  }, [selectedCourseId]);

  // 4. Load lesson detail from API when editing
  useEffect(() => {
    if (!editingLessonId) return;
    const lid = editingLessonId;
    async function loadLessonDetail() {
      try {
        const lesson = await getLessonById(lid);
        setTitle(lesson.title || '');
        setDescription(lesson.description || '');
        setDuration(lesson.videoDuration ? String(Math.round(lesson.videoDuration / 60)) : '');
        setContent(lesson.content || '');
        setVideoUrl(lesson.videoUrl || '');
        setVideoUploaded(Boolean(lesson.videoUrl));
        setObjectives([]);
        setResources([]);
        setQuizQuestions([]);

        if (lesson.content) {
          const cs = lesson.content;
          const objMatch = cs.match(/Objectives:\s*\n([\s\S]*?)(?=\n\n|\n[A-Za-z\s]+:|$)/);
          if (objMatch) {
            setObjectives(objMatch[1].split('\n').filter(Boolean).map((line, i) => ({
              id: `o${i}_${Date.now()}`,
              text: line.replace(/^\d+\.\s*/, ''),
            })));
          }
          const resMatch = cs.match(/Resources:\s*\n([\s\S]*?)(?=\n\n|\n[A-Za-z\s]+:|$)/);
          if (resMatch) {
            setResources(resMatch[1].split('\n').filter(Boolean).map((line, i) => {
              const cleaned = line.replace(/^-\s*/, '');
              const tm = cleaned.match(/\(([^)]+)\)$/);
              return { id: `r${i}_${Date.now()}`, name: tm ? cleaned.replace(/\s*\([^)]+\)$/, '') : cleaned, type: tm ? tm[1] : 'PDF', size: '—', visibility: 'enrolled' as const };
            }));
          }
          const qMatch = cs.match(/Quiz Questions:\s*\n([\s\S]*?)(?=\n\n|\n[A-Za-z\s]+:|$)/);
          if (qMatch) {
            setQuizQuestions(qMatch[1].split('\n').filter(Boolean).map((line, i) => ({
              id: `q${i}_${Date.now()}`,
              text: line.replace(/^\d+\.\s*/, ''),
              type: 'multiple-choice',
              options: ['Option 1', 'Option 2'],
              correct: 0,
            })));
          }
        }
        setLessonType(lesson.content && !lesson.videoUrl ? 'reading' : 'video');
      } catch (error) {
        console.error('Failed to load lesson detail:', error);
        showFeedback('Could not load lesson detail.');
      }
    }
    loadLessonDetail();
  }, [editingLessonId]);

  // 5. Load local lesson from localStorage (draft course flow)
  useEffect(() => {
    if (!localLessonId) return;
    const targetModuleId = searchParams.get('targetModuleId');
    const savedCourseDraft = localStorage.getItem('create_course_draft');
    if (savedCourseDraft && targetModuleId) {
      try {
        const draft = JSON.parse(savedCourseDraft);
        const targetModule = draft.modules?.find((m: any) => m.id === targetModuleId);
        const targetLesson = targetModule?.lessons?.find((l: any) => l.id === localLessonId);
        if (targetLesson) {
          setTitle(targetLesson.title || '');
          setDescription(targetLesson.description || '');
          setDuration(targetLesson.duration ? String(parseInt(targetLesson.duration)) : '');
          setContent(targetLesson.content || '');
          setVideoUrl(targetLesson.videoUrl || '');
          setVideoUploaded(Boolean(targetLesson.videoUrl));
          if (targetLesson.quizQuestions) {
            setQuizQuestions(targetLesson.quizQuestions);
          } else if (targetLesson.content) {
            const qMatch = targetLesson.content.match(/Quiz Questions:\s*\n([\s\S]*?)(?=\n\n|\n[A-Za-z\s]+:|$)/);
            if (qMatch) {
              setQuizQuestions(qMatch[1].split('\n').filter(Boolean).map((line: string, i: number) => ({
                id: `q${i}_${Date.now()}`,
                text: line.replace(/^\d+\.\s*/, ''),
                type: 'multiple-choice',
                options: ['Option 1', 'Option 2'],
                correct: 0,
              })));
            }
          }
          setObjectives([]);
          setResources([]);
          const t = targetLesson.type?.toLowerCase();
          setLessonType(t === 'reading' ? 'reading' : t === 'quiz' ? 'quiz' : 'video');
        }
      } catch (e) {
        console.error('Failed to load local lesson detail:', e);
      }
    }
  }, [localLessonId, searchParams]);

  // ── Helpers ─────────────────────────────────────────────────────

  function showFeedback(message: string) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function getContentValue() {
    if (lessonType === 'reading') return content.trim();
    return [
      videoUrl ? `Video URL: ${videoUrl}` : '',
      objectives.length ? `Objectives:\n${objectives.map((o, i) => `${i + 1}. ${o.text}`).join('\n')}` : '',
      resources.length ? `Resources:\n${resources.map(r => `- ${r.name} (${r.type})`).join('\n')}` : '',
      quizQuestions.length ? `Quiz Questions:\n${quizQuestions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n');
  }

  const checklistState: Record<string, boolean> = {
    title: title.length > 0,
    type: true,
    content: getContentValue().length > 0 || videoUploaded || videoUrl.length > 0,
    objectives: objectives.length > 0,
    duration: duration.length > 0,
    resources: resources.length > 0,
    completion: completionRule.length > 0,
    ready: status === 'published',
  };

  function resetForm() {
    setTitle('');
    setDescription('');
    setDuration('');
    setVideoUrl('');
    setContent('');
    setVideoFile(null);
    setVideoUploaded(false);
    setObjectives([]);
    setResources([]);
    setQuizQuestions([]);
    setLessonType('video');
    setStatus('draft');
    setTitleError(false);
    setLocalLessonId(null);
    setEditingLessonId(null);
    setSavedLessonId(null);
  }

  // ── API / persistence ────────────────────────────────────────────

  async function persistLesson(nextStatus: LessonStatus): Promise<any | null> {
    if (!title.trim()) {
      setTitleError(true);
      showFeedback('Lesson title is required.');
      return null;
    }

    const targetModuleId = searchParams.get('targetModuleId');

    // ── Local draft (CreateCourse flow) ──
    if (targetModuleId) {
      setIsSaving(true);
      try {
        const lessonId = localLessonId || `l-${Date.now()}`;
        const tempLesson = {
          id: lessonId,
          title: title.trim(),
          type: lessonType === 'quiz' || quizQuestions.length > 0
            ? 'Quiz'
            : videoUrl || videoFile ? 'Video' : 'Reading',
          duration: duration ? `${duration} min` : '10 min',
          locked: false,
          content: getContentValue(),
          videoUrl: videoUrl.trim() || undefined,
          description: description.trim() || undefined,
          quizQuestions,
        };

        localStorage.setItem('temp_created_lesson', JSON.stringify({ targetModuleId, lesson: tempLesson }));

        const savedCourseDraft = localStorage.getItem('create_course_draft');
        if (savedCourseDraft) {
          try {
            const draft = JSON.parse(savedCourseDraft);
            const updatedModules = draft.modules?.map((m: any) => {
              if (m.id !== targetModuleId) return m;
              const existing = m.lessons || [];
              const exists = existing.some((l: any) => l.id === tempLesson.id);
              return {
                ...m,
                lessons: exists
                  ? existing.map((l: any) => (l.id === tempLesson.id ? tempLesson : l))
                  : [...existing, tempLesson],
              };
            });
            localStorage.setItem('create_course_draft', JSON.stringify({ ...draft, modules: updatedModules }));
          } catch (e) {
            console.error('Failed to update course draft modules:', e);
          }
        }

        if (!localLessonId) setLocalLessonId(lessonId);
        setStatus(nextStatus);
        showFeedback('Lesson saved! You can continue adding another lesson or go back to the course.');
        setTimeout(() => resetForm(), 1500);
        return tempLesson;
      } catch (error) {
        console.error('Failed to save local lesson:', error);
        showFeedback('Failed to save lesson draft.');
        return null;
      } finally {
        setIsSaving(false);
      }
    }

    // ── API save ──
    if (!selectedCourseId) {
      showFeedback('Vui lòng chọn khóa học trước khi lưu lesson.');
      return null;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        videoDuration: duration ? Math.max(0, Number(duration) * 60) : undefined,
        content: getContentValue() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      };

      const existingId = editingLessonId ?? savedLessonId;
      const saved = existingId
        ? await updateLesson(selectedCourseId, existingId, payload, videoFile ?? undefined)
        : await createLesson(selectedCourseId, payload, videoFile ?? undefined);

      const nextLessonId = Number(saved.lessonId);
      setSavedLessonId(nextLessonId);
      setEditingLessonId(nextLessonId);
      setStatus(nextStatus);
      setVideoFile(null);
      setVideoUploaded(Boolean(saved.videoUrl || videoUrl));
      setLessons(await getLessonsByCourse(selectedCourseId));
      showFeedback(nextStatus === 'published' ? 'Lesson saved to database.' : 'Lesson draft saved successfully.');

      const redirectBack = searchParams.get('redirectBack');
      if (redirectBack) {
        setTimeout(() => navigate(redirectBack), 1200);
      }
      return saved;
    } catch (error: any) {
      console.error('Failed to save lesson:', error);
      showFeedback(error.response?.data?.message || 'Failed to save lesson.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────

  function handleSaveDraft() {
    persistLesson('draft');
  }

  function handlePublish() {
    if (!title.trim()) { setTitleError(true); return; }
    setModal('publish');
  }

  async function confirmPublish() {
    const saved = await persistLesson('published');
    if (saved) setModal(null);
  }

  function handleVideoFileChange(file?: File) {
    if (!file) return;
    setVideoFile(file);
    setVideoUploaded(true);
    if (!duration) setDuration('');
  }

  function handleAddResource() {
    if (!rName.trim()) return;
    setResources(prev => [...prev, { id: `r${Date.now()}`, name: rName, type: rType, size: '—', visibility: rVisibility }]);
    setRName(''); setRType('PDF'); setRVisibility('enrolled');
    setModal(null);
  }

  function handleAddQuestion() {
    if (!qText.trim()) return;
    let options: string[] = [];
    let correctIdx = qCorrect;

    if (qType === 'Multiple Choice') {
      options = qOptions.filter(o => o.trim());
      if (options.length < 2) { showFeedback('Please add at least 2 answer options.'); return; }
    } else if (qType === 'True / False') {
      options = ['True', 'False'];
    } else {
      options = [shortAnswer.trim()];
      correctIdx = 0;
    }

    setQuizQuestions(prev => [...prev, { id: `q${Date.now()}`, text: qText.trim(), type: qType, options, correct: correctIdx }]);
    setQText(''); setQOptions(['', '', '', '']); setQCorrect(0); setShortAnswer('');
    setModal(null);
  }

  return {
    // search params & navigation
    searchParams, navigate,
    // form
    lessonType, setLessonType,
    title, setTitle,
    description, setDescription,
    duration, setDuration,
    status,
    videoUrl, setVideoUrl,
    content, setContent,
    videoFile,
    videoUploaded,
    videoInputRef,
    objectives,
    resources,
    quizQuestions, setQuizQuestions,
    titleError, setTitleError,
    completionRule,
    // UI
    modal, setModal,
    showToast, setShowToast,
    toastMessage,
    isSaving,
    // data
    courses,
    selectedCourseId, setSelectedCourseId,
    selectedCourse,
    lessons,
    lessonOrder,
    editingLessonId, setEditingLessonId,
    savedLessonId, setSavedLessonId,
    draftCourseTitle,
    // resource modal
    rName, setRName,
    rType, setRType,
    rVisibility, setRVisibility,
    // quiz modal
    qText, setQText,
    qType, setQType,
    qOptions, setQOptions,
    qCorrect, setQCorrect,
    shortAnswer, setShortAnswer,
    // derived
    checklistState,
    // handlers
    handleSaveDraft,
    handlePublish,
    confirmPublish,
    handleVideoFileChange,
    handleAddResource,
    handleAddQuestion,
    resetForm,
    showFeedback,
    getContentValue,
  };
}

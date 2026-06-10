import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Bell, ChevronRight, GraduationCap, Plus, Trash2, Edit3,
  Video, BookOpen, ClipboardCheck, FileText, ExternalLink, Zap,
  Upload, Link2, Image as ImageIcon, Clock, BarChart2, Eye,
  CheckCircle2, AlertCircle, Circle, X, Copy, Bold, Italic,
  List, Code, Settings, Lock, Globe, Users, MessageSquare,
  Download, ToggleLeft, ToggleRight, ChevronDown, PlayCircle,
  Save, Send, Rocket, Star, Info
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.stores';
import { searchCourses } from '../../services/course.service';
import type { BackendCourse } from '../../services/course.service';
import {
  createLesson,
  getLessonById,
  getLessonsByCourse,
  updateLesson,
} from '../../services/lesson/lesson.service';
import type { Lesson } from '../../services/lesson/lesson.service';

/* MARKER-MAKE-KIT-INVOKED */

type LessonType = 'video' | 'reading' | 'quiz' | 'assignment' | 'practice' | 'external';
type ModalType = 'resource' | 'quiz' | 'publish' | null;

interface Objective { id: string; text: string; }
interface Resource { id: string; name: string; type: string; size: string; visibility: 'public' | 'enrolled'; }
interface QuizQuestion { id: string; text: string; type: string; options: string[]; correct: number; }

const lessonTypes: { id: LessonType; icon: React.FC<{ size: number; color?: string }>; title: string; desc: string }[] = [
  { id: 'video', icon: Video, title: 'Video Lesson', desc: 'Upload or link a video lecture' },
  { id: 'reading', icon: BookOpen, title: 'Reading Lesson', desc: 'Written content, articles, or notes' },
  { id: 'quiz', icon: ClipboardCheck, title: 'Quiz', desc: 'Knowledge check with questions' },
  { id: 'assignment', icon: Edit3, title: 'Assignment', desc: 'Project or submission task' },
  { id: 'practice', icon: Zap, title: 'Practice Task', desc: 'Hands-on coding or exercise' },
  { id: 'external', icon: ExternalLink, title: 'External Resource', desc: 'Link to external article or tool' },
];

const checklist = [
  { key: 'title', label: 'Lesson title added' },
  { key: 'type', label: 'Lesson type selected' },
  { key: 'content', label: 'Content uploaded or written' },
  { key: 'objectives', label: 'Learning objectives added' },
  { key: 'duration', label: 'Duration estimated' },
  { key: 'resources', label: 'Resources checked' },
  { key: 'completion', label: 'Completion rule selected' },
  { key: 'ready', label: 'Ready to publish' },
];

export function CreateLessonPage() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [activeNav, setActiveNav] = useState('My Courses');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft');
  const [visibility, setVisibility] = useState<'public' | 'enrolled' | 'locked'>('enrolled');
  const [completionRule, setCompletionRule] = useState('Watch video until 90%');
  const [allowComments, setAllowComments] = useState(true);
  const [allowNotes, setAllowNotes] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizEnabled, setQuizEnabled] = useState(true);
  const [practiceEnabled, setPracticeEnabled] = useState(false);
  const [passingScore, setPassingScore] = useState('70');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [showToast, setShowToast] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [toastMessage, setToastMessage] = useState('Lesson draft saved successfully.');
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [savedLessonId, setSavedLessonId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Resource modal state
  const [rName, setRName] = useState('');
  const [rType, setRType] = useState('PDF');
  const [rVisibility, setRVisibility] = useState<'public' | 'enrolled'>('enrolled');

  // Quiz modal state
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const navItems = ['Dashboard', 'My Courses', 'Create Course', 'Lessons', 'Students', 'Reviews', 'Analytics'];
  const selectedCourse = courses.find(course => course.courseId === selectedCourseId) ?? null;
  const lessonOrder = lessons.findIndex(lesson => Number(lesson.lessonId) === (editingLessonId ?? savedLessonId)) + 1 || lessons.length + 1;
  const existingLessons = useMemo(() => {
    return lessons.map(lesson => ({
      title: lesson.title,
      status: Number(lesson.lessonId) === (editingLessonId ?? savedLessonId) ? 'current' : 'published',
    }));
  }, [lessons, editingLessonId, savedLessonId]);

  useEffect(() => {
    const queryCourseId = Number(searchParams.get('courseId') || searchParams.get('id'));
    const queryLessonId = Number(searchParams.get('lessonId'));
    if (Number.isFinite(queryCourseId) && queryCourseId > 0) {
      setSelectedCourseId(queryCourseId);
    }
    if (Number.isFinite(queryLessonId) && queryLessonId > 0) {
      setEditingLessonId(queryLessonId);
      setSavedLessonId(queryLessonId);
    }
  }, [searchParams]);

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

  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }

    async function loadLessons() {
      try {
        const courseLessons = await getLessonsByCourse(selectedCourseId);
        setLessons(courseLessons);
      } catch (error) {
        console.error('Failed to load lessons:', error);
        setLessons([]);
      }
    }

    loadLessons();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!editingLessonId) return;

    async function loadLessonDetail() {
      try {
        const lesson = await getLessonById(editingLessonId);
        setTitle(lesson.title || '');
        setDescription(lesson.description || '');
        setDuration(lesson.videoDuration ? String(Math.round(lesson.videoDuration / 60)) : '');
        setContent(lesson.content || '');
        setVideoUrl(lesson.videoUrl || '');
        setVideoUploaded(Boolean(lesson.videoUrl));
        setLessonType(lesson.content ? 'reading' : 'video');
      } catch (error) {
        console.error('Failed to load lesson detail:', error);
        showFeedback('Could not load lesson detail.');
      }
    }

    loadLessonDetail();
  }, [editingLessonId]);

  const completionPct = [
    title.length > 0,
    true, // type always selected
    getContentValue().length > 0 || videoUploaded || videoUrl.length > 0,
    objectives.length > 0,
    duration.length > 0,
    resources.length > 0,
    completionRule.length > 0,
    status === 'published',
  ].filter(Boolean).length * 12.5;

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

  const addObjective = () => {
    if (!newObjective.trim()) return;
    setObjectives(prev => [...prev, { id: `o${Date.now()}`, text: newObjective }]);
    setNewObjective('');
  };

  const removeObjective = (id: string) => setObjectives(prev => prev.filter(o => o.id !== id));

  const deleteResource = (id: string) => setResources(prev => prev.filter(r => r.id !== id));

  const handleAddResource = () => {
    if (!rName.trim()) return;
    setResources(prev => [...prev, { id: `r${Date.now()}`, name: rName, type: rType, size: '—', visibility: rVisibility }]);
    setRName(''); setRType('PDF'); setRVisibility('enrolled');
    setModal(null);
  };

  function showFeedback(message: string) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function getContentValue() {
    if (lessonType === 'reading') return content.trim();
    const details = [
      videoUrl ? `Video URL: ${videoUrl}` : '',
      objectives.length ? `Objectives:\n${objectives.map((obj, index) => `${index + 1}. ${obj.text}`).join('\n')}` : '',
      resources.length ? `Resources:\n${resources.map(resource => `- ${resource.name} (${resource.type})`).join('\n')}` : '',
      quizQuestions.length ? `Quiz Questions:\n${quizQuestions.map((question, index) => `${index + 1}. ${question.text}`).join('\n')}` : '',
    ].filter(Boolean);

    return details.join('\n\n');
  }

  async function persistLesson(nextStatus: 'draft' | 'published') {
    if (!title.trim()) {
      setTitleError(true);
      return null;
    }

    if (!selectedCourseId) {
      showFeedback('Please select a course before saving.');
      return null;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        videoDuration: duration ? Math.max(0, Number(duration) * 60) : undefined,
        content: getContentValue() || undefined,
      };

      const lessonId = editingLessonId ?? savedLessonId;
      const saved = lessonId
        ? await updateLesson(selectedCourseId, lessonId, payload, videoFile ?? undefined)
        : await createLesson(selectedCourseId, payload, videoFile ?? undefined);

      const nextLessonId = Number(saved.lessonId);
      setSavedLessonId(nextLessonId);
      setEditingLessonId(nextLessonId);
      setStatus(nextStatus);
      setVideoFile(null);
      setVideoUploaded(Boolean(saved.videoUrl || videoUrl));
      const courseLessons = await getLessonsByCourse(selectedCourseId);
      setLessons(courseLessons);
      showFeedback(nextStatus === 'published' ? 'Lesson saved to database.' : 'Lesson draft saved successfully.');
      return saved;
    } catch (error: any) {
      console.error('Failed to save lesson:', error);
      showFeedback(error.response?.data?.message || 'Failed to save lesson.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  const handleSaveDraft = () => {
    setStatus('draft');
    persistLesson('draft');
  };

  const handlePublish = () => {
    if (!title.trim()) { setTitleError(true); return; }
    setModal('publish');
  };

  const confirmPublish = async () => {
    const saved = await persistLesson('published');
    if (saved) setModal(null);
  };

  const handleVideoFileChange = (file?: File) => {
    if (!file) return;
    setVideoFile(file);
    setVideoUploaded(true);
    if (!duration) setDuration('');
  };

  const handleAddQuestion = () => {
    const options = qOptions.map(opt => opt.trim()).filter(Boolean);
    if (!qText.trim() || options.length < 2) return;
    setQuizQuestions(prev => [
      ...prev,
      {
        id: `q${Date.now()}`,
        text: qText.trim(),
        type: 'multiple-choice',
        options,
        correct: Math.min(qCorrect, options.length - 1),
      },
    ]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setModal(null);
  };

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button onClick={toggle} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      {on
        ? <ToggleRight size={22} style={{ color: '#E11D48' }} />
        : <ToggleLeft size={22} style={{ color: '#D1D5DB' }} />}
    </button>
  );

  const SectionCard = ({ title: t, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{t}</h2>
        {action}
      </div>
      {children}
    </div>
  );

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
      {children}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
    </label>
  );

  const Input = ({ value, onChange, placeholder, error }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }) => (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', border: `1px solid ${error ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8,
        padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: error ? '#FFF5F5' : '#FAFAFA',
        boxSizing: 'border-box', fontFamily: 'inherit',
        transition: 'border-color 0.15s',
      }}
    />
  );

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 32px 8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>

      {/* TOP NAV */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: '#E11D48', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={15} color="#fff" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827', letterSpacing: '-0.3px' }}>SLS</span>
              <span style={{ fontWeight: 400, fontSize: 13, color: '#9CA3AF', marginLeft: 4 }}>Creator</span>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {navItems.map(item => (
              <button key={item} onClick={() => setActiveNav(item)} style={{ padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeNav === item ? '#FFF1F3' : 'transparent', color: activeNav === item ? '#E11D48' : '#6B7280', transition: 'all 0.15s' }}>{item}</button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: '6px 10px', gap: 6, width: 210 }}>
              <Search size={13} style={{ color: '#9CA3AF' }} />
              <input placeholder="Search courses, lessons, modules..." style={{ border: 'none', background: 'transparent', fontSize: 12, color: '#374151', outline: 'none', width: '100%' }} />
            </div>
            <button style={{ width: 34, height: 34, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <Bell size={15} style={{ color: '#374151' }} />
              <span style={{ position: 'absolute', top: 6, right: 7, width: 6, height: 6, background: '#E11D48', borderRadius: '50%', border: '1.5px solid #fff' }} />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #E11D48, #9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>CP</span>
            </div>
            <button onClick={handleSaveDraft} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, color: '#374151', opacity: isSaving ? 0.7 : 1 }}>
              <Save size={13} /> {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 24px 60px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          {['Dashboard', 'My Courses', selectedCourse?.title || 'Select Course', editingLessonId ? 'Edit Lesson' : 'Create Lesson'].map((c, i, arr) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#374151' : '#9CA3AF', fontWeight: i === arr.length - 1 ? 500 : 400, cursor: i < arr.length - 1 ? 'pointer' : 'default' }}>{c}</span>
              {i < arr.length - 1 && <ChevronRight size={12} style={{ color: '#D1D5DB' }} />}
            </div>
          ))}
        </div>

        {/* Page header */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 26px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px', marginBottom: 5 }}>Create Lesson</h1>
            <p style={{ fontSize: 13.5, color: '#6B7280' }}>Add lesson content, resources, and practice activities to your course.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}>
              <Eye size={14} /> Preview
            </button>
            <button onClick={handleSaveDraft} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', opacity: isSaving ? 0.7 : 1 }}>
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={handlePublish} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              <Rocket size={14} /> Publish Lesson
            </button>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* LEFT FORM */}
          <div>

            {/* S1: Basic Info */}
            <SectionCard title="Lesson Information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label required>Lesson Title</Label>
                  <Input value={title} onChange={v => { setTitle(v); setTitleError(false); }} placeholder="Enter a clear, specific lesson title" error={titleError} />
                  {titleError && <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>Lesson title is required.</p>}
                  <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Lesson title should be clear, specific, and easy for learners to understand.</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Short Description</Label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <Label>Select Course</Label>
                  <Select
                    value={selectedCourse?.title || ''}
                    onChange={value => {
                      const course = courses.find(item => item.title === value);
                      setSelectedCourseId(course?.courseId ?? null);
                      setEditingLessonId(null);
                      setSavedLessonId(null);
                    }}
                    options={courses.length ? courses.map(course => course.title) : ['No courses found']}
                  />
                </div>
                <div>
                  <Label>Select Module</Label>
                  <Select value="Course Lessons" onChange={() => {}} options={['Course Lessons']} />
                </div>
                <div>
                  <Label>Lesson Order</Label>
                  <Input value={String(lessonOrder)} onChange={() => {}} placeholder="e.g. 3" />
                </div>
                <div>
                  <Label>Estimated Duration (min)</Label>
                  <Input value={duration} onChange={setDuration} placeholder="18" />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onChange={setDifficulty} options={['Beginner', 'Intermediate', 'Advanced']} />
                </div>
                <div>
                  <Label>Lesson Status</Label>
                  <Select value={status === 'draft' ? 'Draft' : status === 'pending' ? 'Pending Review' : 'Published'} onChange={v => setStatus(v === 'Draft' ? 'draft' : v === 'Pending Review' ? 'pending' : 'published')} options={['Draft', 'Pending Review', 'Published']} />
                </div>
              </div>
            </SectionCard>

            {/* S2: Lesson Type */}
            <SectionCard title="Lesson Type">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {lessonTypes.map(lt => {
                  const selected = lessonType === lt.id;
                  return (
                    <button key={lt.id} onClick={() => setLessonType(lt.id)} style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${selected ? '#E11D48' : '#E5E7EB'}`, background: selected ? '#FFF1F3' : '#FAFAFA', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <lt.icon size={18} color={selected ? '#E11D48' : '#6B7280'} />
                      <p style={{ fontSize: 13, fontWeight: 600, color: selected ? '#E11D48' : '#111827', marginTop: 8, marginBottom: 3 }}>{lt.title}</p>
                      <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.4 }}>{lt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* S3: Lesson Content */}
            <SectionCard title="Lesson Content">
              {lessonType === 'video' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Upload area */}
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    style={{ border: `2px dashed ${videoUploaded ? '#86EFAC' : '#E5E7EB'}`, borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: videoUploaded ? '#F0FDF4' : '#FAFAFA', transition: 'all 0.2s' }}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                      onChange={event => handleVideoFileChange(event.target.files?.[0])}
                      style={{ display: 'none' }}
                    />
                    {videoUploaded ? (
                      <>
                        <CheckCircle2 size={28} style={{ color: '#16A34A', marginBottom: 8 }} />
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#16A34A', marginBottom: 3 }}>Video uploaded successfully</p>
                        <p style={{ fontSize: 12, color: '#6B7280' }}>
                          {videoFile ? `${videoFile.name} · ${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : videoUrl || 'Existing lesson video'}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={28} style={{ color: '#9CA3AF', marginBottom: 8 }} />
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Drag & drop your video here</p>
                        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Supported formats: MP4, MOV, AVI, WebM · Max 4 GB</p>
                        <span style={{ padding: '7px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Browse Files</span>
                      </>
                    )}
                  </div>
                  <div>
                    <Label>Or paste a video URL</Label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Link2 size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ width: '100%', paddingLeft: 30, border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px 8px 30px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }} />
                      </div>
                      <button style={{ padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Embed</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label>Video Thumbnail</Label>
                      <div style={{ border: '1px dashed #E5E7EB', borderRadius: 9, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                        <ImageIcon size={18} style={{ color: '#9CA3AF', marginBottom: 6 }} />
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Upload thumbnail</p>
                        <p style={{ fontSize: 11, color: '#D1D5DB' }}>PNG, JPG · 1280×720</p>
                      </div>
                    </div>
                    <div>
                      <Label>Captions / Subtitles</Label>
                      <div style={{ border: '1px dashed #E5E7EB', borderRadius: 9, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                        <Upload size={18} style={{ color: '#9CA3AF', marginBottom: 6 }} />
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Upload .vtt or .srt</p>
                        <p style={{ fontSize: 11, color: '#D1D5DB' }}>English, auto-detect</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {lessonType === 'reading' && (
                <div>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      {[Bold, Italic, List, Code, Link2].map((Icon, i) => (
                        <button key={i} style={{ width: 30, height: 28, border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={13} style={{ color: '#374151' }} />
                        </button>
                      ))}
                      <div style={{ width: 1, height: 18, background: '#E5E7EB', margin: '0 4px' }} />
                      {['H1', 'H2', 'H3'].map(h => (
                        <button key={h} style={{ padding: '2px 7px', border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: '#6B7280' }}>{h}</button>
                      ))}
                    </div>
                    <textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Start writing your lesson content here..." rows={12} style={{ width: '100%', border: 'none', padding: '16px', fontSize: 14, color: '#374151', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box', background: '#fff' }} />
                  </div>
                  <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 6 }}>Estimated reading time: ~5 min based on content length</p>
                </div>
              )}

              {lessonType === 'quiz' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {quizQuestions.map((q, i) => (
                      <div key={q.id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ width: 22, height: 22, background: '#E11D48', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{q.text}</p>
                          </div>
                          <button onClick={() => setQuizQuestions(prev => prev.filter(item => item.id !== q.id))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={13} style={{ color: '#9CA3AF' }} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10, paddingLeft: 30 }}>
                          {q.options.map((opt, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: j === q.correct ? '#DCFCE7' : '#fff', border: `1px solid ${j === q.correct ? '#86EFAC' : '#E5E7EB'}`, borderRadius: 6 }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${j === q.correct ? '#16A34A' : '#D1D5DB'}`, background: j === q.correct ? '#16A34A' : 'transparent', flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: '#374151' }}>{opt}</span>
                              {j === q.correct && <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', marginLeft: 'auto' }}>Correct</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setModal('quiz')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1.5px dashed #E11D48', borderRadius: 8, background: '#FFF1F3', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#E11D48' }}>
                    <Plus size={14} /> Add Question
                  </button>
                </div>
              )}

              {lessonType === 'assignment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <Label required>Assignment Instructions</Label>
                    <textarea placeholder="Describe what learners need to do, deliverables, and acceptance criteria..." rows={6} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#374151', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, background: '#FAFAFA', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label>Submission Type</Label>
                      <Select value="File Upload" onChange={() => {}} options={['File Upload', 'Text Entry', 'URL Submission', 'GitHub Repository']} />
                    </div>
                    <div>
                      <Label>Due Date (Optional)</Label>
                      <Input value="" onChange={() => {}} placeholder="MM/DD/YYYY" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label>Attachment</Label>
                      <div style={{ border: '1px dashed #E5E7EB', borderRadius: 8, padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                        <Upload size={16} style={{ color: '#9CA3AF', marginBottom: 4 }} />
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Upload assignment file</p>
                      </div>
                    </div>
                    <div>
                      <Label>Rubric</Label>
                      <div style={{ border: '1px dashed #E5E7EB', borderRadius: 8, padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                        <Upload size={16} style={{ color: '#9CA3AF', marginBottom: 4 }} />
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Upload grading rubric</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(lessonType === 'practice' || lessonType === 'external') && (
                <div style={{ padding: '20px', textAlign: 'center', background: '#FAFAFA', borderRadius: 10, border: '1px dashed #E5E7EB' }}>
                  <p style={{ fontSize: 13.5, color: '#6B7280' }}>Configure {lessonType === 'practice' ? 'practice task' : 'external resource'} details below in the Resources section.</p>
                </div>
              )}
            </SectionCard>

            {/* S4: Learning Objectives */}
            <SectionCard title="Learning Objectives">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {objectives.map((obj, i) => (
                  <div key={obj.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{obj.text}</span>
                    <button onClick={() => removeObjective(obj.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={13} style={{ color: '#D1D5DB' }} /></button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addObjective()}
                  placeholder="Add a learning objective..."
                  style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA' }}
                />
                <button onClick={addObjective} style={{ padding: '8px 14px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </SectionCard>

            {/* S5: Resources */}
            <SectionCard title="Resources & Attachments" action={
              <button onClick={() => setModal('resource')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#E11D48', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                <Plus size={13} /> Add Resource
              </button>
            }>
              {resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <Download size={28} style={{ color: '#E5E7EB', marginBottom: 8 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No resources added yet</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Add PDFs, code files, links, or practice materials for learners.</p>
                  <button onClick={() => setModal('resource')} style={{ padding: '7px 16px', background: '#F3F4F6', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}>Add Resource</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 90px', gap: 0, marginBottom: 4 }}>
                    {['Resource Name', 'Type', 'Size / URL', 'Visibility', 'Actions'].map(h => (
                      <div key={h} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</div>
                    ))}
                  </div>
                  {resources.map(r => (
                    <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 90px', borderTop: '1px solid #F3F4F6', alignItems: 'center' }}>
                      <div style={{ padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={13} style={{ color: '#E11D48', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{r.name}</span>
                      </div>
                      <div style={{ padding: '10px 10px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', background: '#F3F4F6', borderRadius: 5, color: '#374151' }}>{r.type}</span></div>
                      <div style={{ padding: '10px 10px', fontSize: 12, color: '#6B7280' }}>{r.size}</div>
                      <div style={{ padding: '10px 10px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', background: r.visibility === 'public' ? '#EFF6FF' : '#F0FDF4', color: r.visibility === 'public' ? '#2563EB' : '#16A34A', borderRadius: 5 }}>
                          {r.visibility === 'public' ? 'Public' : 'Enrolled'}
                        </span>
                      </div>
                      <div style={{ padding: '10px 10px', display: 'flex', gap: 8 }}>
                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Eye size={13} style={{ color: '#9CA3AF' }} /></button>
                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Edit3 size={13} style={{ color: '#9CA3AF' }} /></button>
                        <button onClick={() => deleteResource(r.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={13} style={{ color: '#9CA3AF' }} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* S6: Practice / Quick Check */}
            <SectionCard title="Practice & Quick Check">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Quick Quiz</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>Add a short knowledge check at the end of this lesson</p>
                  </div>
                  <Toggle on={quizEnabled} toggle={() => setQuizEnabled(!quizEnabled)} />
                </div>
                {quizEnabled && (
                  <div style={{ paddingLeft: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <Label>Estimated time (min)</Label>
                      <Input value="5" onChange={() => {}} placeholder="5" />
                    </div>
                    <div>
                      <Label>Passing Score (%)</Label>
                      <Input value={passingScore} onChange={setPassingScore} placeholder="70" />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Practice Task</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>Give learners a hands-on task to reinforce concepts</p>
                  </div>
                  <Toggle on={practiceEnabled} toggle={() => setPracticeEnabled(!practiceEnabled)} />
                </div>
              </div>
            </SectionCard>

            {/* S7: Access & Visibility */}
            <SectionCard title="Access & Visibility">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <Label>Lesson Visibility</Label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { id: 'public', icon: Globe, label: 'Public Preview' },
                      { id: 'enrolled', icon: Users, label: 'Enrolled Only' },
                      { id: 'locked', icon: Lock, label: 'Locked' },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setVisibility(opt.id as 'public' | 'enrolled' | 'locked')} style={{ flex: 1, padding: '10px 12px', border: `1.5px solid ${visibility === opt.id ? '#E11D48' : '#E5E7EB'}`, borderRadius: 9, background: visibility === opt.id ? '#FFF1F3' : '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <opt.icon size={14} style={{ color: visibility === opt.id ? '#E11D48' : '#6B7280' }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: visibility === opt.id ? '#E11D48' : '#374151' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Completion Rule</Label>
                  <Select value={completionRule} onChange={setCompletionRule} options={['Watch video until 90%', 'Mark manually', 'Complete quiz', 'Submit assignment']} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Allow comments', val: allowComments, toggle: () => setAllowComments(!allowComments), icon: MessageSquare },
                    { label: 'Allow note-taking', val: allowNotes, toggle: () => setAllowNotes(!allowNotes), icon: Edit3 },
                    { label: 'Allow downloads', val: allowDownloads, toggle: () => setAllowDownloads(!allowDownloads), icon: Download },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <item.icon size={14} style={{ color: '#6B7280' }} />
                        <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                      </div>
                      <Toggle on={item.val} toggle={item.toggle} />
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* S8: Review Checklist */}
            <SectionCard title="Lesson Readiness Checklist">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {checklist.map(item => {
                  const done = checklistState[item.key];
                  return (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: done ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${done ? '#BBF7D0' : '#FDE68A'}`, borderRadius: 8 }}>
                      {done
                        ? <CheckCircle2 size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                        : <AlertCircle size={14} style={{ color: '#D97706', flexShrink: 0 }} />}
                      <span style={{ fontSize: 12.5, color: done ? '#15803D' : '#92400E', fontWeight: 500 }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, padding: '12px 16px', background: '#F9FAFB', borderRadius: 9, border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 2 }}>Completion Score</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>Fill in required fields to publish</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: completionPct >= 80 ? '#16A34A' : '#D97706' }}>{Math.round(completionPct)}%</p>
                  <div style={{ width: 80, height: 4, background: '#E5E7EB', borderRadius: 4, marginTop: 4 }}>
                    <div style={{ width: `${completionPct}%`, height: '100%', background: completionPct >= 80 ? '#16A34A' : '#D97706', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT STICKY PANEL */}
          <div style={{ position: 'sticky', top: 76, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Live Preview */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>Lesson Preview</p>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', background: '#FFFBEB', color: '#D97706', borderRadius: 20, border: '1px solid #FDE68A' }}>
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <div style={{ padding: '16px 18px' }}>
                {/* Thumbnail placeholder */}
                <div style={{ height: 100, background: 'linear-gradient(135deg, #1F2937, #374151)', borderRadius: 9, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlayCircle size={32} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', background: '#FFF1F3', color: '#E11D48', borderRadius: 5, border: '1px solid #FECDD3' }}>
                    {lessonTypes.find(t => t.id === lessonType)?.title}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', background: '#F3F4F6', color: '#374151', borderRadius: 5 }}>{difficulty}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.4, marginBottom: 4 }}>{title || <span style={{ color: '#D1D5DB' }}>Lesson title...</span>}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>{selectedCourse?.title || 'Select a course'} · Course Lessons</p>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{duration || '—'} min</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileText size={11} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{resources.length} resource{resources.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {objectives.length > 0 && (
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Objectives</p>
                    {objectives.slice(0, 3).map(obj => (
                      <div key={obj.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                        <CheckCircle2 size={11} style={{ color: '#E11D48', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.4 }}>{obj.text}</span>
                      </div>
                    ))}
                    {objectives.length > 3 && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>+{objectives.length - 3} more</p>}
                  </div>
                )}
                <button style={{ width: '100%', marginTop: 12, padding: '8px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Eye size={13} /> Preview as Learner
                </button>
              </div>
            </div>

            {/* Course Structure */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Course Structure</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>{selectedCourse?.title || 'Select a course'}</p>
              </div>
              <div style={{ padding: '6px 0' }}>
                {existingLessons.length === 0 && (
                  <div style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF' }}>No lessons in this course yet.</div>
                )}
                {existingLessons.map((l, i) => (
                  <div key={`${l.title}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px', background: l.status === 'current' ? '#FFF1F3' : 'transparent', borderLeft: l.status === 'current' ? '2px solid #E11D48' : '2px solid transparent' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: l.status === 'current' ? '#E11D48' : l.status === 'published' ? '#DCFCE7' : '#F3F4F6', border: `1px solid ${l.status === 'current' ? '#E11D48' : l.status === 'published' ? '#86EFAC' : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {l.status === 'published' && <CheckCircle2 size={10} style={{ color: '#16A34A' }} />}
                      {l.status === 'current' && <span style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>{i + 1}</span>}
                      {l.status !== 'published' && l.status !== 'current' && <span style={{ fontSize: 8, fontWeight: 600, color: '#9CA3AF' }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: l.status === 'current' ? 600 : 400, color: l.status === 'current' ? '#E11D48' : l.status === 'locked' ? '#9CA3AF' : '#374151', lineHeight: 1.3 }}>{l.title}</span>
                    {l.status === 'current' && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#E11D48' }}>New</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Progress */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Setup Progress</p>
                <span style={{ fontSize: 14, fontWeight: 700, color: completionPct >= 80 ? '#16A34A' : '#D97706' }}>{Math.round(completionPct)}%</span>
              </div>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 6, marginBottom: 12 }}>
                <div style={{ width: `${completionPct}%`, height: '100%', background: completionPct >= 80 ? '#16A34A' : '#E11D48', borderRadius: 6, transition: 'width 0.4s' }} />
              </div>
              {completionPct < 100 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {!checklistState.content && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7 }}>
                      <AlertCircle size={12} style={{ color: '#D97706', flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: '#92400E' }}>Missing: lesson content</span>
                    </div>
                  )}
                  {!checklistState.objectives && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7 }}>
                      <AlertCircle size={12} style={{ color: '#D97706', flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: '#92400E' }}>Missing: learning objectives</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '7px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 7 }}>
                    <Info size={12} style={{ color: '#2563EB', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11.5, color: '#1D4ED8' }}>Next: {!checklistState.content ? 'Add lesson content' : !checklistState.objectives ? 'Add objectives' : 'Review & publish'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD RESOURCE MODAL */}
      {modal === 'resource' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Add Resource</h3>
              <button onClick={() => setModal(null)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><Label required>Resource Name</Label><Input value={rName} onChange={setRName} placeholder="e.g. REST Controller Cheat Sheet" /></div>
              <div><Label>Resource Type</Label><Select value={rType} onChange={setRType} options={['PDF', 'ZIP', 'JSON', 'Link', 'Video', 'Image', 'Other']} /></div>
              <div>
                <Label>Upload File or URL</Label>
                <div style={{ border: '1.5px dashed #E5E7EB', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                  <Upload size={18} style={{ color: '#9CA3AF', marginBottom: 6 }} />
                  <p style={{ fontSize: 12.5, color: '#6B7280' }}>Drop file or click to browse</p>
                </div>
              </div>
              <div><Label>Visibility</Label><Select value={rVisibility === 'public' ? 'Public' : 'Enrolled Only'} onChange={v => setRVisibility(v === 'Public' ? 'public' : 'enrolled')} options={['Enrolled Only', 'Public']} /></div>
              <div><Label>Description (optional)</Label><Input value="" onChange={() => {}} placeholder="Brief description for learners" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
              <button onClick={handleAddResource} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Add Resource</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD QUIZ QUESTION MODAL */}
      {modal === 'quiz' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Add Quiz Question</h3>
              <button onClick={() => setModal(null)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Label required>Question Text</Label>
                <textarea value={qText} onChange={e => setQText(e.target.value)} rows={3} placeholder="Enter your question..." style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, background: '#FAFAFA', boxSizing: 'border-box' }} />
              </div>
              <div><Label>Question Type</Label><Select value="Multiple Choice" onChange={() => {}} options={['Multiple Choice', 'True / False', 'Short Answer']} /></div>
              <div>
                <Label>Answer Options</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {qOptions.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => setQCorrect(i)} style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${qCorrect === i ? '#E11D48' : '#D1D5DB'}`, background: qCorrect === i ? '#E11D48' : 'transparent', cursor: 'pointer', flexShrink: 0 }} />
                      <input value={opt} onChange={e => { const a = [...qOptions]; a[i] = e.target.value; setQOptions(a); }} placeholder={`Option ${i + 1}`} style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 10px', fontSize: 12.5, outline: 'none', background: '#FAFAFA' }} />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 5 }}>Click the circle to mark the correct answer</p>
              </div>
              <div><Label>Explanation (optional)</Label><Input value="" onChange={() => {}} placeholder="Explain why this is the correct answer..." /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
              <button onClick={handleAddQuestion} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Add Question</button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {modal === 'publish' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.16)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Info size={24} style={{ color: '#2563EB' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Publish lesson?</h3>
            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 18 }}>
              Learners enrolled in <strong style={{ color: '#111827' }}>{selectedCourse?.title || 'this course'}</strong> will be able to access this lesson based on its visibility settings.
            </p>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
              {checklist.slice(0, 5).map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  {checklistState[item.key]
                    ? <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                    : <AlertCircle size={13} style={{ color: '#D97706' }} />}
                  <span style={{ fontSize: 12.5, color: checklistState[item.key] ? '#15803D' : '#92400E' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '11px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
              <button onClick={confirmPublish} disabled={isSaving} style={{ flex: 1, padding: '11px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: isSaving ? 0.7 : 1 }}>
                <Rocket size={14} /> {isSaving ? 'Saving...' : 'Publish Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 2000, animation: 'none' }}>
          <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{toastMessage}</span>
          <button onClick={() => setShowToast(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 8 }}><X size={13} style={{ color: '#9CA3AF' }} /></button>
        </div>
      )}
    </div>
  );
}

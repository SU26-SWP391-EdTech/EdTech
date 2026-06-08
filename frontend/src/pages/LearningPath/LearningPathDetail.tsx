import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, Users, Star, ChevronRight, Home,
  Bookmark, Play, Check, Lock, ChevronDown, ChevronUp,
  Award, Zap, Target, MessageSquare, ThumbsUp, ArrowRight,
  Monitor, Database, Shield, Settings, Code, Layers,
  Trophy, Flame, Calendar, TrendingUp, PlayCircle,
  CheckCircle2, Radio, AlertCircle, Inbox, Plus,
  Globe, Heart, Share2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.stores';
import type { Course } from '../../services/course/course.service';
import type { Enrollment } from '../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../services/learning-path/learning-path.service';

type NodeState = 'completed' | 'current' | 'upcoming' | 'locked';

interface CourseNode {
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

interface Module {
  id: number;
  title: string;
  lessons: { title: string; done: boolean; duration: string }[];
}

const WEEKLY = [
  { day: 'Mon', h: 1.5 }, { day: 'Tue', h: 2.5 }, { day: 'Wed', h: 0 },
  { day: 'Thu', h: 3 }, { day: 'Fri', h: 1 }, { day: 'Sat', h: 0.5 }, { day: 'Sun', h: 0 },
];

const COMMUNITY = [
  { user: 'Sarah Kim', initials: 'SK', color: '#7C3AED', time: '2h ago', text: 'Finally understood useEffect with the cleanup function — the video at 14:30 is gold!', likes: 12, replies: 4 },
  { user: 'Marcus Davis', initials: 'MD', color: '#2563EB', time: '5h ago', text: 'Anyone else struggling with the custom hooks exercise? Would love a study partner.', likes: 8, replies: 7 },
  { user: 'Priya Nair', initials: 'PN', color: '#059669', time: '1d ago', text: 'Completed module 1! The pace is perfect. Moving on to state management now 🎉', likes: 21, replies: 3 },
];

const BADGES = [
  { label: 'Foundations', desc: 'Completed basic design/code', icon: <Code className="w-4 h-4" />, earned: true, color: '#E11D48' },
  { label: 'Code Ninja', desc: 'Advanced JS/React done', icon: <Zap className="w-4 h-4" />, earned: true, color: '#D97706' },
  { label: 'Explorer', desc: 'Active study in paths', icon: <Monitor className="w-4 h-4" />, earned: false, color: '#2563EB' },
  { label: 'Full-Stack Dev', desc: 'Complete the path', icon: <Trophy className="w-4 h-4" />, earned: false, color: '#7C3AED' },
];

/* ─── Sub-components ─── */
function CircularProgress({ value, size = 100 }: { value: number; size?: number }) {
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E11D48" strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 18, fontWeight: 700, fill: '#111827', transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
        {value}%
      </text>
    </svg>
  );
}

const nodeCfg = {
  completed: { ring: '#16A34A', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', line: '#BBF7D0', badge: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', icon: <Check className="w-3.5 h-3.5 text-white" /> },
  current:   { ring: '#E11D48', bg: 'bg-white', border: 'border-[#FECDD3]', line: '#E5E7EB', badge: 'bg-[#FFF1F3] text-[#E11D48] border-[#FECDD3]', icon: <Radio className="w-3.5 h-3.5 text-white" /> },
  upcoming:  { ring: '#D1D5DB', bg: 'bg-white', border: 'border-[#E5E7EB]', line: '#E5E7EB', badge: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]', icon: <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" /> },
  locked:    { ring: '#E5E7EB', bg: 'bg-[#F9FAFB]', border: 'border-[#F3F4F6]', line: '#F3F4F6', badge: 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]', icon: <Lock className="w-3.5 h-3.5 text-[#D1D5DB]" /> },
};

function RoadmapCard({ node, isLast, onSelect, onEnroll }: { node: CourseNode; isLast: boolean; onSelect: () => void; onEnroll: () => void }) {
  const cfg = nodeCfg[node.state];
  const isLocked = node.state === 'locked';

  return (
    <div className="relative flex gap-4 cursor-pointer" onClick={onSelect}>
      {/* Vertical connector */}
      {!isLast && (
        <div className="absolute top-10 w-0.5 bottom-0" style={{ left: '15px', backgroundColor: cfg.line, zIndex: 0 }} />
      )}

      {/* Step circle */}
      <div className="shrink-0 z-10 flex flex-col items-center" style={{ paddingTop: 2 }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: isLocked ? '#F3F4F6' : node.state === 'upcoming' ? '#fff' : nodeCfg[node.state].ring, border: `2px solid ${nodeCfg[node.state].ring}` }}
        >
          {cfg.icon}
        </div>
      </div>

      {/* Card */}
      <div className={`flex-1 mb-5 rounded-2xl border p-4 transition-all hover:shadow-md ${cfg.bg} ${cfg.border} ${isLocked ? 'opacity-60' : ''} ${node.state === 'current' ? 'shadow-sm shadow-[#E11D48]/10 ring-1 ring-[#FECDD3]' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: isLocked ? '#E5E7EB' : node.color, opacity: isLocked ? 0.5 : 1 }}
          >
            <span style={{ color: 'white' }}>{node.icon}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-sm ${isLocked ? 'text-[#9CA3AF]' : 'text-[#111827]'}`} style={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {node.title}
                </p>
                <p className={`text-xs mt-0.5 ${isLocked ? 'text-[#C0C0C0]' : 'text-[#6B7280]'}`} style={{ lineHeight: 1.5 }}>
                  {node.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.badge}`} style={{ fontWeight: 500 }}>
                  {node.state === 'completed' && 'Done'}
                  {node.state === 'current' && 'Active'}
                  {node.state === 'upcoming' && 'Next'}
                  {node.state === 'locked' && 'Locked'}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#9CA3AF]" /><span className="text-xs text-[#9CA3AF]">{node.duration}</span></div>
              <div className="flex items-center gap-1"><PlayCircle className="w-3 h-3 text-[#9CA3AF]" /><span className="text-xs text-[#9CA3AF]">{node.lessons} lessons</span></div>
              {!isLocked && node.topics.slice(0, 2).map(t => (
                <span key={t} className="px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded text-[10px]">{t}</span>
              ))}
            </div>

            {/* Progress bar */}
            {node.progress > 0 && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#9CA3AF]">Progress</span>
                  <span className="text-[10px]" style={{ fontWeight: 600, color: node.state === 'completed' ? '#16A34A' : '#E11D48' }}>{node.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${node.progress}%`, backgroundColor: node.state === 'completed' ? '#16A34A' : '#E11D48' }} />
                </div>
              </div>
            )}

            {/* CTA for current/upcoming */}
            {node.state === 'current' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" 
                style={{ fontWeight: 500 }}
              >
                <Play className="w-3 h-3 fill-white" /> Continue — Lesson {Math.max(1, Math.floor(node.lessons * (node.progress / 100)))} of {node.lessons}
              </button>
            )}

            {node.state === 'upcoming' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEnroll(); }}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" 
                style={{ fontWeight: 500 }}
              >
                Enroll Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleAccordion({ module, defaultOpen, onStartLesson }: { module: Module; defaultOpen?: boolean; onStartLesson: (lessonTitle: string) => void }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const done = module.lessons.filter(l => l.done).length;
  const total = module.lessons.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${pct === 100 ? 'bg-[#16A34A]' : 'bg-[#F3F4F6] border border-[#E5E7EB]'}`}>
          {pct === 100 ? <Check className="w-3 h-3 text-white" /> : <span className="text-[9px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>{pct}%</span>}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{module.title}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{done}/{total} lessons</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16A34A' : '#E11D48' }} />
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#F3F4F6] bg-[#FAFAFA]">
          {module.lessons.map((lesson, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i < module.lessons.length - 1 ? 'border-b border-[#F3F4F6]' : ''} hover:bg-[#F5F5F5] transition-colors`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${lesson.done ? 'bg-[#16A34A]' : 'bg-white border border-[#E5E7EB]'}`}>
                {lesson.done ? <Check className="w-2.5 h-2.5 text-white" /> : <Play className="w-2 h-2 text-[#D1D5DB] fill-[#D1D5DB]" />}
              </div>
              <span className={`text-xs flex-1 ${lesson.done ? 'text-[#6B7280] line-through decoration-[#9CA3AF]' : 'text-[#374151]'}`} style={{ fontWeight: lesson.done ? 400 : 500 }}>
                {lesson.title}
              </span>
              <span className="text-[10px] text-[#9CA3AF] shrink-0">{lesson.duration}</span>
              {!lesson.done && (
                <button 
                  onClick={() => onStartLesson(lesson.title)}
                  className="px-2 py-0.5 bg-white border border-[#E5E7EB] text-[#6B7280] rounded text-[10px] hover:border-[#E11D48] hover:text-[#E11D48] transition-colors" 
                  style={{ fontWeight: 500 }}
                >
                  Start
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export function LearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  // Currently selected course for content view
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

        const storedEnrollments = sessionStorage.getItem('explore_cache_enrollments');
        const activeEnrollments = storedEnrollments ? JSON.parse(storedEnrollments) : MOCK_ENROLLMENTS;
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
  }, [id, navigate]);

  if (isLoading || !path) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading Learning Path details...</p>
        </div>
      </div>
    );
  }

  const pathCourses = path.learningPathCourses || [];

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
    let icon = <Code className="w-5 h-5" />;
    if (pc.course?.title.toLowerCase().includes('figma') || pc.course?.title.toLowerCase().includes('design')) {
      icon = <Layers className="w-5 h-5" />;
    } else if (pc.course?.title.toLowerCase().includes('database') || pc.course?.title.toLowerCase().includes('api')) {
      icon = <Database className="w-5 h-5" />;
    } else if (pc.course?.title.toLowerCase().includes('docker')) {
      icon = <Shield className="w-5 h-5" />;
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
    
    // Create 4 realistic modules for any course
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

  // Actions
  const handleEnrollSingleCourse = async (courseId: number) => {
    if (!user) {
      toast.error('Please sign in to enroll.');
      navigate('/login');
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
    // Dynamically simulate progress increment when they start a lesson
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

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB,#3B82F6)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/30"
              style={{ width: 200 + i * 80, height: 200 + i * 80, top: -60 + i * 10, right: -80 + i * 20, opacity: 0.4 - i * 0.05 }} />
          ))}
        </div>

        <div className="relative max-w-[1376px] mx-auto px-8 py-10">

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2.5 py-1 bg-white/15 text-white border border-white/20 rounded-full text-xs backdrop-blur-sm capitalize" style={{ fontWeight: 500 }}>
                  {path.level}
                </span>
                <span className="px-2.5 py-1 bg-white/15 text-white border border-white/20 rounded-full text-xs backdrop-blur-sm" style={{ fontWeight: 500 }}>
                  Professional Path
                </span>
                {overallProgress > 0 && (
                  <span className="px-2.5 py-1 bg-[#16A34A]/80 text-white border border-[#16A34A]/40 rounded-full text-xs backdrop-blur-sm" style={{ fontWeight: 500 }}>
                    In Progress
                  </span>
                )}
              </div>

              <h1 className="text-white mb-2" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.15 }}>{path.title}</h1>
              <p className="text-white/70 text-sm mb-5 max-w-xl" style={{ lineHeight: 1.6 }}>{path.description}</p>

              {/* Stats row */}
              <div className="flex items-center gap-5 mb-5 flex-wrap">
                {[
                  { icon: <Clock className="w-3.5 h-3.5" />, val: `${totalCourses * 12}h`, label: 'total hours' },
                  { icon: <BookOpen className="w-3.5 h-3.5" />, val: `${totalCourses}`, label: 'courses' },
                  { icon: <Users className="w-3.5 h-3.5" />, val: '1,250', label: 'enrolled' },
                  { icon: <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />, val: '4.8', label: '(312 reviews)' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-white/80">
                    {s.icon}
                    <span className="text-sm" style={{ fontWeight: 600 }}>{s.val}</span>
                    <span className="text-xs text-white/50">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Overall progress */}
              <div className="max-w-sm mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/70">Your path progress</span>
                  <span className="text-sm text-white" style={{ fontWeight: 700 }}>{overallProgress}%</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                </div>
                <p className="text-xs text-white/50 mt-1">{completedCourses} of {totalCourses} courses completed</p>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 bg-indigo-600" style={{ fontSize: '10px', fontWeight: 700 }}>
                  ED
                </div>
                <div>
                  <span className="text-xs text-white" style={{ fontWeight: 500 }}>EdTech Academy Team</span>
                  <span className="text-xs text-white/50"> · Curriculum Lead · Active Guidance</span>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-5 shrink-0 w-64">
              <div className="flex justify-center mb-4">
                <CircularProgress value={overallProgress} size={96} />
              </div>
              <p className="text-center text-white/70 text-xs mb-4">
                <span className="text-white animate-pulse" style={{ fontWeight: 700 }}>{remainingHours}h</span> remaining · <span className="text-white" style={{ fontWeight: 700 }}>{remainingLessons}</span> lessons left
              </p>
              <button 
                onClick={handleEnrollAllPath}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors mb-2" 
                style={{ fontWeight: 600 }}
              >
                <Play className="w-4 h-4 fill-white" /> {overallProgress > 0 ? 'Continue Roadmap' : 'Enroll Learning Path'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setBookmarked(b => !b)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border transition-colors ${bookmarked ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}
                  style={{ fontWeight: 500 }}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} /> {bookmarked ? 'Saved' : 'Bookmark'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border border-white/20 bg-white/10 text-white/70 hover:bg-white/20 transition-colors" style={{ fontWeight: 500 }}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1376px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">

          {/* Left Column */}
          <div className="col-span-7 flex flex-col gap-6">

            {/* Learning Roadmap node roadmap list */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>Learning Roadmap</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{completedCourses} of {totalCourses} courses completed · follow the path sequentially</p>
                </div>
                <div className="flex items-center gap-3">
                  {(['completed', 'current', 'upcoming', 'locked'] as const).map(state => (
                    <div key={state} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{
                        backgroundColor: state === 'completed' ? '#16A34A' : state === 'current' ? '#E11D48' : state === 'upcoming' ? '#D1D5DB' : '#F3F4F6',
                        border: state === 'locked' ? '1px solid #E5E7EB' : 'none'
                      }} />
                      <span className="text-[10px] text-[#9CA3AF] capitalize">{state}</span>
                    </div>
                  ))}
                </div>
              </div>

              {roadmapNodes.map((node, i) => (
                <RoadmapCard 
                  key={node.id} 
                  node={node} 
                  isLast={i === roadmapNodes.length - 1} 
                  onSelect={() => node.state !== 'locked' && setActiveCourseId(node.id)}
                  onEnroll={() => handleEnrollSingleCourse(node.id)}
                />
              ))}

              {/* Certificate preview */}
              {/* <div className="flex gap-4 mt-2">
                <div className="w-8 h-8 rounded-full bg-[#F8FAFC] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-[#D1D5DB]" />
                </div>
                <div className="flex-1 bg-gradient-to-r from-[#FFF1F3] to-[#F8FAFC] border border-[#FECDD3] rounded-2xl p-4">
                  <p className="text-sm text-[#111827]" style={{ fontWeight: 700 }}>Certificate of Completion</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Complete all {totalCourses} courses to earn your verified Professional certificate.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E11D48] rounded-full" style={{ width: `${overallProgress}%` }} />
                    </div>
                    <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600 }}>{overallProgress}%</span>
                  </div>
                </div>
              </div> */}
            </div>

            

            {/* Community Section */}
            {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>Community Discussions</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Ask questions and collaborate with fellow learners</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                  <Plus className="w-3.5 h-3.5" /> New Post
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                {COMMUNITY.map((post, i) => (
                  <div key={i} className="border border-[#F3F4F6] rounded-xl p-4 hover:border-[#E5E7EB] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: post.color, fontSize: '11px', fontWeight: 700 }}>
                        {post.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>{post.user}</span>
                          <span className="text-[10px] text-[#9CA3AF]">{post.time}</span>
                        </div>
                        <p className="text-xs text-[#374151]" style={{ lineHeight: 1.6 }}>{post.text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => setLiked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                            className={`flex items-center gap-1 text-xs transition-colors ${liked.has(i) ? 'text-[#E11D48]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${liked.has(i) ? 'fill-[#E11D48]' : ''}`} />
                            {post.likes + (liked.has(i) ? 1 : 0)}
                          </button>
                          <button className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                            <MessageSquare className="w-3 h-3" /> {post.replies} replies
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

          </div>

          {/* Right Sidebar */}
          <div className="col-span-5 flex flex-col gap-4">

            {/* Course Content Accordion */}
            {activeCourse && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>Course Content</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{activeCourse.title} — {selectedNode.progress}% complete</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {currentModules.map((mod, i) => (
                    <ModuleAccordion 
                      key={mod.id} 
                      module={mod} 
                      defaultOpen={i === 0} 
                      onStartLesson={handleStartLesson}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Path stats */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <h3 className="text-[#111827] mb-4" style={{ fontSize: '15px', fontWeight: 700 }}>Your Progress Overview</h3>
              <div className="flex items-center gap-5 mb-4">
                <div className="shrink-0">
                  <CircularProgress value={overallProgress} size={90} />
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  {[
                    { label: 'Completed Courses', val: `${completedCourses}/${totalCourses}`, color: '#16A34A', bg: 'bg-[#F0FDF4]' },
                    { label: 'Remaining Lessons', val: `${remainingLessons}`, color: '#D97706', bg: 'bg-[#FFFBEB]' },
                    { label: 'Remaining Hours', val: `${remainingHours}h`, color: '#2563EB', bg: 'bg-[#EFF6FF]' },
                  ].map(s => (
                    <div key={s.label} className={`flex items-center justify-between px-3 py-2 ${s.bg} rounded-xl`}>
                      <span className="text-xs text-[#6B7280]">{s.label}</span>
                      <span className="text-xs" style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#FFF1F3] to-[#FFFBEB] border border-[#FECDD3] rounded-xl">
                <Flame className="w-4 h-4 text-[#E11D48]" />
                <span className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>Active learning streak!</span>
                <span className="text-xs text-[#9CA3AF] ml-auto">Keep studying 🔥</span>
              </div>
            </div>

            {/* Badges unlocked */}
            {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#111827]" style={{ fontSize: '15px', fontWeight: 700 }}>Achievement Badges</h3>
                <span className="text-xs text-[#9CA3AF]">{BADGES.filter(b => b.earned).length}/{BADGES.length} unlocked</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BADGES.map((badge) => (
                  <div
                    key={badge.label}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors ${
                      badge.earned
                        ? 'bg-white border-[#E5E7EB] shadow-sm'
                        : 'bg-[#F9FAFB] border-[#F3F4F6] opacity-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: badge.earned ? badge.color : '#E5E7EB', color: 'white' }}
                    >
                      {badge.icon}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs truncate ${badge.earned ? 'text-[#111827]' : 'text-[#9CA3AF]'}`} style={{ fontWeight: 600 }}>{badge.label}</p>
                      <p className="text-[10px] text-[#9CA3AF] truncate">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Weekly activity chart */}
            {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#111827]" style={{ fontSize: '15px', fontWeight: 700 }}>Weekly Learning Hours</h3>
                <div className="flex items-center gap-1 text-xs text-[#16A34A]" style={{ fontWeight: 500 }}>
                  <TrendingUp className="w-3.5 h-3.5" /> 8.5h total
                </div>
              </div>
              <div style={{ height: 80, width: '100%' }}>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={WEEKLY} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={20}>
                    <Bar dataKey="h" radius={[4, 4, 0, 0]} fill="#E11D48" opacity={0.85} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: number) => [`${v}h`, 'Study time']}
                      contentStyle={{ fontSize: 11, border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px' }}
                      cursor={{ fill: '#F3F4F6', radius: 4 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}

            {/* Up Next Recommendation */}
            {/* {roadmapNodes.find(n => n.state === 'upcoming') && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <div className="flex items-center gap-1 mb-3">
                  <Target className="w-4 h-4 text-[#E11D48]" />
                  <h3 className="text-[#111827]" style={{ fontSize: '15px', fontWeight: 700 }}>Up Next</h3>
                </div>
                {(() => {
                  const nextNode = roadmapNodes.find(n => n.state === 'upcoming')!;
                  return (
                    <div className="flex gap-3 p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#111827]" style={{ fontWeight: 700 }}>{nextNode.title}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">{nextNode.duration} · {nextNode.lessons} lessons</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )} */}

            {/* Certificate preview */}
            {/* <div className="bg-gradient-to-br from-[#FFF1F3] to-[#F8FAFC] border border-[#FECDD3] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-[#E11D48]" />
                <h3 className="text-[#111827]" style={{ fontSize: '15px', fontWeight: 700 }}>Path Certificate Preview</h3>
              </div>
              <div className="bg-white border border-[#FECDD3] rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-[#E11D48]" style={{ fontWeight: 700 }}>EDTECH PLATFORM</div>
                  <Award className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                </div>
                <p className="text-xs text-[#9CA3AF] mb-0.5">This certifies that</p>
                <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 700 }}>{user?.fullName || 'Nguyễn Văn Learner'}</p>
                <p className="text-xs text-[#6B7280]">has completed the professional roadmap</p>
                <p className="text-xs text-[#111827] mt-0.5 font-bold">{path.title}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
                  <span className="text-[10px] text-[#9CA3AF]">Issued on completion</span>
                  <span className="text-[10px] text-[#9CA3AF]">Verified ✓</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E11D48] rounded-full" style={{ width: `${overallProgress}%` }} />
                </div>
                <span style={{ fontWeight: 500, color: '#E11D48' }}>{overallProgress}%</span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1 text-center">Complete all roadmap courses to unlock</p>
            </div> */}

          </div>
        </div>
      </div>
    </div>
  );
}

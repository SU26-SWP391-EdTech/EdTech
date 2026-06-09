import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Bookmark, BookOpen, ChevronDown, ChevronUp, CheckCircle2,
  Lock, Video, FileText, HelpCircle, Clock, Users, Star, Award,
  Download, MessageSquare, ThumbsUp, Volume2, Maximize2,
  SkipForward, Settings, Share2, Bell, BarChart2, Zap, Target,
  ChevronRight, PlayCircle
} from 'lucide-react';

const COURSE = {
  title: 'Advanced React Development',
  subtitle: 'Master modern React patterns, hooks, performance optimization, and real-world application architecture',
  instructor: { name: 'Sarah Chen', avatar: 'SC', title: 'Senior Frontend Engineer', rating: 4.9, students: 12400, courses: 8 },
  rating: 4.8,
  reviews: 342,
  enrolled: 1240,
  duration: '12h 30m',
  lessons: 24,
  difficulty: 'Advanced',
  language: 'English',
  lastUpdated: 'April 2026',
  category: 'Frontend Development',
  progress: 52,
  completedLessons: 12,
  currentLesson: 'useCallback and useMemo Deep Dive',
  thumbGradient: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
};

type LessonState = 'completed' | 'current' | 'upcoming' | 'locked';
type LessonType = 'video' | 'exercise' | 'quiz' | 'reading';

interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  duration: string;
  state: LessonState;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  state: LessonState;
  duration: string;
}

const MODULES: Module[] = [
  {
    id: 1,
    title: 'React Fundamentals Review',
    state: 'completed',
    duration: '2h 10m',
    lessons: [
      { id: 1, title: 'Component Architecture & JSX', type: 'video', duration: '18:24', state: 'completed' },
      { id: 2, title: 'Props, State & Lifecycle', type: 'video', duration: '22:10', state: 'completed' },
      { id: 3, title: 'Event Handling Patterns', type: 'reading', duration: '8 min', state: 'completed' },
      { id: 4, title: 'Module Quiz', type: 'quiz', duration: '10 min', state: 'completed' },
    ],
  },
  {
    id: 2,
    title: 'Hooks & State Management',
    state: 'current',
    duration: '3h 20m',
    lessons: [
      { id: 5, title: 'useState & useReducer Patterns', type: 'video', duration: '24:30', state: 'completed' },
      { id: 6, title: 'useEffect & Cleanup Functions', type: 'video', duration: '28:15', state: 'completed' },
      { id: 7, title: 'useCallback and useMemo Deep Dive', type: 'video', duration: '31:00', state: 'current' },
      { id: 8, title: 'Custom Hooks Workshop', type: 'exercise', duration: '45 min', state: 'upcoming' },
      { id: 9, title: 'Context API vs. Redux', type: 'video', duration: '26:40', state: 'upcoming' },
      { id: 10, title: 'State Management Quiz', type: 'quiz', duration: '15 min', state: 'upcoming' },
    ],
  },
  {
    id: 3,
    title: 'React Router & Navigation',
    state: 'upcoming',
    duration: '2h 00m',
    lessons: [
      { id: 11, title: 'React Router v6 Setup', type: 'video', duration: '20:00', state: 'upcoming' },
      { id: 12, title: 'Nested Routes & Layouts', type: 'video', duration: '18:30', state: 'upcoming' },
      { id: 13, title: 'Route Guards & Auth', type: 'exercise', duration: '30 min', state: 'upcoming' },
      { id: 14, title: 'Navigation Exercise', type: 'exercise', duration: '25 min', state: 'upcoming' },
    ],
  },
  {
    id: 4,
    title: 'Forms & Validation',
    state: 'locked',
    duration: '2h 30m',
    lessons: [
      { id: 15, title: 'Controlled vs Uncontrolled Forms', type: 'video', duration: '22:00', state: 'locked' },
      { id: 16, title: 'React Hook Form Deep Dive', type: 'video', duration: '34:00', state: 'locked' },
      { id: 17, title: 'Yup & Zod Validation', type: 'video', duration: '28:00', state: 'locked' },
      { id: 18, title: 'Form Exercise', type: 'exercise', duration: '40 min', state: 'locked' },
    ],
  },
  {
    id: 5,
    title: 'Testing React Applications',
    state: 'locked',
    duration: '2h 30m',
    lessons: [
      { id: 19, title: 'Testing Fundamentals', type: 'video', duration: '20:00', state: 'locked' },
      { id: 20, title: 'React Testing Library', type: 'video', duration: '30:00', state: 'locked' },
      { id: 21, title: 'Mocking & Async Tests', type: 'video', duration: '25:00', state: 'locked' },
      { id: 22, title: 'Integration Testing', type: 'exercise', duration: '45 min', state: 'locked' },
      { id: 23, title: 'Final Project', type: 'exercise', duration: '60 min', state: 'locked' },
      { id: 24, title: 'Course Assessment', type: 'quiz', duration: '20 min', state: 'locked' },
    ],
  },
];

const REVIEWS = [
  { id: 1, user: 'Marcus T.', avatar: 'MT', rating: 5, date: 'May 2026', helpful: 24, text: 'Absolutely phenomenal course. The deep dives into hooks and performance optimization were exactly what I needed. Sarah explains complex concepts with crystal clarity.' },
  { id: 2, user: 'Priya K.', avatar: 'PK', rating: 5, date: 'April 2026', helpful: 18, text: 'Best React course I\'ve taken. The custom hooks workshop was incredibly practical — I immediately applied the patterns at work. The exercises are challenging but rewarding.' },
  { id: 3, user: 'Jordan Lee', avatar: 'JL', rating: 4, date: 'April 2026', helpful: 11, text: 'Great content overall. Would love more content on server-side rendering and Next.js integration, but the React fundamentals and hooks coverage is top-notch.' },
];

const QA = [
  { id: 1, type: 'question' as const, user: 'Alex R.', avatar: 'AR', time: '2 days ago', replies: 3, likes: 7, text: 'When should I use useReducer instead of useState? I\'m finding it hard to know when to reach for each one in a real project.' },
  { id: 2, type: 'discussion' as const, user: 'Sam M.', avatar: 'SM', time: '4 days ago', replies: 8, likes: 15, text: 'Sharing my custom useFetch hook from the workshop — it includes error boundaries, caching, and retry logic. Hope it helps others!' },
  { id: 3, type: 'question' as const, user: 'Dana W.', avatar: 'DW', time: '1 week ago', replies: 2, likes: 4, text: 'Is there a significant performance difference between Context API and Redux for large applications? The video touched on this briefly.' },
];

const SKILLS = ['React Hooks', 'Performance', 'State Management', 'React Router', 'Testing', 'Custom Hooks', 'Context API', 'TypeScript'];

const RESOURCES = [
  { name: 'Course Slides (PDF)', size: '4.2 MB' },
  { name: 'Exercise Starter Files', size: '12.8 MB' },
  { name: 'Hooks Cheatsheet', size: '1.1 MB' },
  { name: 'Project Boilerplate', size: '8.4 MB' },
];

const WEEKLY_ACTIVITY = [
  { day: 'Mon', mins: 45 },
  { day: 'Tue', mins: 90 },
  { day: 'Wed', mins: 30 },
  { day: 'Thu', mins: 75 },
  { day: 'Fri', mins: 60 },
  { day: 'Sat', mins: 0 },
  { day: 'Sun', mins: 20 },
];

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
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 18, fontWeight: 700, fill: '#111827', transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
        {value}%
      </text>
    </svg>
  );
}

function LessonIcon({ type }: { type: LessonType }) {
  const map: Record<LessonType, React.ReactNode> = {
    video: <Video className="w-3.5 h-3.5" />,
    exercise: <Target className="w-3.5 h-3.5" />,
    quiz: <HelpCircle className="w-3.5 h-3.5" />,
    reading: <FileText className="w-3.5 h-3.5" />,
  };
  return <>{map[type]}</>;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E5E7EB]'}`} />
      ))}
    </div>
  );
}

interface ModuleAccordionProps {
  module: Module;
  isOpen: boolean;
  onToggle: () => void;
}

function ModuleAccordion({ module, isOpen, onToggle }: ModuleAccordionProps) {
  const stateMap: Record<LessonState, { dot: string; icon: React.ReactNode }> = {
    completed: { dot: 'bg-[#10B981]', icon: <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> },
    current: { dot: 'bg-[#E11D48]', icon: <PlayCircle className="w-4 h-4 text-[#E11D48]" /> },
    upcoming: { dot: 'bg-[#E5E7EB]', icon: <div className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" /> },
    locked: { dot: 'bg-[#E5E7EB]', icon: <Lock className="w-4 h-4 text-[#D1D5DB]" /> },
  };

  const completedCount = module.lessons.filter(l => l.state === 'completed').length;

  const headerColors: Record<LessonState, string> = {
    completed: 'border-l-[#10B981]',
    current: 'border-l-[#E11D48]',
    upcoming: 'border-l-[#E5E7EB]',
    locked: 'border-l-[#E5E7EB]',
  };

  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-xl overflow-hidden ${module.state === 'locked' ? 'opacity-70' : ''}`}>
      <button
        className={`w-full flex items-center justify-between p-5 text-left border-l-4 ${headerColors[module.state]} hover:bg-[#F8FAFC] transition-colors`}
        onClick={onToggle}
        disabled={module.state === 'locked'}
      >
        <div className="flex items-center gap-3 min-w-0">
          {module.state === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
          ) : module.state === 'locked' ? (
            <Lock className="w-5 h-5 text-[#D1D5DB] flex-shrink-0" />
          ) : (
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${module.state === 'current' ? 'bg-[#E11D48]' : 'border-2 border-[#D1D5DB]'}`} />
          )}
          <div className="min-w-0">
            <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 600 }}>{module.title}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{completedCount}/{module.lessons.length} lessons · {module.duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {module.state === 'locked' && (
            <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">Locked</span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-[#F3F4F6]">
          {module.lessons.map((lesson) => {
            const cfg = stateMap[lesson.state];
            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${lesson.state === 'current'
                  ? 'bg-[#FFF1F4]'
                  : lesson.state === 'locked'
                    ? 'cursor-not-allowed'
                    : 'hover:bg-[#F8FAFC] cursor-pointer'
                  } transition-colors`}
              >
                <div className="flex-shrink-0">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${lesson.state === 'current' ? 'text-[#E11D48]' : lesson.state === 'locked' ? 'text-[#9CA3AF]' : 'text-[#374151]'
                    }`} style={{ fontWeight: lesson.state === 'current' ? 600 : 400 }}>
                    {lesson.title}
                    {lesson.state === 'current' && (
                      <span className="ml-2 text-xs bg-[#E11D48] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>NOW</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[#9CA3AF]">
                  <LessonIcon type={lesson.type} />
                  <span className="text-xs">{lesson.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CourseDetail() {
  const navigate = useNavigate();
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([1, 2]));
  const [helpfulSet, setHelpfulSet] = useState<Set<number>>(new Set());
  const [likedQA, setLikedQA] = useState<Set<number>>(new Set());
  const [bookmarked, setBookmarked] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const toggleModule = (id: number) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = MODULES.reduce((s, m) => s + m.lessons.filter(l => l.state === 'completed').length, 0);
  const remaining = totalLessons - completedLessons;
  const maxMins = Math.max(...WEEKLY_ACTIVITY.map(d => d.mins));

  return (
    <main className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      {/* <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
        <span onClick={() => navigate(-1)} className="hover:text-[#111827] cursor-pointer">Courses</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#111827]" style={{ fontWeight: 500 }}>Advanced React Development</span>
      </div> */}

      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{ background: COURSE.thumbGradient }}>
        <div className="px-10 py-10 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-[600px]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-white/70 bg-white/20 px-2.5 py-1 rounded-full">{COURSE.category}</span>
              <span className="text-xs text-white/70 bg-white/20 px-2.5 py-1 rounded-full">{COURSE.difficulty}</span>
            </div>
            <h1 className="text-[32px] text-white mb-3" style={{ fontWeight: 700, lineHeight: 1.2 }}>{COURSE.title}</h1>
            <p className="text-white/75 text-sm mb-6" style={{ lineHeight: 1.6 }}>{COURSE.subtitle}</p>

            <div className="flex items-center gap-5 flex-wrap mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#FCD34D] fill-[#FCD34D]" />
                <span className="text-white text-sm" style={{ fontWeight: 600 }}>{COURSE.rating}</span>
                <span className="text-white/60 text-sm">({COURSE.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Users className="w-4 h-4" />
                <span>{COURSE.enrolled.toLocaleString()} enrolled</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>{COURSE.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{COURSE.lessons} lessons</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm" style={{ fontWeight: 600 }}>
                {COURSE.instructor.avatar}
              </div>
              <div>
                <p className="text-white text-sm" style={{ fontWeight: 500 }}>{COURSE.instructor.name}</p>
                <p className="text-white/60 text-xs">{COURSE.instructor.title}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                <span>Your progress</span>
                <span style={{ fontWeight: 600 }}>{COURSE.progress}% complete</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${COURSE.progress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 600 }}>
                <Play className="w-4 h-4 fill-white" />
                Continue Course
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${bookmarked ? 'bg-white text-[#E11D48]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                style={{ fontWeight: 500 }}
                onClick={() => setBookmarked(b => !b)}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-[#E11D48]' : ''}`} />
                {bookmarked ? 'Saved' : 'Bookmark'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white hover:bg-white/30 rounded-lg text-sm transition-colors" style={{ fontWeight: 500 }}>
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Video Player */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            {/* Player Area */}
            <div className="relative bg-[#0F172A]" style={{ aspectRatio: '16/9' }}>
              {/* Top overlay */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-start justify-between z-10">
                <div>
                  <p className="text-white/50 text-xs mb-0.5">Module 2 · Lesson 7</p>
                  <p className="text-white text-sm" style={{ fontWeight: 500 }}>{COURSE.currentLesson}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" onClick={() => setNoteOpen(n => !n)}>
                    <FileText className="w-4 h-4 text-white" />
                  </button>
                  <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" onClick={() => setBookmarked(b => !b)}>
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'text-[#E11D48] fill-[#E11D48]' : 'text-white'}`} />
                  </button>
                </div>
              </div>

              {/* Center play button */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <button className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-105">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </button>
              </div>

              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

              {/* Bottom controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                {/* Scrubber */}
                <div className="mb-3 group cursor-pointer">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
                    <div className="h-full bg-[#E11D48] rounded-full relative" style={{ width: '38%' }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ transform: 'translate(50%, -50%)' }} />
                    </div>
                  </div>
                </div>
                {/* Controls row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="text-white hover:text-white/70 transition-colors">
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                    <button className="text-white hover:text-white/70 transition-colors">
                      <SkipForward className="w-4 h-4" />
                    </button>
                    <button className="text-white hover:text-white/70 transition-colors">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-white/70 text-xs">11:48 / 31:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-white/70 hover:text-white text-xs transition-colors" style={{ fontWeight: 500 }}>1x</button>
                    <button className="text-white hover:text-white/70 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="text-white hover:text-white/70 transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes panel */}
            {noteOpen && (
              <div className="border-t border-[#E5E7EB] p-5">
                <p className="text-sm text-[#111827] mb-2" style={{ fontWeight: 600 }}>Lesson Notes</p>
                <textarea
                  className="w-full h-24 text-sm text-[#374151] border border-[#E5E7EB] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                  placeholder="Add notes for this lesson…"
                />
                <div className="flex justify-end mt-2">
                  <button className="text-xs px-3 py-1.5 bg-[#E11D48] text-white rounded-lg hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>Save Note</button>
                </div>
              </div>
            )}
          </div>

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg text-[#111827]" style={{ fontWeight: 700 }}>Course Curriculum</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">{completedLessons} of {totalLessons} lessons completed</p>
              </div>
              <button
                className="text-sm text-[#E11D48] hover:text-[#BE123C] transition-colors"
                style={{ fontWeight: 500 }}
                onClick={() => setOpenModules(openModules.size ? new Set() : new Set(MODULES.map(m => m.id)))}
              >
                {openModules.size ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            <div className="space-y-3">
              {MODULES.map(module => (
                <ModuleAccordion
                  key={module.id}
                  module={module}
                  isOpen={openModules.has(module.id)}
                  onToggle={() => toggleModule(module.id)}
                />
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7">
            <h2 className="text-lg text-[#111827] mb-5" style={{ fontWeight: 700 }}>Your Instructor</h2>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#1E40AF] flex items-center justify-center text-white flex-shrink-0" style={{ fontWeight: 700, fontSize: 20 }}>
                SC
              </div>
              <div className="flex-1">
                <p className="text-[#111827]" style={{ fontWeight: 600 }}>{COURSE.instructor.name}</p>
                <p className="text-[#6B7280] text-sm mb-3">{COURSE.instructor.title}</p>
                <div className="flex items-center gap-5 text-sm text-[#6B7280] mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span style={{ fontWeight: 500 }}>{COURSE.instructor.rating} rating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{COURSE.instructor.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{COURSE.instructor.courses} courses</span>
                  </div>
                </div>
                <p className="text-sm text-[#6B7280]" style={{ lineHeight: 1.6 }}>
                  Sarah Chen is a Senior Frontend Engineer with over 8 years of experience building large-scale React applications.
                  She has worked at leading tech companies and now dedicates her expertise to teaching modern web development.
                  Her courses focus on real-world patterns and production-ready code.
                </p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg text-[#111827]" style={{ fontWeight: 700 }}>Student Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: 18 }}>{COURSE.rating}</span>
                </div>
                <span className="text-[#6B7280] text-sm">({COURSE.reviews} reviews)</span>
              </div>
            </div>
            <div className="space-y-4">
              {REVIEWS.map(review => (
                <div key={review.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#374151] text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{review.user}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars value={review.rating} />
                            <span className="text-xs text-[#9CA3AF]">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[#6B7280]" style={{ lineHeight: 1.6 }}>{review.text}</p>
                      <button
                        className={`flex items-center gap-1.5 mt-3 text-xs transition-colors ${helpfulSet.has(review.id) ? 'text-[#E11D48]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}
                        style={{ fontWeight: 500 }}
                        onClick={() => setHelpfulSet(prev => { const next = new Set(prev); next.has(review.id) ? next.delete(review.id) : next.add(review.id); return next; })}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${helpfulSet.has(review.id) ? 'fill-[#E11D48]' : ''}`} />
                        Helpful ({review.helpful + (helpfulSet.has(review.id) ? 1 : 0)})
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg text-[#111827]" style={{ fontWeight: 700 }}>Community Q&amp;A</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                <MessageSquare className="w-4 h-4" />
                Ask a Question
              </button>
            </div>
            <div className="space-y-4">
              {QA.map(post => (
                <div key={post.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#374151] text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{post.user}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${post.type === 'question'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'bg-[#F0FDF4] text-[#15803D]'
                          }`} style={{ fontWeight: 500 }}>
                          {post.type === 'question' ? 'Question' : 'Discussion'}
                        </span>
                        <span className="text-xs text-[#9CA3AF]">{post.time}</span>
                      </div>
                      <p className="text-sm text-[#374151]" style={{ lineHeight: 1.6 }}>{post.text}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          className={`flex items-center gap-1.5 text-xs transition-colors ${likedQA.has(post.id) ? 'text-[#E11D48]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}
                          style={{ fontWeight: 500 }}
                          onClick={() => setLikedQA(prev => { const next = new Set(prev); next.has(post.id) ? next.delete(post.id) : next.add(post.id); return next; })}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${likedQA.has(post.id) ? 'fill-[#E11D48]' : ''}`} />
                          {post.likes + (likedQA.has(post.id) ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors" style={{ fontWeight: 500 }}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.replies} {post.replies === 1 ? 'reply' : 'replies'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            <div className="mt-4 bg-[#F8FAFC] border border-dashed border-[#E5E7EB] rounded-2xl p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>Have a question about this course?</p>
              <p className="text-xs text-[#9CA3AF] mt-1 mb-4">Join the community and get answers from your instructor and peers</p>
              <button className="text-xs px-4 py-2 border border-[#E5E7EB] bg-white text-[#374151] rounded-lg hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                Start a Discussion
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-5">
          {/* Progress Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-sm text-[#111827] mb-5" style={{ fontWeight: 700 }}>Your Progress</h3>
            <div className="flex items-center gap-5">
              <CircularProgress value={COURSE.progress} size={96} />
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#9CA3AF]">Completed</p>
                  <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 20 }}>{completedLessons}</p>
                  <p className="text-xs text-[#9CA3AF]">lessons</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Remaining</p>
                  <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 20 }}>{remaining}</p>
                  <p className="text-xs text-[#9CA3AF]">lessons</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>~6h 10m remaining</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]" style={{ fontWeight: 500 }}>On track</span>
              </div>
            </div>
          </div>

          {/* Study Streak */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#111827]" style={{ fontWeight: 700 }}>Study Activity</h3>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm text-[#F59E0B]" style={{ fontWeight: 700 }}>12-day streak</span>
              </div>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 64 }}>
              {WEEKLY_ACTIVITY.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm relative" style={{
                    height: maxMins > 0 ? `${Math.max((d.mins / maxMins) * 48, d.mins > 0 ? 4 : 0)}px` : '0px',
                    backgroundColor: d.mins > 0 ? '#E11D48' : '#F3F4F6',
                    minHeight: d.mins > 0 ? '4px' : '4px',
                  }} />
                </div>
              ))}
            </div>
            <div className="flex items-end gap-1.5 mt-1">
              {WEEKLY_ACTIVITY.map((d) => (
                <div key={d.day} className="flex-1 text-center">
                  <span className="text-[10px] text-[#9CA3AF]">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-sm text-[#111827] mb-4" style={{ fontWeight: 700 }}>Skills You'll Gain</h3>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <span key={skill} className="text-xs px-2.5 py-1 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg" style={{ fontWeight: 500 }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certificate */}
          {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-sm text-[#111827] mb-4" style={{ fontWeight: 700 }}>Certificate</h3>
            <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] p-5 text-center bg-[#FAFAFA]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>Completion Certificate</p>
              <p className="text-xs text-[#9CA3AF] mt-1 mb-4">Complete all lessons to earn your certificate</p>
              <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FCD34D] rounded-full" style={{ width: `${COURSE.progress}%` }} />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2">{COURSE.progress}% complete</p>
            </div>
          </div> */}

          {/* Resources */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-sm text-[#111827] mb-4" style={{ fontWeight: 700 }}>Course Resources</h3>
            <div className="space-y-3">
              {RESOURCES.map(resource => (
                <div key={resource.name} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F3F4F6] cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#6B7280]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#111827]" style={{ fontWeight: 500 }}>{resource.name}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{resource.size}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#E11D48] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="text-sm text-[#111827] mb-4" style={{ fontWeight: 700 }}>Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Zap className="w-5 h-5" />, label: 'First Lesson', color: 'from-[#F59E0B] to-[#EF4444]', unlocked: true },
                { icon: <BarChart2 className="w-5 h-5" />, label: 'Halfway There', color: 'from-[#3B82F6] to-[#7C3AED]', unlocked: true },
                { icon: <Target className="w-5 h-5" />, label: 'Quiz Master', color: 'from-[#10B981] to-[#3B82F6]', unlocked: false },
                { icon: <Award className="w-5 h-5" />, label: 'Graduate', color: 'from-[#F59E0B] to-[#D97706]', unlocked: false },
              ].map((badge) => (
                <div key={badge.label} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${badge.unlocked ? 'bg-[#F8FAFC]' : 'bg-[#F3F4F6] opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${badge.unlocked ? `bg-gradient-to-br ${badge.color}` : 'bg-[#E5E7EB]'}`}>
                    {badge.icon}
                  </div>
                  <p className="text-xs text-[#374151] text-center" style={{ fontWeight: 500 }}>{badge.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications toggle */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFF1F4] flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>Course Alerts</p>
                <p className="text-xs text-[#9CA3AF]">New content & updates</p>
              </div>
            </div>
            <div className="w-10 h-6 bg-[#E11D48] rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

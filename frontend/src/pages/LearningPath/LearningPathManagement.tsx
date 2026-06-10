import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_COURSES } from '../../db/data';
import {
  Search, Download, Eye, Edit2, Trash2, BarChart2,
  ChevronRight, Home, Plus, X, ChevronDown, ArrowUpDown,
  BookOpen, Users, TrendingUp, Clock, PlayCircle,
  Check, Lock, Star, Globe, Image, Inbox,
  Monitor, Database, Palette, Megaphone, Briefcase,
  Settings, Target, Zap, AlertCircle, Archive,
  CheckCircle2, ArrowRight, Radio, ExternalLink
} from 'lucide-react';

/* ─── Types ─── */
type NodeState = 'completed' | 'current' | 'upcoming' | 'locked';

interface RoadmapNode {
  id: number;
  title: string;
  duration: string;
  state: NodeState;
  description: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  courses: number;
  duration: string;
  enrollments: number;
  completionRate: number;
  avgProgress: number;
  thumbBg: string;
  thumbIcon: React.ReactNode;
  accentColor: string;
  rating: number;
  nodes: RoadmapNode[];
  thumbnailUrl?: string;
}

/* ─── Mock data ─── */
const MOCK_PATHS: LearningPath[] = [
  {
    id: 1, title: 'Full-Stack Web Development',
    description: 'Master front-end and back-end technologies to build scalable, production-ready web applications.',
    courses: 8, duration: '64h', enrollments: 1240, completionRate: 78, avgProgress: 65,
    rating: 4.8,
    thumbBg: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
    thumbIcon: <Monitor className="w-6 h-6 text-white/90" />, accentColor: '#2563EB',
    nodes: [
      { id: 1, title: 'HTML & CSS Foundations', duration: '4h', state: 'completed', description: 'Semantic HTML, Flexbox, Grid' },
      { id: 2, title: 'JavaScript Fundamentals', duration: '8h', state: 'completed', description: 'ES6+, async/await, DOM' },
      { id: 3, title: 'React Development', duration: '12h', state: 'current', description: 'Hooks, context, routing' },
      { id: 4, title: 'Node.js & Express', duration: '10h', state: 'upcoming', description: 'REST APIs, middleware' },
      { id: 5, title: 'Database Design', duration: '6h', state: 'upcoming', description: 'SQL, PostgreSQL, ORM' },
      { id: 6, title: 'Auth & Security', duration: '8h', state: 'locked', description: 'JWT, OAuth, HTTPS' },
      { id: 7, title: 'DevOps Basics', duration: '6h', state: 'locked', description: 'Docker, CI/CD pipelines' },
      { id: 8, title: 'Capstone Project', duration: '10h', state: 'locked', description: 'End-to-end app build' },
    ],
  },
  {
    id: 2, title: 'Data Science & ML',
    description: 'From exploratory data analysis to deploying machine learning models in production.',
    courses: 7, duration: '58h', enrollments: 980, completionRate: 62, avgProgress: 51,
    rating: 4.6,
    thumbBg: 'linear-gradient(135deg,#5B21B6,#8B5CF6)',
    thumbIcon: <Database className="w-6 h-6 text-white/90" />, accentColor: '#7C3AED',
    nodes: [
      { id: 1, title: 'Python for Data Science', duration: '6h', state: 'completed', description: 'Pandas, NumPy, Matplotlib' },
      { id: 2, title: 'Statistics & Probability', duration: '8h', state: 'completed', description: 'Distributions, hypothesis testing' },
      { id: 3, title: 'Data Wrangling', duration: '6h', state: 'completed', description: 'Cleaning, transformation' },
      { id: 4, title: 'Machine Learning Core', duration: '14h', state: 'current', description: 'Supervised & unsupervised' },
      { id: 5, title: 'Deep Learning', duration: '12h', state: 'upcoming', description: 'Neural networks, PyTorch' },
      { id: 6, title: 'MLOps & Deployment', duration: '8h', state: 'locked', description: 'Model serving, monitoring' },
      { id: 7, title: 'Capstone Project', duration: '4h', state: 'locked', description: 'End-to-end ML pipeline' },
    ],
  },
  {
    id: 3, title: 'UX Design Mastery',
    description: 'User research, wireframing, prototyping, and delivering polished design systems.',
    courses: 6, duration: '42h', enrollments: 740, completionRate: 91, avgProgress: 84,
    rating: 4.9,
    thumbBg: 'linear-gradient(135deg,#9D174D,#EC4899)',
    thumbIcon: <Palette className="w-6 h-6 text-white/90" />, accentColor: '#DB2777',
    nodes: [
      { id: 1, title: 'Design Thinking', duration: '4h', state: 'completed', description: 'Empathy, ideation, prototyping' },
      { id: 2, title: 'User Research', duration: '6h', state: 'completed', description: 'Interviews, surveys, personas' },
      { id: 3, title: 'Wireframing & IA', duration: '8h', state: 'completed', description: 'Low-fi sketches, sitemaps' },
      { id: 4, title: 'Figma Prototyping', duration: '10h', state: 'completed', description: 'Components, auto-layout' },
      { id: 5, title: 'Usability Testing', duration: '6h', state: 'current', description: 'Test plans, affinity mapping' },
      { id: 6, title: 'Design Systems', duration: '8h', state: 'upcoming', description: 'Tokens, documentation' },
    ],
  },
  {
    id: 4, title: 'Cloud Architecture Pro',
    description: 'Design fault-tolerant, scalable cloud systems on AWS, GCP, and Azure.',
    courses: 7, duration: '56h', enrollments: 0, completionRate: 0, avgProgress: 0,
    rating: 0,
    thumbBg: 'linear-gradient(135deg,#1D4ED8,#6366F1)',
    thumbIcon: <Settings className="w-6 h-6 text-white/90" />, accentColor: '#4F46E5',
    nodes: [
      { id: 1, title: 'Cloud Fundamentals', duration: '6h', state: 'upcoming', description: 'IaaS, PaaS, SaaS overview' },
      { id: 2, title: 'AWS Core Services', duration: '10h', state: 'locked', description: 'EC2, S3, VPC, IAM' },
      { id: 3, title: 'Networking & Security', duration: '8h', state: 'locked', description: 'Load balancers, WAF' },
      { id: 4, title: 'Containerization', duration: '8h', state: 'locked', description: 'Docker, Kubernetes, ECS' },
      { id: 5, title: 'Serverless', duration: '6h', state: 'locked', description: 'Lambda, API Gateway' },
      { id: 6, title: 'Observability', duration: '6h', state: 'locked', description: 'Logs, metrics, traces' },
      { id: 7, title: 'Certification Prep', duration: '12h', state: 'locked', description: 'AWS SAA practice' },
    ],
  },
  {
    id: 5, title: 'Digital Marketing Strategy',
    description: 'Grow brands with data-driven SEO, paid media, and conversion optimization.',
    courses: 5, duration: '36h', enrollments: 0, completionRate: 0, avgProgress: 0,
    rating: 0,
    thumbBg: 'linear-gradient(135deg,#92400E,#F59E0B)',
    thumbIcon: <Megaphone className="w-6 h-6 text-white/90" />, accentColor: '#D97706',
    nodes: [
      { id: 1, title: 'Marketing Fundamentals', duration: '4h', state: 'upcoming', description: 'Funnels, KPIs, personas' },
      { id: 2, title: 'SEO & Content', duration: '8h', state: 'locked', description: 'Keywords, on-page SEO' },
      { id: 3, title: 'Paid Advertising', duration: '10h', state: 'locked', description: 'Google Ads, Meta Ads' },
      { id: 4, title: 'Email Marketing', duration: '6h', state: 'locked', description: 'Campaigns, A/B testing' },
      { id: 5, title: 'Analytics & CRO', duration: '8h', state: 'locked', description: 'GA4, heatmaps, funnels' },
    ],
  },
  {
    id: 6, title: 'Product Management',
    description: 'Lead cross-functional teams from strategy and roadmapping to product launch.',
    courses: 6, duration: '48h', enrollments: 310, completionRate: 44, avgProgress: 38,
    rating: 4.3,
    thumbBg: 'linear-gradient(135deg,#065F46,#10B981)',
    thumbIcon: <Briefcase className="w-6 h-6 text-white/90" />, accentColor: '#059669',
    nodes: [
      { id: 1, title: 'PM Foundations', duration: '6h', state: 'completed', description: 'Role, frameworks, tools' },
      { id: 2, title: 'Product Discovery', duration: '8h', state: 'completed', description: 'User interviews, jobs-to-be-done' },
      { id: 3, title: 'Roadmapping', duration: '6h', state: 'upcoming', description: 'Prioritization, OKRs' },
      { id: 4, title: 'Agile & Scrum', duration: '8h', state: 'locked', description: 'Sprints, ceremonies' },
      { id: 5, title: 'Metrics & Analytics', duration: '6h', state: 'locked', description: 'North Star, AARRR' },
      { id: 6, title: 'Launch & Growth', duration: '14h', state: 'locked', description: 'GTM, feature flags' },
    ],
  },
];

/* ─── Roadmap visualization ─── */
function RoadmapView({ path }: { path: LearningPath }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: path.thumbnailUrl ? 'transparent' : path.thumbBg }}>
            {path.thumbnailUrl ? (
              <img src={path.thumbnailUrl} className="w-full h-full object-cover" />
            ) : (
              path.thumbIcon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#111827] truncate" style={{ fontSize: '14px', fontWeight: 700 }}>{path.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#9CA3AF]">{path.courses} courses · {path.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes */}
      <div className="px-5 py-4 overflow-y-auto flex-1" style={{ maxHeight: 480 }}>
        {path.nodes.map((node, i) => {
          const isLast = i === path.nodes.length - 1;
          const matchedCourse = MOCK_COURSES.find(c => c.title.toLowerCase() === node.title.toLowerCase());

          return (
            <div key={node.id} className="relative flex gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute top-7 bottom-0 w-px bg-gray-200"
                  style={{ left: '12px', height: 'calc(100% - 4px)' }}
                />
              )}

              {/* Step number circle */}
              <div className="flex flex-col items-center gap-0 shrink-0 z-10">
                <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[11px] font-bold text-[#E11D48]">
                  {i + 1}
                </div>
              </div>

              {/* Node card */}
              <div
                onClick={() => {
                  if (matchedCourse) {
                    navigate(`/academic/courses/detail?id=${matchedCourse.courseId}`);
                  }
                }}
                className={`flex-1 mb-3 rounded-xl p-3 border border-[#E5E7EB] bg-white cursor-pointer hover:border-[#E11D48]/30 hover:bg-[#FFF1F3]/5 transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">
                      {node.title}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{node.description}</p>

                    {matchedCourse && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-[#E11D48]" style={{ fontWeight: 500 }}>
                        <span>Go to course</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-[#9CA3AF]" />
                    <span className="text-[10px] text-[#9CA3AF]">{node.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Delete Confirmation Modal ─── */
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] mx-4 p-6 border border-[#E5E7EB] flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-[#EF4444]" />
        </div>
        <h3 className="text-[#111827] text-lg font-bold mb-2">Delete Learning Path</h3>
        <p className="text-[#6B7280] text-sm mb-6">are you sure to delete this learning path</p>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2 bg-[#EF4444] text-white rounded-xl text-sm font-medium hover:bg-[#DC2626] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create Learning Path Modal ─── */
function CreatePathModal({
  onClose,
  initialPath,
  onSave,
  readOnly = false
}: {
  onClose: () => void;
  initialPath?: LearningPath;
  onSave: (data: { title: string; description: string; courses: string[]; thumbnailUrl?: string }) => void;
  readOnly?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState(initialPath ? initialPath.title : '');
  const [description, setDescription] = useState(initialPath ? initialPath.description : '');
  const [addedCourses, setAddedCourses] = useState<string[]>(
    initialPath ? initialPath.nodes.map(n => n.title) : ['React & TypeScript Mastery', 'Node.js Backend']
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialPath?.thumbnailUrl || null);

  const handleFileChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Max size is 2MB.');
      return;
    }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[560px] mx-4 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>
              {readOnly ? 'Learning Path Details' : (initialPath ? 'Edit Learning Path' : 'Create Learning Path')}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {readOnly ? 'View the configuration and course sequence of this learning path.' : 'Define a structured journey and chain courses into a learning path.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Title */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Path Title <span className="text-[#E11D48]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={readOnly}
              placeholder="e.g. Full-Stack Web Development"
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 disabled:bg-[#F8FAFC] disabled:text-[#6B7280] disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Description <span className="text-[#E11D48]">*</span></label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={readOnly}
              placeholder="What will learners achieve by completing this path?"
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 disabled:bg-[#F8FAFC] disabled:text-[#6B7280] disabled:cursor-not-allowed resize-none transition-colors"
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Thumbnail</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {readOnly ? (
              <div className="flex items-center gap-4 p-4 border border-[#E5E7EB] rounded-xl bg-[#F8FAFC]">
                <div
                  className="w-16 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden"
                  style={{ background: thumbnailPreview ? 'transparent' : (initialPath?.thumbBg || 'linear-gradient(135deg,#1E40AF,#3B82F6)') }}
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Path Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    initialPath?.thumbIcon || <Monitor className="w-6 h-6 text-white/90" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#374151]" style={{ fontWeight: 600 }}>Path Icon & Gradient Cover</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">Visually identifies this path across the platform.</p>
                </div>
              </div>
            ) : thumbnailPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB] aspect-[21/9] bg-[#F8FAFC]">
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-[#111827]/70 text-white rounded-lg hover:bg-[#111827]/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); e.dataTransfer.files?.[0] && handleFileChange(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${dragOver ? 'border-[#E11D48] bg-[#FFF1F3]' : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#D1D5DB]'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragOver ? 'bg-[#FECDD3]' : 'bg-white border border-[#E5E7EB]'}`}>
                  <Image className={`w-5 h-5 ${dragOver ? 'text-[#E11D48]' : 'text-[#9CA3AF]'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#374151]" style={{ fontWeight: 500 }}>
                    <span className="text-[#E11D48]">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">PNG, JPG, WEBP — max 2MB, 1280×720</p>
                </div>
              </div>
            )}
          </div>

          {/* Add Courses */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>
              {readOnly ? 'Courses Included in Path' : 'Add Courses'}
            </label>

            {!readOnly && (
              /* Dropdown to select a course */
              <div className="relative mb-2.5">
                <select
                  onChange={e => {
                    const val = e.target.value;
                    if (val && !addedCourses.includes(val)) {
                      setAddedCourses(prev => [...prev, val]);
                    }
                    e.target.value = ''; // Reset select
                  }}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 cursor-pointer"
                >
                  <option value="">-- Select a Course to Add --</option>
                  {MOCK_COURSES.map(course => (
                    <option key={course.courseId} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            )}

            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
              {readOnly ? (
                <div className="flex flex-col divide-y divide-[#F3F4F6]">
                  {addedCourses.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC]">
                      <span className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[11px] font-bold text-[#E11D48]">
                        {i + 1}
                      </span>
                      <BookOpen className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                      <span className="text-xs text-[#374151] font-semibold flex-1 truncate">{c}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium shrink-0">8 hours</span>
                    </div>
                  ))}
                  {addedCourses.length === 0 && (
                    <div className="text-xs text-[#9CA3AF] p-4 text-center">No courses in this path.</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2.5 min-h-[44px] bg-white">
                  {addedCourses.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF1F3] text-[#E11D48] border border-[#FECDD3] rounded-lg text-xs" style={{ fontWeight: 500 }}>
                      <BookOpen className="w-3 h-3" />{c}
                      <button onClick={() => setAddedCourses(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {addedCourses.length === 0 && (
                    <span className="text-xs text-[#9CA3AF] p-1">No courses added yet. Please select courses from the dropdown above.</span>
                  )}
                </div>
              )}
            </div>
            {!readOnly && (
              <p className="text-xs text-[#9CA3AF] mt-1">Drag to reorder after adding courses.</p>
            )}
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
            <span className="text-xs text-[#6B7280]">Preview:</span>
            <span className="text-xs text-[#374151] font-semibold">{addedCourses.length} courses</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-end bg-[#FAFAFA] sticky bottom-0">
          {readOnly ? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Close
            </button>
          ) : (
            <>
              <p className="text-xs text-[#9CA3AF] mr-auto">Fields marked <span className="text-[#E11D48]">*</span> are required</p>
              <div className="flex items-center gap-2.5">
                <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors" style={{ fontWeight: 500 }}>Cancel</button>
                <button
                  onClick={() => {
                    if (!title.trim() || !description.trim()) {
                      alert('Please fill out Path Title and Description.');
                      return;
                    }
                    onSave({ title, description, courses: addedCourses, thumbnailUrl: thumbnailPreview || undefined });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Target className="w-4 h-4" /> {initialPath ? 'Save Changes' : 'Create Path'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function LearningPathManagement() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number>(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [viewingPath, setViewingPath] = useState<LearningPath | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>(MOCK_PATHS);
  const [deletingPathId, setDeletingPathId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return paths.filter(p => {
      return !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [search, paths]);

  // Adjust activePage to be safe (if filtered changes or items are deleted)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, totalPages || 1);

  const paginatedPaths = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, activePage]);

  const selectedPath = paths.find(p => p.id === selectedId) ?? paths[0];

  const stats = useMemo(() => {
    const totalCourses = paths.reduce((s, p) => s + p.courses, 0);
    const totalDurationMins = paths.reduce((s, p) => {
      const hours = parseInt(p.duration, 10) || 0;
      return s + (hours * 60);
    }, 0);
    const avgDurationHours = paths.length > 0
      ? Math.round((totalDurationMins / 60) / paths.length)
      : 0;
    const avgCourses = paths.length > 0
      ? Math.round((totalCourses / paths.length) * 10) / 10
      : 0;

    return {
      total: paths.length,
      totalCourses,
      avgDuration: `${avgDurationHours}h`,
      avgCourses,
    };
  }, [paths]);



  return (
    <>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1376px] mx-auto px-8 py-8">

          {/* ── Page Header ── */}
          <div className="mb-7">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>Learning Path Management</h1>
                <p className="text-[#6B7280] text-sm">Create and manage structured learning journeys that guide learners from start to mastery.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                  <Plus className="w-4 h-4" /> Create Learning Path
                </button>
              </div>
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Learning Paths', value: stats.total, icon: <Target className="w-4 h-4 text-[#6B7280]" />, badge: 'System-wide' },
              { label: 'Total Courses Mapped', value: stats.totalCourses, icon: <BookOpen className="w-4 h-4 text-[#E11D48]" />, badge: 'Across all paths' },
              { label: 'Avg Path Duration', value: stats.avgDuration, icon: <Clock className="w-4 h-4 text-[#16A34A]" />, badge: 'Estimated hours' },
              { label: 'Avg Courses Per Path', value: stats.avgCourses, icon: <TrendingUp className="w-4 h-4 text-[#7C3AED]" />, badge: 'Structure density' },
            ].map((s, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">{s.icon}</div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-[#F8FAFC] text-[#6B7280]" style={{ fontWeight: 500 }}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-[#111827]" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</p>
                <p className="text-[#6B7280] text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left: Path list (7 cols) */}
            <div className="col-span-7 flex flex-col gap-4">

              {/* Toolbar */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search learning paths..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-[#9CA3AF]">{filtered.length} paths</span>
                  {search && (
                    <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="flex items-center gap-1 text-xs text-[#E11D48]" style={{ fontWeight: 500 }}>
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Path cards */}
              <div className="flex flex-col gap-3">
                {paginatedPaths.length === 0 ? (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                      <Inbox className="w-6 h-6 text-[#D1D5DB]" />
                    </div>
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>No learning paths found</p>
                    <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search query.</p>
                    <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs" style={{ fontWeight: 500 }}>
                      Clear search
                    </button>
                  </div>
                ) : (
                  paginatedPaths.map(path => (
                    <div
                      key={path.id}
                      onClick={() => setSelectedId(path.id)}
                      className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${selectedId === path.id
                          ? 'border-[#E11D48] shadow-md shadow-[#E11D48]/5'
                          : 'border-[#E5E7EB] hover:border-gray-300'
                        }`}
                    >
                      {/* Selected Left Highlight Bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${selectedId === path.id ? 'bg-[#E11D48]' : 'bg-transparent group-hover:bg-gray-200'
                          }`}
                      />

                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 overflow-hidden" style={{ background: path.thumbnailUrl ? 'transparent' : path.thumbBg }}>
                          {path.thumbnailUrl ? (
                            <img src={path.thumbnailUrl} className="w-full h-full object-cover" />
                          ) : (
                            path.thumbIcon
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base text-[#111827] font-bold tracking-tight">{path.title}</h3>
                              {selectedId === path.id && (
                                <span className="px-2 py-0.5 bg-[#FFF1F3] text-[#E11D48] border border-[#FECDD3] rounded-full text-[10px] font-bold">SELECTED</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-[#4B5563] mb-3 line-clamp-2 leading-relaxed">{path.description}</p>

                          {/* Stats row with premium colored badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              {path.courses} courses
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              {path.duration}
                            </span>
                          </div>
                        </div>

                        {/* Actions (always visible with lower opacity, fully visible on hover) */}
                        <div className="flex flex-col gap-1.5 self-start shrink-0 ml-auto bg-gray-50 p-1.5 rounded-xl border border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedId(path.id); setViewingPath(path); }}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-blue-600 hover:text-blue-700 transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingPath(path); }}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 hover:text-gray-800 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setDeletingPathId(path.id); }}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-red-500 hover:text-red-700 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border border-[#E5E7EB] bg-white px-5 py-4 rounded-2xl mt-4 shadow-sm">
                  <p className="text-xs text-[#6B7280]">
                    Showing <span className="font-semibold text-[#111827]">{(activePage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-semibold text-[#111827]">
                      {Math.min(activePage * ITEMS_PER_PAGE, filtered.length)}
                    </span>{' '}
                    of <span className="font-semibold text-[#111827]">{filtered.length}</span> paths
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${pageNum === activePage
                            ? 'bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/25'
                            : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right: Roadmap (5 cols) */}
            <div className="col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
              </div>
              <RoadmapView path={selectedPath} />
            </div>
          </div>
        </div>
      </div>

      {(showModal || editingPath || viewingPath) && (
        <CreatePathModal
          initialPath={editingPath || viewingPath || undefined}
          readOnly={!!viewingPath}
          onClose={() => {
            setShowModal(false);
            setEditingPath(null);
            setViewingPath(null);
          }}
          onSave={(savedData) => {
            if (editingPath) {
              setPaths(prev => prev.map(p => p.id === editingPath.id ? {
                ...p,
                title: savedData.title,
                description: savedData.description,
                courses: savedData.courses.length,
                duration: `${savedData.courses.length * 8}h`,
                thumbnailUrl: savedData.thumbnailUrl,
                nodes: savedData.courses.map((c, idx) => {
                  const existingNode = p.nodes.find(n => n.title.toLowerCase() === c.toLowerCase());
                  return {
                    id: idx + 1,
                    title: c,
                    duration: '8h',
                    state: existingNode ? existingNode.state : (idx === 0 ? 'current' : 'upcoming'),
                    description: existingNode ? existingNode.description : `Learn the concepts of ${c}`
                  };
                })
              } : p));
            } else {
              const newId = paths.length > 0 ? Math.max(...paths.map(p => p.id)) + 1 : 1;
              const newPath: LearningPath = {
                id: newId,
                title: savedData.title,
                description: savedData.description,
                courses: savedData.courses.length,
                duration: `${savedData.courses.length * 8}h`,
                enrollments: 0,
                completionRate: 0,
                avgProgress: 0,
                thumbBg: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                thumbIcon: <Monitor className="w-6 h-6 text-white/90" />,
                accentColor: '#2563EB',
                rating: 0,
                thumbnailUrl: savedData.thumbnailUrl,
                nodes: savedData.courses.map((c, idx) => ({
                  id: idx + 1,
                  title: c,
                  duration: '8h',
                  state: idx === 0 ? 'current' : 'upcoming',
                  description: `Learn the concepts of ${c}`
                }))
              };
              setPaths(prev => [...prev, newPath]);
            }
            setShowModal(false);
            setEditingPath(null);
            setViewingPath(null);
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={deletingPathId !== null}
        onClose={() => setDeletingPathId(null)}
        onConfirm={() => {
          if (deletingPathId !== null) {
            setPaths(prev => prev.filter(p => p.id !== deletingPathId));
            if (selectedId === deletingPathId) {
              const remaining = paths.filter(p => p.id !== deletingPathId);
              if (remaining.length > 0) {
                setSelectedId(remaining[0].id);
              }
            }
          }
        }}
      />
    </>
  );
}

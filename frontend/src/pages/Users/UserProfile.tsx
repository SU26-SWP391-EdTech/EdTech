import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MapPin, Mail, Edit3, Share2, BookOpen, GraduationCap, Award,
  Clock, TrendingUp, Zap, Star, CheckCircle2, Lock, Eye,
  Download, ChevronRight, Plus, X, Check, Camera, Target,
  Flame, Trophy, Users, MessageSquare, BarChart2, Calendar,
  ExternalLink, ArrowUpRight, Shield, Bookmark, Briefcase
} from 'lucide-react';

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const INITIAL_PROFILES = {
  learner: {
    name: 'Alex Nguyen',
    email: 'alex.nguyen@email.com',
    bio: 'CS student passionate about full-stack development and data science. Currently building skills in Java, React, and machine learning. Open to collaborative projects.',
    location: 'FPT University, Ho Chi Minh City',
    organization: 'FPT University',
    avatar: '',
    expertise: 'Computer Science',
    experienceYear: '1 year',
    createdAt: 'Jan 12, 2026',
    role: 'Learner',
  },
  provider: {
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@edtech.org',
    bio: 'Professor of Software Engineering with 10+ years of lecturing experience. Specializing in Backend systems, Spring Boot, and Cloud Architecture.',
    location: 'Coursera Partner, Ho Chi Minh City',
    organization: 'Coursera / FPT',
    avatar: '',
    expertise: 'Backend Engineering & Cloud',
    experienceYear: '12 years',
    createdAt: 'Nov 15, 2024',
    role: 'Course Provider',
  },
  admin: {
    name: 'System Administrator',
    email: 'admin@edtech.com',
    bio: 'Platform administrator managing system services, user authentication, security compliance, and platform operations.',
    location: 'EdTech Headquarters',
    organization: 'EdTech Inc.',
    avatar: '',
    expertise: 'System Operations & Security',
    experienceYear: '5 years',
    createdAt: 'Jan 01, 2024',
    role: 'Admin',
  },
  academic: {
    name: 'Robert Chen',
    email: 'r.chen@globalfirm.com',
    bio: 'Academic Curriculum Manager overseeing course quality assurance, learning path alignments, and university accreditations.',
    location: 'Academic Affairs, HCMC',
    organization: 'EdTech Academy',
    avatar: '',
    expertise: 'Curriculum Development & Pedagogy',
    experienceYear: '8 years',
    createdAt: 'Feb 20, 2026',
    role: 'Academic Manager',
  },
};

const WEEKLY_MINS = [25, 70, 45, 90, 60, 110, 40];
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SKILLS = [
  { name: 'Java', level: 80 }, { name: 'Spring Boot', level: 65 },
  { name: 'UI/UX Design', level: 72 }, { name: 'SQL', level: 85 },
  { name: 'Data Analysis', level: 58 }, { name: 'React', level: 70 },
  { name: 'Python', level: 45 }, { name: 'Communication', level: 90 },
];

const ACTIVITY = [
  {
    icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5',
    title: 'Completed a lesson', desc: '"Hooks & State Management"',
    course: 'React Fundamentals', time: '2 hours ago', type: 'lesson',
  },
  {
    icon: Trophy, color: '#F59E0B', bg: '#FFFBEB',
    title: 'Earned a badge', desc: '"Fast Learner" achievement unlocked',
    course: '', time: 'Yesterday', type: 'badge',
  },
  {
    icon: BookOpen, color: '#6366F1', bg: '#F5F3FF',
    title: 'Enrolled in a learning path', desc: '"Java Backend Roadmap"',
    course: 'Java Backend Roadmap', time: '2 days ago', type: 'enroll',
  },
  {
    icon: Star, color: '#E11D48', bg: '#FFF1F2',
    title: 'Submitted a course review', desc: 'Rated 5 stars — excellent content',
    course: 'UI/UX Basics', time: '3 days ago', type: 'review',
  },
  {
    icon: GraduationCap, color: '#7C3AED', bg: '#F5F3FF',
    title: 'Completed a course', desc: 'Certificate earned!',
    course: 'Data Analytics Foundation', time: '5 days ago', type: 'complete',
  },
  {
    icon: MessageSquare, color: '#0EA5E9', bg: '#F0F9FF',
    title: 'Posted a discussion', desc: '"Best practices for React hooks?"',
    course: 'React Fundamentals', time: '6 days ago', type: 'discussion',
  },
];

type AchievState = 'earned' | 'progress' | 'locked';
const ACHIEVEMENTS: { icon: string; name: string; desc: string; state: AchievState; xp: number; pct?: number }[] = [
  { icon: '🎯', name: 'First Step', desc: 'Complete your first lesson', state: 'earned', xp: 50 },
  { icon: '🔥', name: '7-Day Streak', desc: 'Learn 7 days in a row', state: 'earned', xp: 100 },
  { icon: '⚡', name: 'Fast Learner', desc: 'Finish a course in under a week', state: 'earned', xp: 150 },
  { icon: '⭐', name: '5-Star Review', desc: 'Leave your first course review', state: 'earned', xp: 75 },
  { icon: '🏆', name: 'Path Finisher', desc: 'Complete a learning path', state: 'progress', xp: 200, pct: 68 },
  { icon: '👥', name: 'Team Player', desc: 'Join an organization', state: 'progress', xp: 100, pct: 40 },
  { icon: '📚', name: 'Bookworm', desc: 'Complete 10 courses', state: 'locked', xp: 300 },
  { icon: '🎓', name: 'Valedictorian', desc: 'Earn 5 certificates', state: 'locked', xp: 500 },
];

const CERTIFICATES = [
  { title: 'Data Analytics Foundation', path: 'Data Analyst Path', date: 'May 15, 2026', id: 'CERT-2026-DA-004821', color: '#6366F1', bg: '#F5F3FF' },
  { title: 'UI/UX Design Basics', path: 'UI/UX Designer Starter', date: 'Apr 2, 2026', id: 'CERT-2026-UX-003317', color: '#10B981', bg: '#ECFDF5' },
];

const COMPLETED_PATHS = [
  {
    title: 'Frontend Developer Path', pct: 100, date: 'Mar 20, 2026',
    skills: ['React', 'TypeScript', 'CSS', 'Webpack'], color: '#E11D48', bg: 'from-[#E11D48] to-[#7C3AED]',
  },
  {
    title: 'Data Analytics Foundation', pct: 100, date: 'May 15, 2026',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics'], color: '#6366F1', bg: 'from-[#6366F1] to-[#0EA5E9]',
  },
  {
    title: 'Java Backend Roadmap', pct: 72, date: 'In progress',
    skills: ['Java', 'Spring Boot', 'Docker', 'REST APIs'], color: '#F59E0B', bg: 'from-[#F59E0B] to-[#EF4444]',
  },
];

type CourseStatus = 'Completed' | 'In Progress' | 'Not Started';
const COURSE_HISTORY: { name: string; provider: string; status: CourseStatus; pct: number; date: string }[] = [
  { name: 'React Fundamentals', provider: 'FPT University', status: 'In Progress', pct: 68, date: '—' },
  { name: 'UI/UX Design Basics', provider: 'Coursera', status: 'Completed', pct: 100, date: 'Apr 2, 2026' },
  { name: 'Data Analytics Foundation', provider: 'FPT University', status: 'Completed', pct: 100, date: 'May 15, 2026' },
  { name: 'Java Spring Boot', provider: 'Udemy', status: 'In Progress', pct: 45, date: '—' },
  { name: 'SQL Mastery', provider: 'DataCamp', status: 'Not Started', pct: 0, date: '—' },
];

// ─── MINI WEEKLY CHART ────────────────────────────────────────────────────────

function WeeklyChart() {
  const max = Math.max(...WEEKLY_MINS);
  const H = 64, W = 200;
  return (
    <div>
      <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
        {WEEKLY_MINS.map((v, i) => {
          const bw = 20, gap = (W - 7 * bw) / 8;
          const x = gap + i * (bw + gap);
          const bh = (v / max) * H;
          const y = H - bh;
          const isToday = i === 6;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw} height={bh} rx={4}
                fill={isToday ? '#E11D48' : v > 60 ? '#FCA5A5' : '#F3F4F6'} />
              <text x={x + bw / 2} y={H + 14} textAnchor="middle" fill="#9CA3AF" fontSize="9">{WEEK_LABELS[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── STREAK GRID ─────────────────────────────────────────────────────────────

function StreakGrid() {
  const total = 28;
  const activePattern = [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0];
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: activePattern[i] ? '#E11D48' : '#F3F4F6' }}
        />
      ))}
    </div>
  );
}

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  location: string;
  organization: string;
  avatar: string;
  expertise: string;
  experienceYear: string;
  createdAt: string;
  role: string;
}

interface EditProfileModalProps {
  onClose: () => void;
  profile: ProfileData;
  onSave: (updated: {
    name: string;
    avatar: string;
    expertise: string;
    experienceYear: string;
  }) => void;
}

function EditProfileModal({ onClose, profile, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [expertise, setExpertise] = useState(profile.expertise);
  const [experienceYear, setExperienceYear] = useState(profile.experienceYear);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [avatarInputType, setAvatarInputType] = useState<'upload' | 'link'>(
    profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:')) ? 'link' : 'upload'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:')) ? profile.avatar : ''
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setAvatarUrl(url);
    setAvatar(url);
  };

  const resetToInitials = () => {
    setAvatar('');
    setAvatarUrl('');
  };

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onSave({
        name,
        avatar,
        expertise,
        experienceYear,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(onClose, 800);
    }, 1200);
  }

  const isImg = avatar && (avatar.startsWith('http') || avatar.startsWith('data:image'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[540px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3F4F6] sticky top-0 bg-white z-10">
          <div>
            <p className="text-[#111827] text-base" style={{ fontWeight: 600 }}>Edit Profile</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Update your public profile details.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">

          {/* Avatar Section */}
          <div className="flex flex-col gap-2 pb-3 border-b border-[#F3F4F6]">
            <span className="text-xs text-[#111827] font-semibold uppercase tracking-wider" style={{ fontWeight: 600 }}>User Avatar</span>
            <div className="flex items-center gap-4 w-full">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                {isImg ? (
                  <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-[#E11D48]">
                    {name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatarInputType('upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${avatarInputType === 'upload' ? 'bg-[#E11D48] text-white' : 'bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarInputType('link')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${avatarInputType === 'link' ? 'bg-[#E11D48] text-white' : 'bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]'}`}
                  >
                    Image Link
                  </button>
                  {isImg && (
                    <button
                      type="button"
                      onClick={resetToInitials}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FEF2F2] text-[#E11D48] hover:bg-[#FEE2E2] transition-colors ml-auto"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {avatarInputType === 'upload' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-gray-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F3F4F6] file:text-[#111827] hover:file:bg-[#E5E7EB] cursor-pointer"
                  />
                ) : (
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={e => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] focus:outline-none focus:border-[#E11D48]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-[#111827] text-xs font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#111827] hover:bg-white hover:border-[#CBD5E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]/15 focus:border-[#E11D48] transition-all" />
          </div>

          {/* Expertise Field */}
          <div>
            <label className="block text-[#111827] text-xs font-semibold uppercase tracking-wider mb-1.5">Expertise</label>
            <input type="text" value={expertise} onChange={e => setExpertise(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#111827] hover:bg-white hover:border-[#CBD5E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]/15 focus:border-[#E11D48] transition-all" />
          </div>

          {/* Experience Year Field */}
          <div>
            <label className="block text-[#111827] text-xs font-semibold uppercase tracking-wider mb-1.5">Experience Year</label>
            <input type="text" value={experienceYear} onChange={e => setExperienceYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#111827] hover:bg-white hover:border-[#CBD5E1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]/15 focus:border-[#E11D48] transition-all" />
          </div>

          {/* Created At (Read-only) Field */}
          <div>
            <label className="block text-[#111827] text-xs font-semibold uppercase tracking-wider mb-1.5">Created At</label>
            <input type="text" value={profile.createdAt} disabled
              className="w-full px-4 py-2.5 bg-[#F1F5F9] border border-[#E2E8F0] text-[#374151] font-semibold rounded-xl text-sm cursor-not-allowed focus:outline-none" />
            <p className="text-[10px] text-[#4B5563] mt-1">Creation date cannot be modified.</p>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-[#F3F4F6]">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ fontWeight: 500 }}>
              {saving ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</> : saved ? <><Check className="w-4 h-4" />Saved!</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── STATUS PILL ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: CourseStatus }) {
  const cfg: Record<CourseStatus, { bg: string; color: string; dot: string }> = {
    Completed: { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
    'In Progress': { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
    'Not Started': { bg: '#F3F4F6', color: '#4B5563', dot: '#9CA3AF' },
  };
  const s = cfg[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
      style={{ backgroundColor: s.bg, color: s.color, fontWeight: 500 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function UserProfile() {
  const location = useLocation();
  const [showEdit, setShowEdit] = useState(false);
  // const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'certificates'>('overview');

  // Determine role key from pathname
  const path = location.pathname.toLowerCase();
  let roleKey: keyof typeof INITIAL_PROFILES = 'learner';
  if (path.includes('/provider')) {
    roleKey = 'provider';
  } else if (path.includes('/admin')) {
    roleKey = 'admin';
  } else if (path.includes('/academic')) {
    roleKey = 'academic';
  }

  // Profile state initialized from dynamic INITIAL_PROFILES
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILES[roleKey]);

  useEffect(() => {
    setProfile(INITIAL_PROFILES[roleKey]);
  }, [roleKey]);

  const STATS = [
    { label: 'Courses Completed', value: '12', change: '+2 this month', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
    { label: 'Paths Completed', value: '2', change: '1 in progress', icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
    // { label: 'Certificates Earned', value: '2', change: 'Next: Path Finisher', icon: Award, color: '#E11D48', bg: '#FFF1F2' },
    { label: 'Learning Hours', value: '148', change: '+12 this week', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  const xpTotal = 375;
  const xpNext = 500;

  const isImg = profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:image'));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {showEdit && (
        <EditProfileModal
          onClose={() => setShowEdit(false)}
          profile={profile}
          onSave={(updated) => {
            setProfile((prev) => ({
              ...prev,
              ...updated,
            }));
          }}
        />
      )}

      <div className="max-w-[1440px] mx-auto px-8 py-8">

        {/* ── PROFILE HEADER ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden mb-6 shadow-sm">
          {/* Cover */}
          <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 45%, #312E81 75%, #4C1D95 100%)' }}>
            {/* Dot grid overlay */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {/* Glows */}
            <div className="absolute top-4 right-16 w-32 h-32 rounded-full opacity-20" style={{ background: '#E11D48', filter: 'blur(40px)' }} />
            <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full opacity-15" style={{ background: '#6366F1', filter: 'blur(35px)' }} />
          </div>

          <div className="px-8 pb-6">
            <div className="flex items-end justify-between" style={{ marginTop: '-48px' }}>
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#E11D48] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                  {isImg ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: '32px', color: 'white' }}>
                      {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-white" title="Online" />
              </div>
              {/* Actions */}
              <div className="flex items-center gap-3 pb-1">
                <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </button>
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors"
                  style={{ fontWeight: 500 }}>
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-8">
              <div className="flex-1 min-w-0">
                {/* Name & Role */}
                <div className="flex items-center gap-3 mb-2.5">
                  <h1 className="text-[#0F172A]" style={{ fontWeight: 800, fontSize: '26px', lineHeight: 1.2 }}>{profile.name}</h1>
                  <span className="px-3 py-1 bg-[#E11D48] text-white text-[10px] rounded-lg uppercase tracking-wider font-bold shadow-sm">{profile.role}</span>
                </div>

                {/* Email and Location (Contact Details) */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#1E293B] font-medium mb-4">
                  <span className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
                    <Mail className="w-4 h-4 text-[#475569]" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
                    <MapPin className="w-4 h-4 text-[#475569]" />
                    {profile.location}
                  </span>
                </div>

                {/* Professional Badges / Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-[#0369A1]" />
                    Expertise: {profile.expertise}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#047857] text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#047857]" />
                    Experience: {profile.experienceYear}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#475569]" />
                    Joined: {profile.createdAt}
                  </span>
                </div>

                {/* Bio text */}
                <p className="text-[#374151] text-xs max-w-xl mt-3" style={{ lineHeight: 1.7 }}>
                  {profile.bio}
                </p>
              </div>


              {/* Quick stats inline */}
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <Flame className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: '20px' }}>22</span>
                  </div>
                  <p className="text-[#475569] text-xs font-medium">day streak</p>
                </div>
                <div className="w-px h-10 bg-[#E5E7EB]" />
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <Zap className="w-4 h-4 text-[#E11D48]" />
                    <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: '20px' }}>{xpTotal}</span>
                  </div>
                  <p className="text-[#475569] text-xs font-medium">XP points</p>
                </div>
                <div className="w-px h-10 bg-[#E5E7EB]" />
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <Shield className="w-4 h-4 text-[#7C3AED]" />
                    <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: '20px' }}>14</span>
                  </div>
                  <p className="text-[#475569] text-xs font-medium">global rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {STATS.map(({ label, value, change, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="text-[#111827] mb-0.5" style={{ fontWeight: 800, fontSize: '28px', lineHeight: 1 }}>{value}</div>
              <div className="text-[#9CA3AF] text-xs">{label}</div>
              <div className="text-[#6B7280] text-[11px] mt-1" style={{ fontWeight: 500 }}>{change}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN 3-COLUMN GRID ── */}
        <div className="flex gap-5 mb-6">
          {/* LEFT: About + Skills + Goals */}
          <div className="w-[268px] flex-shrink-0 space-y-4">
            {/* About */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[#111827] text-sm mb-3" style={{ fontWeight: 600 }}>About Me</p>
              <p className="text-[#6B7280] text-xs mb-4" style={{ lineHeight: 1.7 }}>
                3rd year CS student at FPT University. I love building full-stack apps and exploring data-driven solutions. Currently diving deep into Spring Boot and React ecosystems.
              </p>
              {/* <div className="space-y-2">
                <p className="text-[#9CA3AF] text-[11px]" style={{ fontWeight: 600 }}>INTERESTS</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Backend Dev', 'UI/UX', 'Data Sci', 'Open Source', 'AI/ML'].map(i => (
                    <span key={i} className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-[11px] rounded-full" style={{ fontWeight: 400 }}>{i}</span>
                  ))}
                </div>
              </div> */}
            </div>

            {/* Skills */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[#111827] text-sm mb-3" style={{ fontWeight: 600 }}>Skills</p>
              <div className="space-y-2.5">
                {SKILLS.map(({ name, level }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#374151] text-xs" style={{ fontWeight: 500 }}>{name}</span>
                      <span className="text-[#9CA3AF] text-[11px]">{level}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${level}%`,
                        backgroundColor: level >= 80 ? '#10B981' : level >= 60 ? '#E11D48' : '#F59E0B'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[#111827] text-sm mb-3" style={{ fontWeight: 600 }}>Learning Goals</p>
              <div className="space-y-3">
                {[
                  { icon: Target, label: 'Weekly Target', value: '5 hrs / week', color: '#6366F1', bg: '#F5F3FF', pct: 64 },
                  { icon: Flame, label: 'Current Streak', value: '22 days 🔥', color: '#F59E0B', bg: '#FFFBEB', pct: 73 },
                  { icon: BarChart2, label: 'Monthly Goal', value: '20 hrs / 30', color: '#10B981', bg: '#ECFDF5', pct: 67 },
                ].map(({ icon: Icon, label, value, color, bg, pct }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[#374151] text-xs" style={{ fontWeight: 500 }}>{label}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{pct}%</p>
                      </div>
                      <p className="text-[#9CA3AF] text-[11px] mb-1.5">{value}</p>
                      <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-[#F9FAFB] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FFF1F2] flex items-center justify-center">
                      <GraduationCap className="w-3.5 h-3.5 text-[#E11D48]" />
                    </div>
                    <div>
                      <p className="text-[#374151] text-xs" style={{ fontWeight: 500 }}>Difficulty</p>
                      <p className="text-[#9CA3AF] text-[11px]">Preferred level</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FFF1F2] text-[#E11D48] text-[11px] rounded-full" style={{ fontWeight: 500 }}>Intermediate</span>
                </div>
              </div>
            </div> */}
          </div>

          {/* MIDDLE: Activity + Chart */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Weekly Activity Chart */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Weekly Activity</p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5">Minutes learned per day</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[#111827] text-base" style={{ fontWeight: 700 }}>7.2 hrs</p>
                    <p className="text-[#9CA3AF] text-[11px]">this week</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#10B981] text-base" style={{ fontWeight: 700 }}>+18%</p>
                    <p className="text-[#9CA3AF] text-[11px]">vs last week</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <WeeklyChart />
                <div className="flex-1">
                  {/* Streak dots */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#111827] text-xs" style={{ fontWeight: 600 }}>22-day streak</p>
                      <span className="flex items-center gap-1 text-[#F59E0B] text-xs" style={{ fontWeight: 600 }}>
                        <Flame className="w-3.5 h-3.5" />On fire!
                      </span>
                    </div>
                    <StreakGrid />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                      <p className="text-[#111827] text-sm" style={{ fontWeight: 700 }}>110</p>
                      <p className="text-[#9CA3AF] text-[10px]">best day (min)</p>
                    </div>
                    <div className="bg-[#FFF1F2] rounded-xl p-3 text-center">
                      <p className="text-[#E11D48] text-sm" style={{ fontWeight: 700 }}>62</p>
                      <p className="text-[#9CA3AF] text-[10px]">avg / day</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Recent Activity</p>
                <button className="text-[#E11D48] text-xs hover:underline" style={{ fontWeight: 500 }}>View all</button>
              </div>
              <div className="relative">
                {/* Connector line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#F3F4F6]" />
                <div className="space-y-4">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: a.bg }}>
                        <a.icon className="w-4 h-4" style={{ color: a.color }} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[#111827] text-xs" style={{ fontWeight: 600 }}>{a.title}</p>
                            <p className="text-[#6B7280] text-xs">{a.desc}</p>
                            {a.course && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#E11D48] mt-0.5" style={{ fontWeight: 500 }}>
                                <BookOpen className="w-3 h-3" />{a.course}
                              </span>
                            )}
                          </div>
                          <span className="text-[#9CA3AF] text-[11px] flex-shrink-0">{a.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed Learning Paths */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[#111827] text-sm mb-4" style={{ fontWeight: 600 }}>Learning Paths</p>
              <div className="space-y-3">
                {COMPLETED_PATHS.map(p => (
                  <div key={p.title} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    {/* Mini banner */}
                    <div className={`h-10 bg-gradient-to-r ${p.bg} relative`}>
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>{p.title}</p>
                        {p.pct === 100
                          ? <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#065F46] text-[11px] rounded-full" style={{ fontWeight: 500 }}>Completed</span>
                          : <span className="px-2 py-0.5 bg-[#FFFBEB] text-[#92400E] text-[11px] rounded-full" style={{ fontWeight: 500 }}>In Progress</span>
                        }
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.pct === 100 ? '#10B981' : p.color }} />
                        </div>
                        <span className="text-[11px] text-[#6B7280]" style={{ fontWeight: 500 }}>{p.pct}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {p.skills.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-[10px] rounded-full">{s}</span>
                          ))}
                          {p.skills.length > 3 && <span className="text-[#9CA3AF] text-[10px]">+{p.skills.length - 3}</span>}
                        </div>
                        <p className="text-[#9CA3AF] text-[11px]">{p.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Achievements + Certificates */}
          {/* <div className="w-[300px] flex-shrink-0 space-y-4">
            XP + Rank
            <div className="bg-gradient-to-br from-[#111827] to-[#1E1B4B] rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[#9CA3AF] text-xs">Total XP</p>
                  <p style={{ fontWeight: 800, fontSize: '28px', lineHeight: 1 }}>{xpTotal}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#9CA3AF] text-xs">Rank</p>
                  <p style={{ fontWeight: 800, fontSize: '28px', lineHeight: 1 }}>#14</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#9CA3AF] text-[11px]">Level 4 → Level 5</span>
                  <span className="text-white text-[11px]" style={{ fontWeight: 600 }}>{xpTotal}/{xpNext} XP</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E11D48] rounded-full" style={{ width: `${(xpTotal / xpNext) * 100}%` }} />
                </div>
              </div>
              <p className="text-[#9CA3AF] text-[11px]">{xpNext - xpTotal} XP to reach Level 5 — <span className="text-white">Path Finisher</span></p>
            </div>

            Achievements
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Achievements</p>
                <span className="text-[#9CA3AF] text-xs">4/8 earned</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {ACHIEVEMENTS.map(({ icon, name, state, pct }) => (
                  <div key={name} className="flex flex-col items-center gap-1" title={name}>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl relative"
                      style={{
                        backgroundColor: state === 'earned' ? '#FFF7ED' : state === 'progress' ? '#FFF1F2' : '#F3F4F6',
                        border: `2px solid ${state === 'earned' ? '#FED7AA' : state === 'progress' ? '#FECDD3' : '#E5E7EB'}`,
                        filter: state === 'locked' ? 'grayscale(1) opacity(0.5)' : 'none',
                      }}
                    >
                      {state === 'locked' ? '🔒' : icon}
                      {state === 'progress' && pct && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center border border-white">
                          <span className="text-white" style={{ fontSize: '7px', fontWeight: 700 }}>{pct}%</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-[#9CA3AF] text-center leading-tight">{name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              In progress badge
              <div className="p-3 bg-[#FFF1F2] rounded-xl border border-[#FECDD3]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">🏆</span>
                  <div>
                    <p className="text-[#9F1239] text-xs" style={{ fontWeight: 600 }}>Next: Path Finisher</p>
                    <p className="text-[#9CA3AF] text-[11px]">Complete 1 learning path</p>
                  </div>
                </div>
                <div className="h-1.5 bg-[#FEE2E2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E11D48] rounded-full" style={{ width: '68%' }} />
                </div>
                <p className="text-[#9CA3AF] text-[11px] mt-1">68% — Java Backend Roadmap in progress</p>
              </div>
            </div>

            Certificates
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Certificates</p>
                <button className="text-[#E11D48] text-xs hover:underline" style={{ fontWeight: 500 }}>View all</button>
              </div>
              <div className="space-y-3">
                {CERTIFICATES.map(cert => (
                  <div key={cert.id} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <div className="h-8 flex items-center px-3 gap-2" style={{ backgroundColor: cert.bg }}>
                      <Award className="w-3.5 h-3.5" style={{ color: cert.color }} />
                      <span className="text-[11px]" style={{ color: cert.color, fontWeight: 600 }}>Certificate of Completion</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[#111827] text-xs mb-0.5" style={{ fontWeight: 600 }}>{cert.title}</p>
                      <p className="text-[#9CA3AF] text-[11px] mb-2">{cert.path} · {cert.date}</p>
                      <p className="text-[#D1D5DB] text-[10px] font-mono mb-2">{cert.id}</p>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-2.5 py-1 bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] rounded-lg text-[11px] hover:bg-[#F3F4F6] transition-colors" style={{ fontWeight: 500 }}>
                          <Download className="w-3 h-3" />Download
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1 bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] rounded-lg text-[11px] hover:bg-[#F3F4F6] transition-colors" style={{ fontWeight: 500 }}>
                          <Share2 className="w-3 h-3" />Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                Empty state
                <div className="border border-dashed border-[#D1D5DB] rounded-xl p-4 flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-2">
                    <Award className="w-4.5 h-4.5 text-[#9CA3AF]" style={{ width: 18, height: 18 }} />
                  </div>
                  <p className="text-[#111827] text-xs mb-1" style={{ fontWeight: 600 }}>No more certificates yet</p>
                  <p className="text-[#9CA3AF] text-[11px] mb-2.5">Complete a course or path to earn your next certificate.</p>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48] text-white rounded-lg text-[11px] hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                    <BookOpen className="w-3 h-3" />Explore Courses
                  </button>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        ── COURSE HISTORY TABLE ──
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
            <div>
              <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Course History</p>
              <p className="text-[#9CA3AF] text-xs mt-0.5">All enrolled and completed courses</p>
            </div>
            <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
              <Download className="w-3.5 h-3.5" />Export
            </button>
          </div>
          Headers
          <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
            {['Course', 'Provider', 'Status', 'Progress', 'Completed', 'Actions'].map(h => (
              <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
            ))}
          </div>
          {COURSE_HISTORY.map((c, i) => (
            <div key={c.name}
              className={`grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group`}
              style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
              <div>
                <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
              </div>
              <p className="text-[#6B7280] text-sm">{c.provider}</p>
              <div><StatusPill status={c.status} /></div>
              <div className="flex items-center gap-2 pr-4">
                <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${c.pct}%`,
                    backgroundColor: c.pct === 100 ? '#10B981' : c.pct > 0 ? '#E11D48' : '#E5E7EB'
                  }} />
                </div>
                <span className="text-[11px] text-[#6B7280] w-8 flex-shrink-0" style={{ fontWeight: 500 }}>{c.pct}%</span>
              </div>
              <p className="text-[#6B7280] text-sm">{c.date}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {c.status === 'Completed' && (
                  <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Certificate">
                    <Award className="w-3.5 h-3.5 text-[#E11D48]" />
                  </button>
                )}
                <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Course">
                  <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                </button>
                <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Bookmark">
                  <Bookmark className="w-3.5 h-3.5 text-[#6B7280]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
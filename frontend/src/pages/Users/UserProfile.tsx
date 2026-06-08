import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.stores';
import { getAcademicProfile, editAcademicProfile, updateUser } from '../../services/user/user.service';
import {
    MapPin, Mail, Edit3, Share2, BookOpen, GraduationCap, Award,
    Clock, Zap, Download, X, Check,
    Flame, Calendar,
    ExternalLink, ArrowUpRight, Shield, Bookmark, Briefcase
} from 'lucide-react';

// ─── DATA ─────────────────────────────────────────────────────────────────────

// type AchievState = 'earned' | 'progress' | 'locked';
// const ACHIEVEMENTS: { icon: string; name: string; desc: string; state: AchievState; xp: number; pct?: number }[] = [
//   { icon: '🎯', name: 'First Step', desc: 'Complete your first lesson', state: 'earned', xp: 50 },
//   { icon: '🔥', name: '7-Day Streak', desc: 'Learn 7 days in a row', state: 'earned', xp: 100 },
//   { icon: '⚡', name: 'Fast Learner', desc: 'Finish a course in under a week', state: 'earned', xp: 150 },
//   { icon: '⭐', name: '5-Star Review', desc: 'Leave your first course review', state: 'earned', xp: 75 },
//   { icon: '🏆', name: 'Path Finisher', desc: 'Complete a learning path', state: 'progress', xp: 200, pct: 68 },
//   { icon: '👥', name: 'Team Player', desc: 'Join an organization', state: 'progress', xp: 100, pct: 40 },
//   { icon: '📚', name: 'Bookworm', desc: 'Complete 10 courses', state: 'locked', xp: 300 },
//   { icon: '🎓', name: 'Valedictorian', desc: 'Earn 5 certificates', state: 'locked', xp: 500 },
// ];

// const CERTIFICATES = [
//   { title: 'Data Analytics Foundation', path: 'Data Analyst Path', date: 'May 15, 2026', id: 'CERT-2026-DA-004821', color: '#6366F1', bg: '#F5F3FF' },
//   { title: 'UI/UX Design Basics', path: 'UI/UX Designer Starter', date: 'Apr 2, 2026', id: 'CERT-2026-UX-003317', color: '#10B981', bg: '#ECFDF5' },
// ];

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
        avatarFile?: File | null;
    }) => Promise<void>;
}

function EditProfileModal({ onClose, profile, onSave }: EditProfileModalProps) {
    const [name, setName] = useState(profile.name);
    const [avatar, setAvatar] = useState(profile.avatar);
    const [expertise, setExpertise] = useState(profile.expertise);
    const [experienceYear, setExperienceYear] = useState(profile.experienceYear);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSave() {
        setSaving(true);
        try {
            await onSave({
                name,
                avatar,
                expertise,
                experienceYear,
                avatarFile: avatarFile,
            });
            setSaved(true);
            setTimeout(onClose, 800);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    }

    const isImg = avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));
    const isAcademic = profile.role === 'Course Provider' || profile.role === 'Academic Manager';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between">
                    <div>
                        <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>
                            Edit Profile
                        </h2>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                            Update your public profile details.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                        <X className="w-4 h-4 text-[#6B7280]" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4 py-2 border-b border-[#F3F4F6] mb-1">
                        <div className="relative">
                            {isImg ? (
                                <img src={avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#E11D48]/20" />
                            ) : (
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold bg-[#E11D48]"
                                >
                                    {avatar || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?')}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="avatar-upload" className="text-xs text-[#E11D48] hover:text-[#BE123C] cursor-pointer font-semibold transition-colors">
                                Upload Photo
                            </label>
                            <p className="text-[10px] text-[#9CA3AF]">JPG, PNG or GIF. Max size 2MB.</p>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Full Name <span className="text-[#E11D48]">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Alexandra Moore"
                            className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Email</label>
                        <input
                            type="text"
                            value={profile.email}
                            disabled
                            className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] rounded-xl text-sm cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-[10px] text-[#9CA3AF] mt-1">Email cannot be modified.</p>
                    </div>

                    {/* Expertise */}
                    {isAcademic && (
                        <div>
                            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Expertise</label>
                            <input
                                type="text"
                                value={expertise}
                                onChange={e => setExpertise(e.target.value)}
                                placeholder="e.g. Backend Engineering & Cloud"
                                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                            />
                        </div>
                    )}

                    {/* Experience Year */}
                    {isAcademic && (
                        <div>
                            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Experience Year</label>
                            <input
                                type="text"
                                value={experienceYear}
                                onChange={e => setExperienceYear(e.target.value)}
                                placeholder="e.g. 5 years"
                                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                            />
                        </div>
                    )}

                    {/* Created At (Read-only) */}
                    <div>
                        <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Created At</label>
                        <input
                            type="text"
                            value={profile.createdAt}
                            disabled
                            className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] rounded-xl text-sm cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-[10px] text-[#9CA3AF] mt-1">Creation date cannot be modified.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
                    <p className="text-xs text-[#9CA3AF]">Fields marked <span className="text-[#E11D48]">*</span> are required</p>
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors disabled:opacity-60"
                            style={{ fontWeight: 500 }}
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : saved ? (
                                <>
                                    <Check className="w-4 h-4" /> Saved!
                                </>
                            ) : (
                                'Save Changes'
                            )}
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

const mapRoleNameToLabel = (roleName?: string): string => {
    if (!roleName) return 'User';
    switch (roleName.toLowerCase()) {
        case 'admin': return 'Admin';
        case 'learner': return 'Learner';
        case 'course provider': return 'Course Provider';
        case 'academic manager': return 'Academic Manager';
        default: return roleName;
    }
};

export function UserProfile() {
    const [showEdit, setShowEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const loggedInUser = useAuthStore((state) => state.user);

    // Profile state
    const [profile, setProfile] = useState<ProfileData>(() => ({
        name: loggedInUser?.fullName || '',
        email: loggedInUser?.email || '',
        bio: '',
        location: '',
        organization: 'EdTech Platform',
        avatar: loggedInUser?.avatarUrl || '',
        expertise: '',
        experienceYear: '',
        createdAt: '',
        role: loggedInUser?.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
    }));

    const fetchProfileData = async () => {
        if (!loggedInUser) return;
        try {
            setLoading(true);
            const res = await getAcademicProfile(loggedInUser.userId);
            setProfile({
                name: res.fullName || loggedInUser.fullName || 'No Name',
                email: res.email || loggedInUser.email,
                bio: 'User bio description not stored on server.',
                location: 'Not set',
                organization: 'EdTech Platform',
                avatar: res.avatarUrl || loggedInUser.avatarUrl || '',
                expertise: res.expertise || 'Not set',
                experienceYear: res.experienceYears !== undefined && res.experienceYears !== null ? `${res.experienceYears} years` : '0 years',
                createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '—',
                role: loggedInUser.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
            });
        } catch (err: any) {
            console.error('Failed to load profile', err);
            // Fallback
            setProfile({
                name: loggedInUser.fullName || 'No Name',
                email: loggedInUser.email,
                bio: 'User bio description not stored on server.',
                location: 'Not set',
                organization: 'EdTech Platform',
                avatar: loggedInUser.avatarUrl || '',
                expertise: 'Not set',
                experienceYear: '0 years',
                createdAt: '—',
                role: mapRoleNameToLabel(loggedInUser.roleName),
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [loggedInUser]);

    const STATS = profile.role === 'Course Provider'
        ? [
            { label: 'Courses Published', value: '4', change: '+1 this month', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
            { label: 'Total Enrolled Students', value: '1,420', change: '+124 this week', icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Average Course Rating', value: '4.8', change: '420 reviews', icon: Award, color: '#E11D48', bg: '#FFF1F2' },
        ]
        : profile.role === 'Academic Manager'
            ? [
                { label: 'Managed Courses', value: '48', change: 'All active', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
                { label: 'Active Providers', value: '14', change: '+2 new providers', icon: Briefcase, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Pending Reviews', value: '3', change: 'Requires action', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
            ]
            : [
                { label: 'Courses Completed', value: '12', change: '+2 this month', icon: BookOpen, color: '#6366F1', bg: '#F5F3FF' },
                { label: 'Paths Completed', value: '2', change: '1 in progress', icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Learning Hours', value: '148', change: '+12 this week', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
            ];

    const xpTotal = 375;
    // const xpNext = 500;

    const isImg = profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:image'));

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E11D48] mb-3"></div>
                <p className="text-sm text-[#6B7280]">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {showEdit && (
                <EditProfileModal
                    onClose={() => setShowEdit(false)}
                    profile={profile}
                    onSave={async (updated) => {
                        if (!loggedInUser) return;
                        const isAcademic =
                            loggedInUser.roleName === 'course provider' ||
                            loggedInUser.roleName === 'academic manager';

                        if (isAcademic) {
                            const formData = new FormData();
                            formData.append('fullName', updated.name);
                            formData.append('expertise', updated.expertise);

                            const yearsMatch = updated.experienceYear.match(/\d+/);
                            const years = yearsMatch ? parseInt(yearsMatch[0], 10) : 0;
                            formData.append('experienceYears', years.toString());

                            if (updated.avatarFile) {
                                formData.append('avatarUrl', updated.avatarFile);
                            } else if (updated.avatar && (updated.avatar.startsWith('http') || updated.avatar.startsWith('data:'))) {
                                formData.append('avatarUrl', updated.avatar);
                            }

                            const res = await editAcademicProfile(loggedInUser.userId, formData);

                            useAuthStore.setState({
                                user: {
                                    ...loggedInUser,
                                    fullName: res.fullName,
                                    avatarUrl: res.avatar,
                                }
                            });
                        } else {
                            const res = await updateUser(loggedInUser.userId, {
                                fullName: updated.name,
                                avatar_url: updated.avatar,
                            });

                            useAuthStore.setState({
                                user: {
                                    ...loggedInUser,
                                    fullName: res.fullName,
                                    avatarUrl: res.avatar,
                                }
                            });
                        }

                        await fetchProfileData();
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
                                {/* <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </button> */}
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
                                    {(profile.role === 'Course Provider' || profile.role === 'Academic Manager') && (
                                        <>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-semibold">
                                                <Briefcase className="w-3.5 h-3.5 text-[#0369A1]" />
                                                Expertise: {profile.expertise}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#047857] text-xs font-semibold">
                                                <Calendar className="w-3.5 h-3.5 text-[#047857]" />
                                                Experience: {profile.experienceYear}
                                            </span>
                                        </>
                                    )}
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
                            {/* <div className="flex items-center gap-5 flex-shrink-0">
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
              </div> */}
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

                {/* ── MAIN 2-COLUMN GRID ── */}
                <div className="flex gap-5 mb-6">
                    {/* LEFT: About */}
                    <div className="w-[268px] flex-shrink-0 space-y-4">
                        {/* About */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                            <p className="text-[#111827] text-sm mb-3" style={{ fontWeight: 600 }}>About Me</p>
                            <p className="text-[#6B7280] text-xs" style={{ lineHeight: 1.7 }}>
                                {profile.role === 'Course Provider'
                                    ? 'Professional educator providing high-quality courses and instructional resources on the EdTech Platform.'
                                    : profile.role === 'Academic Manager'
                                        ? 'Academic program administrator managing curricula, quality assurance, and educational standards on the EdTech Platform.'
                                        : '3rd year CS student at FPT University. I love building full-stack apps and exploring data-driven solutions.'}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Completed Learning Paths */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                            <p className="text-[#111827] text-sm mb-4" style={{ fontWeight: 600 }}>
                                {profile.role === 'Course Provider'
                                    ? 'Teaching Paths'
                                    : profile.role === 'Academic Manager'
                                        ? 'Managed Learning Paths'
                                        : 'Learning Paths'
                                }
                            </p>
                            <div className="space-y-3">
                                {(profile.role === 'Course Provider'
                                    ? [
                                        { title: 'Frontend Developer Path', count: '3 courses', date: 'Active', skills: ['React', 'TypeScript', 'CSS'], color: '#E11D48', bg: 'from-[#E11D48] to-[#7C3AED]' },
                                        { title: 'Java Backend Roadmap', count: '1 course', date: 'Active', skills: ['Java', 'Spring Boot', 'REST APIs'], color: '#F59E0B', bg: 'from-[#F59E0B] to-[#EF4444]' }
                                    ]
                                    : profile.role === 'Academic Manager'
                                        ? [
                                            { title: 'Computer Science Curriculum', count: '15 courses', date: 'Managed', skills: ['Algorithms', 'Databases', 'OS'], color: '#6366F1', bg: 'from-[#6366F1] to-[#0EA5E9]' },
                                            { title: 'Business Analyst Path', count: '8 courses', date: 'Managed', skills: ['Requirements', 'Agile', 'SQL'], color: '#10B981', bg: 'from-[#10B981] to-[#059669]' }
                                        ]
                                        : COMPLETED_PATHS.map(p => ({ ...p, count: undefined }))
                                ).map(p => (
                                    <div key={p.title} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                                        {/* Mini banner */}
                                        <div className={`h-10 bg-gradient-to-r ${p.bg || 'from-slate-500 to-slate-700'} relative`}>
                                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                                        </div>
                                        <div className="px-4 py-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>{p.title}</p>
                                                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#065F46] text-[11px] rounded-full" style={{ fontWeight: 500 }}>
                                                    {p.count ? p.date : (p.pct === 100 ? 'Completed' : 'In Progress')}
                                                </span>
                                            </div>
                                            {p.pct !== undefined && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.pct === 100 ? '#10B981' : p.color }} />
                                                    </div>
                                                    <span className="text-[11px] text-[#6B7280]" style={{ fontWeight: 500 }}>{p.pct}%</span>
                                                </div>
                                            )}
                                            {p.count && (
                                                <p className="text-xs text-[#475569] mb-2 font-medium">{p.count}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-1">
                                                    {p.skills.slice(0, 3).map(s => (
                                                        <span key={s} className="px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] text-[10px] rounded-full">{s}</span>
                                                    ))}
                                                    {p.skills.length > 3 && <span className="text-[#9CA3AF] text-[10px]">+{p.skills.length - 3}</span>}
                                                </div>
                                                <p className="text-[#9CA3AF] text-[11px]">{p.count ? '' : p.date}</p>
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

                {/* ── COURSE HISTORY / PUBLISHED COURSES / CURRICULUM OVERVIEW TABLE ── */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                    {profile.role === 'Course Provider' ? (
                        <>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
                                <div>
                                    <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Published Courses</p>
                                    <p className="text-[#9CA3AF] text-xs mt-0.5">All courses authored by you</p>
                                </div>
                                <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                                    <Download className="w-3.5 h-3.5" />Export
                                </button>
                            </div>
                            <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                                {['Course', 'Category', 'Enrolled Students', 'Rating', 'Status', 'Actions'].map(h => (
                                    <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
                                ))}
                            </div>
                            {[
                                { name: 'React Advanced Frameworks', category: 'Software Development', students: '450 students', rating: '4.9 ⭐', status: 'Active' },
                                { name: 'Spring Boot Microservices', category: 'Backend Development', students: '680 students', rating: '4.8 ⭐', status: 'Active' },
                                { name: 'UI/UX Basics & Design System', category: 'Design', students: '290 students', rating: '4.7 ⭐', status: 'Active' },
                                { name: 'Introduction to Python', category: 'Data Science', students: '0 students', rating: '0.0 ⭐', status: 'Draft' },
                            ].map((c) => (
                                <div key={c.name}
                                    className="grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group"
                                    style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                                    <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
                                    <p className="text-[#6B7280] text-sm">{c.category}</p>
                                    <p className="text-[#6B7280] text-sm">{c.students}</p>
                                    <p className="text-[#6B7280] text-sm">{c.rating}</p>
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.status === 'Active' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#F3F4F6] text-[#4B5563]'}`} style={{ fontWeight: 500 }}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`} />
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Edit Course">
                                            <Edit3 className="w-3.5 h-3.5 text-[#E11D48]" />
                                        </button>
                                        <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Students">
                                            <GraduationCap className="w-3.5 h-3.5 text-[#6B7280]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : profile.role === 'Academic Manager' ? (
                        <>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
                                <div>
                                    <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Curriculum Courses Overview</p>
                                    <p className="text-[#9CA3AF] text-xs mt-0.5">List of active courses under your review and management</p>
                                </div>
                                <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                                    <Download className="w-3.5 h-3.5" />Export
                                </button>
                            </div>
                            <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                                {['Course', 'Provider', 'Category', 'Enrolled', 'Approval Status', 'Actions'].map(h => (
                                    <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
                                ))}
                            </div>
                            {[
                                { name: 'React Advanced Frameworks', provider: 'FPT University', category: 'Software Development', enrolled: '450 enrolled', status: 'Approved' },
                                { name: 'Spring Boot Microservices', provider: 'Coursera', category: 'Backend Development', enrolled: '680 enrolled', status: 'Approved' },
                                { name: 'Advanced Machine Learning', provider: 'Udemy', category: 'Data Science', enrolled: '120 enrolled', status: 'Pending Review' },
                                { name: 'Introduction to Python', provider: 'DataCamp', category: 'Data Science', enrolled: '310 enrolled', status: 'Approved' },
                            ].map((c) => (
                                <div key={c.name}
                                    className="grid px-6 py-4 items-center border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors group"
                                    style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 80px' }}>
                                    <p className="text-[#111827] text-sm" style={{ fontWeight: 500 }}>{c.name}</p>
                                    <p className="text-[#6B7280] text-sm">{c.provider}</p>
                                    <p className="text-[#6B7280] text-sm">{c.category}</p>
                                    <p className="text-[#6B7280] text-sm">{c.enrolled}</p>
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.status === 'Approved' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FFFBEB] text-[#92400E]'}`} style={{ fontWeight: 500 }}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Approved' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="Review Curriculum">
                                            <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                                        </button>
                                        <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors" title="View Course Details">
                                            <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
                                <div>
                                    <p className="text-[#111827] text-sm" style={{ fontWeight: 600 }}>Course History</p>
                                    <p className="text-[#9CA3AF] text-xs mt-0.5">All enrolled and completed courses</p>
                                </div>
                                <button className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                                    <Download className="w-3.5 h-3.5" />Export
                                </button>
                            </div>
                            <div className="grid px-6 py-3 bg-[#F9FAFB] border-b border-[#F3F4F6]" style={{ gridTemplateColumns: '2fr 1.2fr 120px 160px 130px 80px' }}>
                                {['Course', 'Provider', 'Status', 'Progress', 'Completed', 'Actions'].map(h => (
                                    <p key={h} className="text-[#6B7280] text-xs" style={{ fontWeight: 600 }}>{h}</p>
                                ))}
                            </div>
                            {COURSE_HISTORY.map((c) => (
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
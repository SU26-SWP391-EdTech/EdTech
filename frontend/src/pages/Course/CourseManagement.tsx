import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search, Plus, X, ArrowUpDown,
    BookOpen, Users, CheckCircle2, FileText,
    Monitor, Database, Palette, Megaphone, Briefcase,
    Settings, Inbox, Edit2, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.stores';
import { searchCourses, deleteCourse } from '../../services/course.service';
import type { BackendCourse } from '../../services/course.service';
import toast from 'react-hot-toast';

import type { Course, CourseStatus, Category } from '../../components/CourseManagement/types';
import { StatusBadge } from '../../components/CourseManagement/StatusBadge';
import { CategoryBadge } from '../../components/CourseManagement/CategoryBadge';
import { CourseThumbnail } from '../../components/CourseManagement/CourseThumbnail';
import { StarRating } from '../../components/CourseManagement/StarRating';
import { FilterSelect } from '../../components/CourseManagement/FilterSelect';
import { CoursePreviewPanel } from '../../components/CourseManagement/CoursePreviewPanel';
import { CourseModal } from '../../components/CourseManagement/CourseModal';
import { DeleteCourseConfirmModal } from '../../components/CourseManagement/DeleteCourseConfirmModal';

/* ─── Mock data ─── */
export const MOCK_COURSES: Course[] = [
    {
        id: 1, title: 'React & TypeScript Mastery',
        description: 'Build production-ready apps with modern React patterns',
        provider: 'James Wilson', providerInitials: 'JW', providerColor: '#7C3AED',
        category: 'Web Development', status: 'Published',
        students: 1240, rating: 4.8, duration: '14h 20m', lessons: 32, created: 'Jan 15, 2026', updated: 'Jan 16, 2026',
        thumbBg: 'linear-gradient(135deg,#1E40AF,#3B82F6)', thumbIcon: <Monitor className="w-7 h-7 text-white/90" />,
        progress: 82, language: 'English',
    },
    {
        id: 2, title: 'Data Science with Python',
        description: 'From data wrangling to machine learning in Python',
        provider: 'Marcus Davis', providerInitials: 'MD', providerColor: '#0891B2',
        category: 'Data Science', status: 'Published',
        students: 980, rating: 4.6, duration: '18h 45m', lessons: 41, created: 'Jan 28, 2026', updated: 'Jan 28, 2026',
        thumbBg: 'linear-gradient(135deg,#5B21B6,#8B5CF6)', thumbIcon: <Database className="w-7 h-7 text-white/90" />,
        progress: 74, language: 'English',
    },
    {
        id: 3, title: 'UX Design Fundamentals',
        description: 'User research, wireframing, and prototyping essentials',
        provider: 'Priya Nair', providerInitials: 'PN', providerColor: '#DB2777',
        category: 'Design', status: 'Published',
        students: 740, rating: 4.9, duration: '10h 10m', lessons: 24, created: 'Feb 4, 2026', updated: 'Feb 5, 2026',
        thumbBg: 'linear-gradient(135deg,#BE185D,#EC4899)', thumbIcon: <Palette className="w-7 h-7 text-white/90" />,
        progress: 91, language: 'English',
    },
    {
        id: 4, title: 'Advanced SQL & Databases',
        description: 'Query optimization, indexing, and schema design',
        provider: 'Carlos Rivera', providerInitials: 'CR', providerColor: '#9333EA',
        category: 'Data Science', status: 'Draft',
        students: 0, rating: 0, duration: '9h 00m', lessons: 20, created: 'Feb 20, 2026', updated: 'Feb 20, 2026',
        thumbBg: 'linear-gradient(135deg,#0F766E,#14B8A6)', thumbIcon: <Database className="w-7 h-7 text-white/90" />,
        progress: 0, language: 'English',
    },
    {
        id: 5, title: 'Digital Marketing Strategy',
        description: 'SEO, paid ads, and analytics-driven growth tactics',
        provider: 'Lena Park', providerInitials: 'LP', providerColor: '#059669',
        category: 'Marketing', status: 'Pending Review',
        students: 0, rating: 0, duration: '7h 30m', lessons: 18, created: 'Mar 1, 2026', updated: 'Mar 1, 2026',
        thumbBg: 'linear-gradient(135deg,#B45309,#F59E0B)', thumbIcon: <Megaphone className="w-7 h-7 text-white/90" />,
        progress: 0, language: 'English',
    },
    {
        id: 6, title: 'Cloud Architecture on AWS',
        description: 'Design scalable, resilient cloud systems on AWS',
        provider: 'Derek Foster', providerInitials: 'DF', providerColor: '#EA580C',
        category: 'DevOps', status: 'Published',
        students: 620, rating: 4.7, duration: '16h 00m', lessons: 36, created: 'Mar 12, 2026', updated: 'Mar 12, 2026',
        thumbBg: 'linear-gradient(135deg,#1D4ED8,#6366F1)', thumbIcon: <Settings className="w-7 h-7 text-white/90" />,
        progress: 63, language: 'English',
    },
    {
        id: 7, title: 'Product Management 101',
        description: 'Strategy, roadmapping, and stakeholder communication',
        provider: 'Yasmin Al-Hassan', providerInitials: 'YH', providerColor: '#0284C7',
        category: 'Business', status: 'Draft',
        students: 0, rating: 0, duration: '11h 15m', lessons: 26, created: 'Apr 2, 2026', updated: 'Apr 2, 2026',
        thumbBg: 'linear-gradient(135deg,#065F46,#10B981)', thumbIcon: <Briefcase className="w-7 h-7 text-white/90" />,
        progress: 0, language: 'English',
    },
    {
        id: 8, title: 'Node.js Backend Engineering',
        description: 'REST APIs, authentication, and microservices in Node',
        provider: 'James Wilson', providerInitials: 'JW', providerColor: '#7C3AED',
        category: 'Web Development', status: 'Rejected',
        students: 0, rating: 0, duration: '12h 40m', lessons: 28, created: 'Apr 18, 2026', updated: 'Apr 18, 2026',
        thumbBg: 'linear-gradient(135deg,#374151,#6B7280)', thumbIcon: <Monitor className="w-7 h-7 text-white/90" />,
        progress: 0, language: 'English',
    },
    {
        id: 9, title: 'Machine Learning Basics',
        description: 'Supervised & unsupervised learning with scikit-learn',
        provider: 'Marcus Davis', providerInitials: 'MD', providerColor: '#0891B2',
        category: 'Data Science', status: 'Published',
        students: 890, rating: 4.5, duration: '20h 00m', lessons: 44, created: 'May 5, 2026', updated: 'May 6, 2026',
        thumbBg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', thumbIcon: <Database className="w-7 h-7 text-white/90" />,
        progress: 78, language: 'English',
    },
    {
        id: 10, title: 'Figma for Product Teams',
        description: 'Component libraries, auto-layout, and design handoff',
        provider: 'Priya Nair', providerInitials: 'PN', providerColor: '#DB2777',
        category: 'Design', status: 'Pending Review',
        students: 0, rating: 0, duration: '8h 20m', lessons: 19, created: 'May 14, 2026', updated: 'May 14, 2026',
        thumbBg: 'linear-gradient(135deg,#9D174D,#E11D48)', thumbIcon: <Palette className="w-7 h-7 text-white/90" />,
        progress: 0, language: 'English',
    },
];

const CATEGORIES = ['All Categories', 'Web Development', 'Data Science', 'Design', 'Marketing', 'Business', 'DevOps'];
const STATUSES = ['All Status', 'Published', 'Draft', 'Pending Review', 'Rejected'];

const categoryCfg: Record<Category, { cls: string; icon: React.ReactNode }> = {
    'Web Development': { cls: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]', icon: <Monitor className="w-3 h-3" /> },
    'Data Science': { cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]', icon: <Database className="w-3 h-3" /> },
    'Design': { cls: 'bg-[#FFF1F3] text-[#E11D48] border-[#FECDD3]', icon: <Palette className="w-3 h-3" /> },
    'Marketing': { cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]', icon: <Megaphone className="w-3 h-3" /> },
    'Business': { cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', icon: <Briefcase className="w-3 h-3" /> },
    'DevOps': { cls: 'bg-[#F0F9FF] text-[#0891B2] border-[#BAE6FD]', icon: <Settings className="w-3 h-3" /> },
};

export function CourseManagement() {
    const location = useLocation();
    const isProvider = location.pathname.startsWith('/provider');

    const user = useAuthStore((state) => state.user);
    const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [selectedId, setSelectedId] = useState<number>(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | undefined>(undefined);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourseForDelete, setSelectedCourseForDelete] = useState<Course | undefined>(undefined);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [sortField, setSortField] = useState<'title' | 'students' | 'created' | 'updated'>('created');
    const [sortAsc, setSortAsc] = useState(false);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (isProvider && user?.userId) {
                params.userId = user.userId;
            }
            const res = await searchCourses(params);
            const backendCourses = res.data?.items || [];
            const mapped: Course[] = backendCourses.map((item: BackendCourse): Course => {
                const initials = item.user?.fullName ? item.user.fullName.split(' ').map(n => n[0]).join('') : 'U';
                const formattedDuration = item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : '0h';
                const formattedCreated = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const formattedUpdated = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : formattedCreated;

                let statusVal: CourseStatus = 'Draft';
                if (item.status === 'approved') statusVal = 'Published';
                else if (item.status === 'pending') statusVal = 'Pending Review';
                else if (item.status === 'rejected') statusVal = 'Rejected';

                return {
                    id: item.courseId,
                    title: item.title,
                    description: item.description || '',
                    provider: item.user?.fullName || 'Unknown',
                    providerInitials: initials,
                    providerColor: '#7C3AED',
                    category: 'Web Development' as Category,
                    status: statusVal,
                    students: item.enrollmentCount || 0,
                    rating: 0,
                    duration: formattedDuration,
                    lessons: item.totalLessons || 0,
                    created: formattedCreated,
                    updated: formattedUpdated,
                    thumbBg: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                    thumbIcon: <Monitor className="w-7 h-7 text-white/90" />,
                    progress: 0,
                    language: item.language || 'English',
                    thumbnailUrl: item.thumbnailUrl,
                    projectUrl: item.projectUrl,
                };
            });

            const merged = [...mapped];
            MOCK_COURSES.forEach(mock => {
                if (!merged.some(m => m.id === mock.id)) {
                    merged.push(mock);
                }
            });

            setCourses(merged);

            if (mapped.length > 0) {
                setSelectedId(mapped[0].id);
            } else if (MOCK_COURSES.length > 0) {
                setSelectedId(MOCK_COURSES[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [isProvider, user?.userId]);

    const handleDeleteCourse = async () => {
        if (!selectedCourseForDelete) return;
        setDeleteLoading(true);
        try {
            const mockIndex = MOCK_COURSES.findIndex(c => c.id === selectedCourseForDelete.id);
            if (mockIndex !== -1) {
                MOCK_COURSES.splice(mockIndex, 1);
                toast.success('Course deleted successfully');
            } else {
                await deleteCourse(selectedCourseForDelete.id);
                toast.success('Course deleted successfully');
            }
            setShowDeleteModal(false);
            setSelectedCourseForDelete(undefined);
            fetchCourses();
        } catch (err: any) {
            console.error('Failed to delete course:', err);
            toast.error(err.response?.data?.message || 'Failed to delete course');
        } finally {
            setDeleteLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return courses
            .filter(c => {
                const q = search.toLowerCase();
                const matchQ = !q || c.title.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
                const matchCat = categoryFilter === 'All Categories' || c.category === categoryFilter;
                const matchSt = statusFilter === 'All Status' || c.status === statusFilter;
                return matchQ && matchCat && matchSt;
            })
            .sort((a, b) => {
                const dir = sortAsc ? 1 : -1;
                if (sortField === 'students') return (a.students - b.students) * dir;
                if (sortField === 'title') return a.title.localeCompare(b.title) * dir;
                if (sortField === 'created') return (new Date(a.created).getTime() - new Date(b.created).getTime()) * dir;
                if (sortField === 'updated') return (new Date(a.updated).getTime() - new Date(b.updated).getTime()) * dir;
                return (a.id - b.id) * dir;
            });
    }, [courses, search, categoryFilter, statusFilter, sortField, sortAsc]);

    const selectedCourse = courses.find(c => c.id === selectedId) ?? courses[0] ?? MOCK_COURSES[0];

    const stats = {
        total: courses.length,
        published: courses.filter(c => c.status === 'Published').length,
        draft: courses.filter(c => c.status === 'Draft').length,
        enrollments: courses.reduce((s, c) => s + c.students, 0),
    };

    const toggleSort = (field: typeof sortField) => {
        if (sortField === field) setSortAsc(a => !a);
        else { setSortField(field); setSortAsc(false); }
    };

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen">
                <div className="max-w-[1376px] mx-auto px-8 py-8">

                    {/* ── Page Header ── */}
                    <div className="mb-7">
                        <div className="flex items-end justify-between">
                          <div>
                            <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>Course Management</h1>
                            <p className="text-[#6B7280] text-sm">Review, publish, and organize all courses across the platform from one place.</p>
                          </div>
                          <div className="flex items-center gap-2.5">
                            {isProvider && (
                              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                <Plus className="w-4 h-4" /> Create Course
                              </button>
                            )}
                          </div>
                        </div>
                    </div>

                    {/* ── Stats Cards ── */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Courses', value: stats.total, icon: <BookOpen className="w-4 h-4 text-[#6B7280]" />, change: '+2 this month', up: true },
                            { label: 'Published Courses', value: stats.published, icon: <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />, change: `${Math.round((stats.published / stats.total) * 100)}% of total`, up: true },
                            { label: 'Draft / Pending', value: stats.draft + MOCK_COURSES.filter(c => c.status === 'Pending Review').length, icon: <FileText className="w-4 h-4 text-[#D97706]" />, change: 'Awaiting review', up: null },
                            { label: 'Total Enrollments', value: stats.enrollments.toLocaleString(), icon: <Users className="w-4 h-4 text-[#E11D48]" />, change: '+18.4% vs last mo', up: true },
                        ].map((s, idx) => (
                            <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">{s.icon}</div>
                                    <span className={`text-xs px-2 py-1 rounded-lg ${s.up === true ? 'bg-[#F0FDF4] text-[#16A34A]' : s.up === false ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#FFFBEB] text-[#D97706]'}`} style={{ fontWeight: 500 }}>
                                        {s.change}
                                    </span>
                                </div>
                                <p className="text-[#111827]" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</p>
                                <p className="text-[#6B7280] text-sm mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Main Grid ── */}
                    <div className="grid grid-cols-12 gap-5">

                        {/* Left: Table (8 cols) */}
                        <div className="col-span-8 flex flex-col gap-4">

                            {/* Toolbar */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search courses, providers..."
                                        className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                                    />
                                </div>
                                <div className="h-5 w-px bg-[#E5E7EB]" />
                                <FilterSelect value={categoryFilter} options={CATEGORIES} onChange={setCategoryFilter} />
                                <FilterSelect value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
                                <div className="h-5 w-px bg-[#E5E7EB]" />
                                <button onClick={() => toggleSort('students')} className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-colors" style={{ fontWeight: 500 }}>
                                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                                </button>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-xs text-[#9CA3AF] shrink-0">{filtered.length} courses</span>
                                    {(search || categoryFilter !== 'All Categories' || statusFilter !== 'All Status') && (
                                        <button onClick={() => { setSearch(''); setCategoryFilter('All Categories'); setStatusFilter('All Status'); }} className="flex items-center gap-1 text-xs text-[#E11D48]" style={{ fontWeight: 500 }}>
                                            <X className="w-3 h-3" /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-x-auto">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-8 h-8 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mb-3" />
                                        <p className="text-sm text-[#6B7280]">Loading courses...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 text-[#D1D5DB]" />
                                        </div>
                                        <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>No courses found</p>
                                        <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search or filter.</p>
                                        <button onClick={() => { setSearch(''); setCategoryFilter('All Categories'); setStatusFilter('All Status'); }} className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs" style={{ fontWeight: 500 }}>
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <table className="w-full min-w-[800px]">
                                            <thead>
                                                <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '30%' }}>
                                                        <button onClick={() => toggleSort('title')} className="flex items-center gap-1 hover:text-[#111827]">
                                                            Course <ArrowUpDown className="w-3 h-3" />
                                                        </button>
                                                    </th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Provider</th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '14%' }}>Category</th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Status</th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '10%' }}>
                                                        <button onClick={() => toggleSort('students')} className="flex items-center gap-1 hover:text-[#111827]">
                                                            Students <ArrowUpDown className="w-3 h-3" />
                                                        </button>
                                                    </th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>
                                                        <button onClick={() => toggleSort('updated')} className="flex items-center gap-1 hover:text-[#111827]">
                                                            Update At <ArrowUpDown className="w-3 h-3" />
                                                        </button>
                                                    </th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '10%' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((course, i) => (
                                                    <tr
                                                        key={course.id}
                                                        onClick={() => setSelectedId(course.id)}
                                                        className={`group cursor-pointer transition-colors ${i < filtered.length - 1 ? 'border-b border-[#F3F4F6]' : ''} ${selectedId === course.id ? 'bg-[#FFF8F9] border-l-2 border-l-[#E11D48]' : 'hover:bg-[#FAFAFA]'}`}
                                                    >
                                                        {/* Course */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <CourseThumbnail course={course} size="sm" />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 600 }}>{course.title}</p>
                                                                    <p className="text-[10px] text-[#9CA3AF] truncate mt-0.5">{course.description}</p>
                                                                    <div className="flex items-center gap-1.5 mt-1">
                                                                        <StarRating rating={course.rating} />
                                                                        {course.rating > 0 && <span className="text-[#E5E7EB]">·</span>}
                                                                        <span className="text-[10px] text-[#9CA3AF]">{course.lessons} lessons · {course.duration}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Provider */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                                                                    style={{ backgroundColor: course.providerColor, fontSize: '9px', fontWeight: 700 }}>
                                                                    {course.providerInitials}
                                                                </div>
                                                                <span className="text-xs text-[#374151] truncate" style={{ fontWeight: 500 }}>{course.provider.split(' ')[0]}</span>
                                                            </div>
                                                        </td>

                                                        {/* Category */}
                                                        <td className="px-4 py-3">
                                                            <CategoryBadge category={course.category} />
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3">
                                                            <StatusBadge status={course.status} />
                                                        </td>

                                                        {/* Students */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm text-[#374151]" style={{ fontWeight: course.students > 0 ? 600 : 400 }}>
                                                                    {course.students > 0 ? course.students.toLocaleString() : '—'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Update At */}
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs text-[#374151]">{course.updated}</span>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        setSelectedCourseForEdit(course);
                                                                        setIsViewOnly(false);
                                                                        setShowModal(true);
                                                                    }}
                                                                    className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5 text-[#6B7280]" />
                                                                </button>
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        setSelectedCourseForDelete(course);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-[#FCA5A5]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Table footer */}
                                        <div className="px-4 py-3.5 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
                                            <p className="text-xs text-[#6B7280]">
                                                Showing <span className="text-[#111827]" style={{ fontWeight: 500 }}>{filtered.length}</span> of <span className="text-[#111827]" style={{ fontWeight: 500 }}>{MOCK_COURSES.length}</span> courses
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Previous</button>
                                                {[1, 2].map(p => (
                                                    <button key={p} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${p === 1 ? 'bg-[#E11D48] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'}`} style={{ fontWeight: p === 1 ? 600 : 400 }}>{p}</button>
                                                ))}
                                                <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Next</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Preview + Empty State (4 cols) */}
                        <div className="col-span-4 flex flex-col gap-4">

                            {/* Selected label */}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-[#6B7280]" style={{ fontWeight: 500 }}>
                                    COURSE PREVIEW
                                    <span className="ml-1.5 text-[#9CA3AF]">— click any row to change</span>
                                </p>
                            </div>

                            <CoursePreviewPanel
                                course={selectedCourse}
                            />

                            {/* Empty State Card */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                                <p className="text-[10px] text-[#9CA3AF] mb-3 uppercase tracking-wide" style={{ fontWeight: 600 }}>EMPTY STATE</p>
                                <div className="flex flex-col items-center text-center py-3">
                                    <div className="w-12 h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl flex items-center justify-center mb-3">
                                        <Inbox className="w-6 h-6 text-[#D1D5DB]" />
                                    </div>
                                    <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>No courses yet</p>
                                    <p className="text-xs text-[#6B7280] mb-4" style={{ lineHeight: 1.5 }}>
                                        {isProvider
                                            ? "Create your first course and start enrolling learners on the platform."
                                            : "There are no courses currently available on the platform."}
                                    </p>
                                    {isProvider && (
                                        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                            <Plus className="w-3.5 h-3.5" /> Create First Course
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Category distribution */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                                <p className="text-xs text-[#111827] mb-3" style={{ fontWeight: 600 }}>Courses by Category</p>
                                {(Object.keys(categoryCfg) as Category[]).map(cat => {
                                    const count = courses.filter(c => c.category === cat).length;
                                    if (!count) return null;
                                    const cfg = categoryCfg[cat];
                                    return (
                                        <div key={cat} className="flex items-center gap-2 mb-2.5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${cfg.cls} shrink-0 w-28`} style={{ fontWeight: 500 }}>
                                                {cfg.icon} {cat.split(' ')[0]}
                                            </span>
                                            <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-[#E11D48]/60" style={{ width: `${(count / courses.length) * 100}%` }} />
                                            </div>
                                            <span className="text-xs text-[#9CA3AF] w-4 text-right shrink-0">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <CourseModal
                    course={selectedCourseForEdit}
                    isViewOnly={isViewOnly}
                    mockCoursesList={MOCK_COURSES}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedCourseForEdit(undefined);
                        setIsViewOnly(false);
                    }}
                    onSuccess={fetchCourses}
                />
            )}

            {showDeleteModal && selectedCourseForDelete && (
                <DeleteCourseConfirmModal
                    course={selectedCourseForDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedCourseForDelete(undefined);
                    }}
                    onConfirm={handleDeleteCourse}
                    loading={deleteLoading}
                />
            )}

        </>
    );
}

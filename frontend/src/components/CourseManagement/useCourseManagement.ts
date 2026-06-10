import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.stores';
import { searchCourses, deleteCourse, approveCourse, rejectCourse } from '../../services/course.service';
import type { BackendCourse } from '../../services/course.service';
import toast from 'react-hot-toast';
import type { Course, CourseStatus, Category } from './types';
import {
    Monitor, Database, Palette, Megaphone, Briefcase, Settings
} from 'lucide-react';

/* ─── Mock data ─── */
export const MOCK_COURSES: Course[] = [
    {
        id: 1, title: 'React & TypeScript Mastery',
        description: 'Build production-ready apps with modern React patterns',
        provider: 'James Wilson', providerInitials: 'JW', providerColor: '#7C3AED',
        category: 'Web Development', status: 'Published',
        students: 1240, rating: 4.8, duration: '14h 20m', lessons: 32, created: 'Jan 15, 2026', updated: 'Jan 16, 2026',
        thumbBg: 'linear-gradient(135deg,#1E40AF,#3B82F6)', thumbIcon: React.createElement(Monitor, { className: "w-7 h-7 text-white/90" }),
        progress: 82, language: 'English',
    },
    {
        id: 2, title: 'Data Science with Python',
        description: 'From data wrangling to machine learning in Python',
        provider: 'Marcus Davis', providerInitials: 'MD', providerColor: '#0891B2',
        category: 'Data Science', status: 'Published',
        students: 980, rating: 4.6, duration: '18h 45m', lessons: 41, created: 'Jan 28, 2026', updated: 'Jan 28, 2026',
        thumbBg: 'linear-gradient(135deg,#5B21B6,#8B5CF6)', thumbIcon: React.createElement(Database, { className: "w-7 h-7 text-white/90" }),
        progress: 74, language: 'English',
    },
    {
        id: 3, title: 'UX Design Fundamentals',
        description: 'User research, wireframing, and prototyping essentials',
        provider: 'Priya Nair', providerInitials: 'PN', providerColor: '#DB2777',
        category: 'Design', status: 'Published',
        students: 740, rating: 4.9, duration: '10h 10m', lessons: 24, created: 'Feb 4, 2026', updated: 'Feb 5, 2026',
        thumbBg: 'linear-gradient(135deg,#BE185D,#EC4899)', thumbIcon: React.createElement(Palette, { className: "w-7 h-7 text-white/90" }),
        progress: 91, language: 'English',
    },
    {
        id: 4, title: 'Advanced SQL & Databases',
        description: 'Query optimization, indexing, and schema design',
        provider: 'Carlos Rivera', providerInitials: 'CR', providerColor: '#9333EA',
        category: 'Data Science', status: 'Draft',
        students: 0, rating: 0, duration: '9h 00m', lessons: 20, created: 'Feb 20, 2026', updated: 'Feb 20, 2026',
        thumbBg: 'linear-gradient(135deg,#0F766E,#14B8A6)', thumbIcon: React.createElement(Database, { className: "w-7 h-7 text-white/90" }),
        progress: 0, language: 'English',
    },
    {
        id: 5, title: 'Digital Marketing Strategy',
        description: 'SEO, paid ads, and analytics-driven growth tactics',
        provider: 'Lena Park', providerInitials: 'LP', providerColor: '#B45309',
        category: 'Marketing', status: 'Pending Review',
        students: 0, rating: 0, duration: '7h 30m', lessons: 18, created: 'Mar 1, 2026', updated: 'Mar 1, 2026',
        thumbBg: 'linear-gradient(135deg,#B45309,#F59E0B)', thumbIcon: React.createElement(Megaphone, { className: "w-7 h-7 text-white/90" }),
        progress: 0, language: 'English',
    },
    {
        id: 6, title: 'Cloud Architecture on AWS',
        description: 'Design scalable, resilient cloud systems on AWS',
        provider: 'Derek Foster', providerInitials: 'DF', providerColor: '#EA580C',
        category: 'DevOps', status: 'Published',
        students: 620, rating: 4.7, duration: '16h 00m', lessons: 36, created: 'Mar 12, 2026', updated: 'Mar 12, 2026',
        thumbBg: 'linear-gradient(135deg,#1D4ED8,#6366F1)', thumbIcon: React.createElement(Settings, { className: "w-7 h-7 text-white/90" }),
        progress: 63, language: 'English',
    },
    {
        id: 7, title: 'Product Management 101',
        description: 'Strategy, roadmapping, and stakeholder communication',
        provider: 'Yasmin Al-Hassan', providerInitials: 'YH', providerColor: '#0284C7',
        category: 'Business', status: 'Draft',
        students: 0, rating: 0, duration: '11h 15m', lessons: 26, created: 'Apr 2, 2026', updated: 'Apr 2, 2026',
        thumbBg: 'linear-gradient(135deg,#065F46,#10B981)', thumbIcon: React.createElement(Briefcase, { className: "w-7 h-7 text-white/90" }),
        progress: 0, language: 'English',
    },
    {
        id: 8, title: 'Node.js Backend Engineering',
        description: 'REST APIs, authentication, and microservices in Node',
        provider: 'James Wilson', providerInitials: 'JW', providerColor: '#7C3AED',
        category: 'Web Development', status: 'Rejected',
        students: 0, rating: 0, duration: '12h 40m', lessons: 28, created: 'Apr 18, 2026', updated: 'Apr 18, 2026',
        thumbBg: 'linear-gradient(135deg,#374151,#6B7280)', thumbIcon: React.createElement(Monitor, { className: "w-7 h-7 text-white/90" }),
        progress: 0, language: 'English',
    },
    {
        id: 9, title: 'Machine Learning Basics',
        description: 'Supervised & unsupervised learning with scikit-learn',
        provider: 'Marcus Davis', providerInitials: 'MD', providerColor: '#0891B2',
        category: 'Data Science', status: 'Published',
        students: 890, rating: 4.5, duration: '20h 00m', lessons: 44, created: 'May 5, 2026', updated: 'May 6, 2026',
        thumbBg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', thumbIcon: React.createElement(Database, { className: "w-7 h-7 text-white/90" }),
        progress: 78, language: 'English',
    },
    {
        id: 10, title: 'Figma for Product Teams',
        description: 'Component libraries, auto-layout, and design handoff',
        provider: 'Priya Nair', providerInitials: 'PN', providerColor: '#DB2777',
        category: 'Design', status: 'Pending Review',
        students: 0, rating: 0, duration: '8h 20m', lessons: 19, created: 'May 14, 2026', updated: 'May 14, 2026',
        thumbBg: 'linear-gradient(135deg,#9D174D,#E11D48)', thumbIcon: React.createElement(Palette, { className: "w-7 h-7 text-white/90" }),
        progress: 0, language: 'English',
    },
];

export function useCourseManagement() {
    const location = useLocation();
    const navigate = useNavigate();
    const isProvider = location.pathname.startsWith('/provider');
    const isPendingPage = location.pathname.includes('pending-courses');

    const user = useAuthStore((state) => state.user);
    const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(isPendingPage ? 'Pending Review' : 'All Status');
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
                    thumbIcon: null,
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
                const matchSt = isPendingPage ? c.status === 'Pending Review' : (statusFilter === 'All Status' || c.status === statusFilter);
                return matchQ && matchSt;
            })
            .sort((a, b) => {
                const dir = sortAsc ? 1 : -1;
                if (sortField === 'students') return (a.students - b.students) * dir;
                if (sortField === 'title') return a.title.localeCompare(b.title) * dir;
                if (sortField === 'created') return (new Date(a.created).getTime() - new Date(b.created).getTime()) * dir;
                if (sortField === 'updated') return (new Date(a.updated).getTime() - new Date(b.updated).getTime()) * dir;
                return (a.id - b.id) * dir;
            });
    }, [courses, search, statusFilter, sortField, sortAsc]);

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

    const [draggedCourseIndex, setDraggedCourseIndex] = useState<number | null>(null);

    const handleCourseDragOver = (fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx) return;
        const updated = [...courses];
        const fromItem = filtered[fromIdx];
        const toItem = filtered[toIdx];
        const mainFromIdx = courses.findIndex(c => c.id === fromItem.id);
        const mainToIdx = courses.findIndex(c => c.id === toItem.id);
        if (mainFromIdx !== -1 && mainToIdx !== -1) {
            const temp = updated[mainFromIdx];
            updated.splice(mainFromIdx, 1);
            updated.splice(mainToIdx, 0, temp);
            setCourses(updated);
            setDraggedCourseIndex(toIdx);
        }
    };

    const handleApproveCourse = async (courseId: number) => {
        try {
            await approveCourse(courseId);
        } catch (e) {
            console.log('Backend approve failed, updating mock state', e);
        }
        
        // Update MOCK_COURSES in useCourseManagement:
        const mockIndex = MOCK_COURSES.findIndex(c => c.id === courseId);
        if (mockIndex !== -1) {
            MOCK_COURSES[mockIndex].status = 'Published';
        }
        
        // Update MOCK_COURSES in db/data.ts:
        try {
            const { MOCK_COURSES: dbMockCourses } = await import('../../db/data');
            const dbIndex = dbMockCourses.findIndex(c => c.courseId === courseId || c.id === courseId);
            if (dbIndex !== -1) {
                dbMockCourses[dbIndex].status = 'approved' as any;
            }
        } catch (e) {
            console.error(e);
        }
        
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Published' } : c));
        toast.success('Course approved successfully!');
    };

    const handleRejectCourse = async (courseId: number, reason: string) => {
        try {
            await rejectCourse(courseId);
        } catch (e) {
            console.log('Backend reject failed, updating mock state', e);
        }
        
        // Update MOCK_COURSES in useCourseManagement:
        const mockIndex = MOCK_COURSES.findIndex(c => c.id === courseId);
        if (mockIndex !== -1) {
            MOCK_COURSES[mockIndex].status = 'Rejected';
        }
        
        // Update MOCK_COURSES in db/data.ts:
        try {
            const { MOCK_COURSES: dbMockCourses } = await import('../../db/data');
            const dbIndex = dbMockCourses.findIndex(c => c.courseId === courseId || c.id === courseId);
            if (dbIndex !== -1) {
                dbMockCourses[dbIndex].status = 'rejected' as any;
            }
        } catch (e) {
            console.error(e);
        }
        
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Rejected' } : c));
        toast.success('Course rejected successfully!');
    };

    return {
        isProvider,
        navigate,
        courses,
        isLoading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        selectedId,
        setSelectedId,
        showModal,
        setShowModal,
        selectedCourseForEdit,
        setSelectedCourseForEdit,
        isViewOnly,
        setIsViewOnly,
        showDeleteModal,
        setShowDeleteModal,
        selectedCourseForDelete,
        setSelectedCourseForDelete,
        deleteLoading,
        sortField,
        sortAsc,
        fetchCourses,
        handleDeleteCourse,
        filtered,
        selectedCourse,
        stats,
        toggleSort,
        draggedCourseIndex,
        setDraggedCourseIndex,
        handleCourseDragOver,
        isPendingPage,
        handleApproveCourse,
        handleRejectCourse,
    };
}

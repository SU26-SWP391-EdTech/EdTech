import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { searchCourses, deleteCourse, approveCourse, rejectCourse } from '../../services/course/course.service';
import type { BackendCourse } from '../../services/course/course.service';
import toast from 'react-hot-toast';
import type { Course, CourseStatus, Category } from '../../types/course/course-management.types';
import {
    Monitor, Database, Palette, Megaphone, Briefcase, Settings
} from 'lucide-react';

export function useCourseManagement() {
    const location = useLocation();
    const navigate = useNavigate();
    const isProvider = location.pathname.startsWith('/provider');
    const isPendingPage = location.pathname.includes('pending-courses');

    const user = useAuthStore((state) => state.user);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(isPendingPage ? 'Pending Review' : 'All Status');
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
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
            if (isPendingPage) {
                params.status = 'pending';
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
                    slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    level: item.level || 'beginner',
                };
            });

            setCourses(mapped);

            const initialFiltered = mapped.filter(c => {
                if (isPendingPage) return c.status === 'Pending Review';
                return true;
            });
            if (initialFiltered.length > 0) {
                setSelectedId(initialFiltered[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [isProvider, isPendingPage, user?.userId]);

    const handleDeleteCourse = async () => {
        if (!selectedCourseForDelete) return;
        setDeleteLoading(true);
        try {
            await deleteCourse(selectedCourseForDelete.id);
            toast.success('Course deleted successfully');
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

    const selectedCourse = filtered.find(c => c.id === selectedId) ?? filtered[0];

    const stats = {
        total: courses.length,
        published: courses.filter(c => c.status === 'Published').length,
        draft: courses.filter(c => c.status === 'Draft').length,
        pending: courses.filter(c => c.status === 'Pending Review').length,
        enrollments: courses.reduce((s, c) => s + c.students, 0),
    };

    const toggleSort = (field: typeof sortField) => {
        console.log('toggleSort clicked: field =', field, 'current sortField =', sortField, 'current sortAsc =', sortAsc);
        if (sortField === field) {
            setSortAsc(prev => !prev);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
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
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Published' } : c));
            toast.success('Course approved successfully!');
        } catch (e: any) {
            console.error('Failed to approve course:', e);
            toast.error(e.response?.data?.message || 'Failed to approve course');
        }
    };

    const handleRejectCourse = async (courseId: number, reason: string) => {
        try {
            await rejectCourse(courseId, reason);
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'Rejected' } : c));
            toast.success('Course rejected successfully!');
        } catch (e: any) {
            console.error('Failed to reject course:', e);
            toast.error(e.response?.data?.message || 'Failed to reject course');
        }
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

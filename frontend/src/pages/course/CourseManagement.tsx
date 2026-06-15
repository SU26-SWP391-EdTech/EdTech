import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Search, Plus, X, ArrowUpDown,
    BookOpen, Users, CheckCircle2, FileText,
    Monitor, Database, Palette, Megaphone, Briefcase,
    Settings, Edit2, Trash2, GripVertical
} from 'lucide-react';
import { useCourseManagement } from '../../hooks/course/useCourseManagement';

import type { Course, CourseStatus, Category } from '../../types/course/course-management.types';
import { StatusBadge } from '../../components/course/management/StatusBadge';
import { CourseThumbnail } from '../../components/course/management/CourseThumbnail';
import { StarRating } from '../../components/course/management/StarRating';
import { FilterSelect } from '../../components/course/management/FilterSelect';
import { CoursePreviewPanel } from '../../components/course/management/CoursePreviewPanel';
import { CourseModal } from '../../components/course/management/CourseModal';
import { DeleteCourseConfirmModal } from '../../components/course/management/DeleteCourseConfirmModal';



const STATUSES = ['All Status', 'Published', 'Draft', 'Pending Review', 'Rejected'];

export function CourseManagement() {
    const [selectedRejectCourseId, setSelectedRejectCourseId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const {
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
    } = useCourseManagement();

    const [courseDragEnabled, setCourseDragEnabled] = useState(false);

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen">
                <div className="max-w-[1376px] mx-auto px-8 py-8">

                    {/* ── Page Header ── */}
                    <div className="mb-7">
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                                    {isPendingPage ? 'Pending Course Review' : 'Course Management'}
                                </h1>
                                <p className="text-[#6B7280] text-sm">
                                    {isPendingPage ? 'Review, approve, or reject courses awaiting verification.' : 'Review, publish, and organize all courses across the platform from one place.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                {isProvider && (
                                    <button onClick={() => navigate('/provider/courses/create')} className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                        <Plus className="w-4 h-4" /> Create Course
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isPendingPage && (
                        <div className="grid grid-cols-4 gap-4 mb-6 animate-in fade-in duration-200">
                            {[
                                { label: 'Total Courses', value: stats.total, icon: <BookOpen className="w-4 h-4 text-[#6B7280]" />, change: '+2 this month', up: true },
                                { label: 'Published Courses', value: stats.published, icon: <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />, change: `${Math.round((stats.published / stats.total) * 100)}% of total`, up: true },
                                { label: 'Draft / Pending', value: stats.draft + stats.pending, icon: <FileText className="w-4 h-4 text-[#D97706]" />, change: 'Awaiting review', up: null },
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
                    )}


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
                                {!isPendingPage && (
                                    <>
                                        <div className="h-5 w-px bg-[#E5E7EB]" />
                                        <FilterSelect value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
                                    </>
                                )}
                                <div className="h-5 w-px bg-[#E5E7EB]" />
                                <button onClick={() => toggleSort(isPendingPage ? 'created' : 'students')} className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-colors" style={{ fontWeight: 500 }}>
                                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                                </button>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-xs text-[#9CA3AF] shrink-0">{filtered.length} courses</span>
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
                                    </div>
                                ) : (
                                    <>
                                        <table className="w-full min-w-[800px]">
                                            <thead>
                                                <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                                                    <th className="text-left px-2 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '4%' }}></th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '25%' }}>
                                                        <button onClick={() => toggleSort('title')} className="flex items-center gap-1 hover:text-[#111827]">
                                                            Course <ArrowUpDown className="w-3 h-3" />
                                                        </button>
                                                    </th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Provider</th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Status</th>
                                                    {!isPendingPage && (
                                                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>
                                                            <button onClick={() => toggleSort('students')} className="flex items-center gap-1 hover:text-[#111827]">
                                                                Students <ArrowUpDown className="w-3 h-3" />
                                                            </button>
                                                        </th>
                                                    )}
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '15%' }}>
                                                        {isPendingPage ? (
                                                            <button onClick={() => toggleSort('created')} className="flex items-center gap-1 hover:text-[#111827]">
                                                                Created At <ArrowUpDown className="w-3 h-3" />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => toggleSort('updated')} className="flex items-center gap-1 hover:text-[#111827]">
                                                                Update At <ArrowUpDown className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </th>
                                                    <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '10%' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((course, i) => (
                                                    <tr
                                                        key={course.id}
                                                        draggable={courseDragEnabled}
                                                        onDragStart={(e) => {
                                                            setDraggedCourseIndex(i);
                                                            e.dataTransfer.effectAllowed = 'move';
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            if (draggedCourseIndex === null || draggedCourseIndex === i) return;
                                                            handleCourseDragOver(draggedCourseIndex, i);
                                                        }}
                                                        onDragEnd={() => {
                                                            setDraggedCourseIndex(null);
                                                        }}
                                                        onClick={() => setSelectedId(course.id)}
                                                        className={`group cursor-pointer transition-colors ${i < filtered.length - 1 ? 'border-b border-[#F3F4F6]' : ''} ${selectedId === course.id ? 'bg-[#FFF8F9] border-l-2 border-l-[#E11D48]' : 'hover:bg-[#FAFAFA]'} ${draggedCourseIndex === i ? 'opacity-40 bg-[#FAFAFA]' : ''}`}
                                                    >
                                                        {/* Drag Handle */}
                                                        <td className="px-2 py-3 text-center align-middle">
                                                            <GripVertical
                                                                className="w-3.5 h-3.5 text-[#9CA3AF] cursor-grab hover:text-[#E11D48] transition-colors inline-block"
                                                                onMouseEnter={() => setCourseDragEnabled(true)}
                                                                onMouseLeave={() => setCourseDragEnabled(false)}
                                                            />
                                                        </td>
                                                        {/* Course */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <CourseThumbnail course={course} size="sm" />
                                                                <div className="min-w-0 max-w-[200px] sm:max-w-[260px] lg:max-w-[320px]">
                                                                    <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 600 }} title={course.title}>{course.title}</p>
                                                                    <p className="text-[10px] text-[#9CA3AF] truncate mt-0.5" title={course.description}>{course.description}</p>
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
                                                                <span className="text-xs text-[#374151] truncate max-w-[100px]" style={{ fontWeight: 500 }} title={course.provider}>{course.provider.split(' ')[0]}</span>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3">
                                                            <StatusBadge status={course.status} />
                                                        </td>

                                                        {/* Students */}
                                                        {!isPendingPage && (
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-sm text-[#374151]" style={{ fontWeight: course.students > 0 ? 600 : 400 }}>
                                                                        {course.students > 0 ? course.students.toLocaleString() : '—'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {/* Date (Created / Updated) */}
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs text-[#374151]">{isPendingPage ? course.created : course.updated}</span>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-4 py-3">
                                                            {isPendingPage ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            handleApproveCourse(course.id);
                                                                        }}
                                                                        className="p-1.5 hover:bg-[#F0FDF4] rounded-lg transition-colors group/btn"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] transition-transform group-hover/btn:scale-110" />
                                                                    </button>
                                                                    <button
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setSelectedRejectCourseId(course.id);
                                                                            setShowRejectModal(true);
                                                                        }}
                                                                        className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors group/btn"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="w-4 h-4 text-[#EF4444] transition-transform group-hover/btn:scale-110" />
                                                                    </button>
                                                                </div>
                                                            ) : (
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
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Table footer */}
                                        <div className="px-4 py-3.5 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
                                            <p className="text-xs text-[#6B7280]">
                                                Showing <span className="text-[#111827]" style={{ fontWeight: 500 }}>{filtered.length}</span> of <span className="text-[#111827]" style={{ fontWeight: 500 }}>{courses.length}</span> courses
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

                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <CourseModal
                    course={selectedCourseForEdit}
                    isViewOnly={isViewOnly}
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

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedRejectCourseId(null);
                }}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg text-[#111827] mb-2" style={{ fontWeight: 600 }}>Reject Course</h3>
                        <p className="text-sm text-[#6B7280] mb-4">Please provide a reason for rejecting this course. This feedback will be sent to the provider.</p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={4}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-all mb-4"
                            placeholder="Enter rejection reason here..."
                        />
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedRejectCourseId(null);
                                }}
                                className="px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC]"
                                style={{ fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!rejectReason.trim()) {
                                        toast.error('Rejection reason is required.');
                                        return;
                                    }
                                    if (selectedRejectCourseId !== null) {
                                        handleRejectCourse(selectedRejectCourseId, rejectReason.trim());
                                    }
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedRejectCourseId(null);
                                }}
                                className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm hover:bg-[#DC2626]"
                                style={{ fontWeight: 500 }}
                            >
                                Reject Course
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
import React from 'react';
import { GripVertical, Edit2, Trash2, CheckCircle2, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { CourseThumbnail } from './CourseThumbnail';
import { StatusBadge } from './StatusBadge';
import type { Course } from '../../../types/course/course-management.types';

interface CourseTableProps {
    filtered: Course[];
    courses: Course[];
    selectedId: number | undefined;
    setSelectedId: (id: number) => void;
    isLoading: boolean;
    isPendingPage: boolean;
    sortField: 'title' | 'students' | 'created' | 'updated';
    sortAsc: boolean;
    toggleSort: (field: 'title' | 'students' | 'created' | 'updated') => void;
    courseDragEnabled: boolean;
    setCourseDragEnabled: (val: boolean) => void;
    draggedCourseIndex: number | null;
    setDraggedCourseIndex: (val: number | null) => void;
    handleCourseDragOver: (fromIdx: number, toIdx: number) => void;
    handleApproveCourse?: (id: number) => void;
    setSelectedRejectCourseId?: (id: number | null) => void;
    setShowRejectModal?: (val: boolean) => void;
    isProvider: boolean;
    navigate: any;
    setSelectedCourseForEdit: (c: Course | undefined) => void;
    setIsViewOnly: (val: boolean) => void;
    setShowModal: (val: boolean) => void;
    setSelectedCourseForDelete: (c: Course | undefined) => void;
    setShowDeleteModal: (val: boolean) => void;
}

export function CourseTable({
    filtered,
    courses,
    selectedId,
    setSelectedId,
    isLoading,
    isPendingPage,
    sortField,
    sortAsc,
    toggleSort,
    courseDragEnabled,
    setCourseDragEnabled,
    draggedCourseIndex,
    setDraggedCourseIndex,
    handleCourseDragOver,
    handleApproveCourse,
    setSelectedRejectCourseId,
    setShowRejectModal,
    isProvider,
    navigate,
    setSelectedCourseForEdit,
    setIsViewOnly,
    setShowModal,
    setSelectedCourseForDelete,
    setShowDeleteModal,
}: CourseTableProps) {
    const renderSortIcon = (field: 'title' | 'students' | 'created' | 'updated') => {
        if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-[#9CA3AF] opacity-50" />;
        return sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#E11D48] font-bold" /> : <ArrowDown className="w-3.5 h-3.5 text-[#E11D48] font-bold" />;
    };

    if (isLoading) {
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-x-auto">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-[#6B7280]">Loading courses...</p>
                </div>
            </div>
        );
    }

    if (filtered.length === 0) {
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-x-auto">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                        <ArrowUpDown className="w-6 h-6 text-[#D1D5DB]" />
                    </div>
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>No courses found</p>
                    <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search or filter.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                        <th className="text-left px-2 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '4%' }}></th>
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '25%' }}>
                            <button onClick={() => toggleSort('title')} className={`flex items-center gap-1 hover:text-[#111827] ${sortField === 'title' ? 'text-[#111827] font-semibold' : ''}`}>
                                Course {renderSortIcon('title')}
                            </button>
                        </th>
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Provider</th>
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Status</th>
                        {!isPendingPage && (
                            <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>
                                <button onClick={() => toggleSort('students')} className={`flex items-center gap-1 hover:text-[#111827] ${sortField === 'students' ? 'text-[#111827] font-semibold' : ''}`}>
                                    Students {renderSortIcon('students')}
                                </button>
                            </th>
                        )}
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '15%' }}>
                            {isPendingPage ? (
                                <button onClick={() => toggleSort('created')} className={`flex items-center gap-1 hover:text-[#111827] ${sortField === 'created' ? 'text-[#111827] font-semibold' : ''}`}>
                                    Created At {renderSortIcon('created')}
                                </button>
                            ) : (
                                <button onClick={() => toggleSort('updated')} className={`flex items-center gap-1 hover:text-[#111827] ${sortField === 'updated' ? 'text-[#111827] font-semibold' : ''}`}>
                                    Update At {renderSortIcon('updated')}
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
                                                if (handleApproveCourse) handleApproveCourse(course.id);
                                            }}
                                            className="p-1.5 hover:bg-[#F0FDF4] rounded-lg transition-colors group/btn"
                                            title="Approve"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] transition-transform group-hover/btn:scale-110" />
                                        </button>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (setSelectedRejectCourseId) setSelectedRejectCourseId(course.id);
                                                if (setShowRejectModal) setShowRejectModal(true);
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
                                                if (isProvider) {
                                                    navigate(`/provider/courses/create?id=${course.id}`);
                                                } else {
                                                    setSelectedCourseForEdit(course);
                                                    setIsViewOnly(false);
                                                    setShowModal(true);
                                                }
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
        </div>
    );
}

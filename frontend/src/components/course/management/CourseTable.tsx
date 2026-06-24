import React, { useState } from 'react';
import { Trash2, CheckCircle2, X, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseThumbnail } from './CourseThumbnail';
import { StatusBadge } from './StatusBadge';
import type { Course } from '../../../types/course/course-management.types';

const PAGE_SIZE = 5;

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

function formatDuration(raw: string | number | undefined): string {
    if (!raw) return '—';
    // If already formatted like "1h 30m"
    if (typeof raw === 'string' && (raw.includes('h') || raw.includes('m'))) return raw;
    // If number (minutes)
    const minutes = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    if (isNaN(minutes) || minutes <= 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
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
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // Reset to page 1 when filter changes
    React.useEffect(() => {
        setPage(1);
    }, [filtered.length]);

    const renderSortIcon = (field: 'title' | 'students' | 'created' | 'updated') => {
        if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-[#9CA3AF] opacity-50" />;
        return sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#E11D48] font-bold" /> : <ArrowDown className="w-3.5 h-3.5 text-[#E11D48] font-bold" />;
    };

    const renderPageButtons = () => {
        const buttons: React.ReactNode[] = [];
        const maxVisible = 5;
        let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

        for (let p = start; p <= end; p++) {
            buttons.push(
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${p === safePage ? 'bg-[#E11D48] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'}`}
                    style={{ fontWeight: p === safePage ? 600 : 400 }}
                >
                    {p}
                </button>
            );
        }
        return buttons;
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
            <table className="w-full min-w-[700px]">
                <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: isPendingPage ? '28%' : '20%' }}>
                            Course
                        </th>
                        {!isPendingPage && (
                            <>
                                <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Slug</th>
                                <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '10%' }}>Level</th>
                            </>
                        )}
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '13%' }}>Provider</th>
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Status</th>
                        <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '10%' }}>Duration</th>
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
                                    Updated At {renderSortIcon('updated')}
                                </button>
                            )}
                        </th>
                        {isPendingPage && (
                            <th className="text-left px-4 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '10%' }}>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {paginated.map((course, i) => (
                        <tr
                            key={course.id}
                            onClick={() => setSelectedId(course.id)}
                            className={`group cursor-pointer transition-colors ${i < paginated.length - 1 ? 'border-b border-[#F3F4F6]' : ''} ${selectedId === course.id ? 'bg-[#FFF8F9] border-l-2 border-l-[#E11D48]' : 'hover:bg-[#FAFAFA]'}`}
                        >
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

                            {!isPendingPage && (
                                <>
                                    {/* Slug */}
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-[#475569] font-mono bg-[#F1F5F9] px-2 py-0.5 rounded truncate max-w-[120px] inline-block" title={course.slug}>
                                            {course.slug}
                                        </span>
                                    </td>
                                    {/* Level */}
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block capitalize ${
                                            course.level === 'beginner' ? 'bg-[#EFF6FF] text-[#1D4ED8]' :
                                            course.level === 'intermediate' ? 'bg-[#FFF7ED] text-[#C2410C]' :
                                            'bg-[#FAF5FF] text-[#6B21A8]'
                                        }`}>
                                            {course.level}
                                        </span>
                                    </td>
                                </>
                            )}

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

                            {/* Duration */}
                            <td className="px-4 py-3">
                                <span className="text-xs text-[#374151]">{formatDuration(course.duration)}</span>
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
                            {isPendingPage && (
                                <td className="px-4 py-3">
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
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Table footer – real pagination */}
            <div className="px-4 py-3.5 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
                <p className="text-xs text-[#6B7280]">
                    Showing <span className="text-[#111827]" style={{ fontWeight: 500 }}>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</span> of <span className="text-[#111827]" style={{ fontWeight: 500 }}>{filtered.length}</span> courses
                </p>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        <ChevronLeft className="w-3 h-3" /> Previous
                    </button>
                    {renderPageButtons()}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        Next <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

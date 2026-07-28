import React from 'react';
import { Plus } from 'lucide-react';
import { useCourseManagement } from '../../hooks/course/useCourseManagement';

import { CourseStats } from '../../components/course/management/CourseStats';
import { CourseToolbar } from '../../components/course/management/CourseToolbar';
import { CourseTable } from '../../components/course/management/CourseTable';
import { CoursePreviewPanel } from '../../components/course/management/CoursePreviewPanel';

const STATUSES = ['All Status', 'Published', 'Draft', 'Pending Review', 'Rejected'];

export function CourseManagement() {
    const {
        isProvider,
        navigate,
        isLoading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        selectedId,
        setSelectedId,
        filtered,
        selectedCourse,
        stats,
        toggleSort,
        sortField,
        sortAsc,
    } = useCourseManagement();

    return (
        <>
            <div className="bg-[#F8FAFC] min-h-screen">
                <div className="max-w-[1376px] mx-auto px-8 py-8">

                    {/* ── Page Header ── */}
                    <div className="mb-7">
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                                    Course Management
                                </h1>
                                <p className="text-[#6B7280] text-sm">
                                    Review, publish, and organize all courses across the platform from one place.
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

                    <CourseStats stats={stats} />

                    {/* ── Main Grid ── */}
                    <div className="grid grid-cols-12 gap-5">

                        {/* Left: Table (8 cols) */}
                        <div className="col-span-8 flex flex-col gap-4">

                            {/* Toolbar */}
                            <CourseToolbar
                                search={search}
                                setSearch={setSearch}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                sortField={sortField}
                                sortAsc={sortAsc}
                                toggleSort={toggleSort}
                                totalFiltered={filtered.length}
                                isPendingPage={false}
                                statuses={STATUSES}
                            />

                            {/* Table */}
                            <CourseTable
                                filtered={filtered}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                isLoading={isLoading}
                                isPendingPage={false}
                                sortField={sortField}
                                sortAsc={sortAsc}
                                toggleSort={toggleSort}
                                isProvider={isProvider}
                                navigate={navigate}
                            />
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
        </>
    );
}

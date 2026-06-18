import React, { useState } from 'react';
import { useCourseManagement } from '../../hooks/course/useCourseManagement';
import { CourseToolbar } from '../../components/course/management/CourseToolbar';
import { CourseTable } from '../../components/course/management/CourseTable';
import { CoursePreviewPanel } from '../../components/course/management/CoursePreviewPanel';
import { RejectCourseModal } from '../../components/course/management/RejectCourseModal';

export function PendingCourses() {
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
        setSelectedCourseForEdit,
        setIsViewOnly,
        setShowModal,
        setSelectedCourseForDelete,
        setShowDeleteModal,
        filtered,
        selectedCourse,
        toggleSort,
        handleApproveCourse,
        handleRejectCourse,
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
                                    Pending Course Review
                                </h1>
                                <p className="text-[#6B7280] text-sm">
                                    Review, approve, or reject courses awaiting verification.
                                </p>
                            </div>
                        </div>
                    </div>

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
                                isPendingPage={true}
                                statuses={['Pending Review']}
                            />

                            {/* Table */}
                            <CourseTable
                                filtered={filtered}
                                courses={courses}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                isLoading={isLoading}
                                isPendingPage={true}
                                sortField={sortField}
                                sortAsc={sortAsc}
                                toggleSort={toggleSort}
                                handleApproveCourse={handleApproveCourse}
                                setSelectedRejectCourseId={setSelectedRejectCourseId}
                                setShowRejectModal={setShowRejectModal}
                                isProvider={isProvider}
                                navigate={navigate}
                                setSelectedCourseForEdit={setSelectedCourseForEdit}
                                setIsViewOnly={setIsViewOnly}
                                setShowModal={setShowModal}
                                setSelectedCourseForDelete={setSelectedCourseForDelete}
                                setShowDeleteModal={setShowDeleteModal}
                            />
                        </div>

                        {/* Right: Preview + Empty State (4 cols) */}
                        <div className="col-span-4 flex flex-col gap-4">
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

            {showRejectModal && (
                <RejectCourseModal
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                    selectedRejectCourseId={selectedRejectCourseId}
                    setSelectedRejectCourseId={setSelectedRejectCourseId}
                    setShowRejectModal={setShowRejectModal}
                    handleRejectCourse={handleRejectCourse}
                />
            )}
        </>
    );
}

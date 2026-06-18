import React from 'react';
import { Plus } from 'lucide-react';
import { useLearningPath } from '../../hooks/learning-path/useLearningPath';
import { RoadmapView } from '../../components/learning-path/management/RoadmapView';
import { CreatePathModal } from '../../components/learning-path/management/CreatePathModal';
import { DeleteConfirmModal } from '../../components/learning-path/management/DeleteConfirmModal';

import { LearningPathStats } from '../../components/learning-path/management/LearningPathStats';
import { LearningPathToolbar } from '../../components/learning-path/management/LearningPathToolbar';
import { LearningPathList } from '../../components/learning-path/management/LearningPathList';

export function LearningPathManagement() {
  const {
    search,
    setSearch,
    selectedId,
    setSelectedId,
    showModal,
    setShowModal,
    editingPath,
    setEditingPath,
    viewingPath,
    setViewingPath,
    deletingPathId,
    setDeletingPathId,
    loading,
    allCourses,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    totalPages,
    activePage,
    paginatedPaths,
    selectedPath,
    stats,
    handleSavePath,
    handleConfirmDelete,
  } = useLearningPath();

  const clearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#111827] font-semibold">Processing network operation...</p>
          </div>
        </div>
      )}

      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1376px] mx-auto px-8 py-8">

          {/* ── Page Header ── */}
          <div className="mb-7">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[#111827] mb-1 text-3xl font-bold leading-tight">Learning Path Management</h1>
                <p className="text-[#6B7280] text-sm">Create and manage structured learning journeys that guide learners from start to mastery.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" /> Create Learning Path
                </button>
              </div>
            </div>
          </div>

          <LearningPathStats stats={stats} />

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left: Path list (7 cols) */}
            <div className="col-span-7 flex flex-col gap-4">

              <LearningPathToolbar
                search={search}
                setSearch={setSearch}
                setCurrentPage={setCurrentPage}
                totalFiltered={paginatedPaths.length}
                totalPages={totalPages}
                pathsCountMessage={pathsCountMessage}
              />

              <LearningPathList
                paginatedPaths={paginatedPaths}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                setViewingPath={setViewingPath}
                setEditingPath={setEditingPath}
                setDeletingPathId={setDeletingPathId}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                totalPages={totalPages}
                activePage={activePage}
                clearSearch={clearSearch}
              />

            </div>

            {/* Right: Roadmap (5 cols) */}
            <div className="col-span-5 flex flex-col gap-4">
              <RoadmapView path={selectedPath} />
            </div>
          </div>
        </div>
      </div>

      {(showModal || editingPath || viewingPath) && (
        <CreatePathModal
          initialPath={editingPath || viewingPath || undefined}
          readOnly={!!viewingPath}
          allCourses={allCourses}
          onClose={() => {
            setShowModal(false);
            setEditingPath(null);
            setViewingPath(null);
          }}
          onSave={handleSavePath}
        />
      )}

      <DeleteConfirmModal
        isOpen={deletingPathId !== null}
        onClose={() => setDeletingPathId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function pathsCountMessage(length: number, totalPages: number) {
  if (totalPages <= 1) {
    return `${length} paths`;
  }
  return 'multiple pages';
}

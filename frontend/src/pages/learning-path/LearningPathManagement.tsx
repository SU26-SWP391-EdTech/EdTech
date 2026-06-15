import { Search, Eye, Edit2, Trash2, Plus, X, BookOpen, Clock, TrendingUp, Inbox, Target } from 'lucide-react';
import { useLearningPath } from '../../hooks/learning-path/useLearningPath';
import { RoadmapView } from '../../components/learning-path/management/RoadmapView';
import { CreatePathModal } from '../../components/learning-path/management/CreatePathModal';
import { DeleteConfirmModal } from '../../components/learning-path/management/DeleteConfirmModal';

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

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Learning Paths', value: stats.total, icon: <Target className="w-4 h-4 text-[#6B7280]" />, badge: 'System-wide' },
              { label: 'Total Courses Mapped', value: stats.totalCourses, icon: <BookOpen className="w-4 h-4 text-[#E11D48]" />, badge: 'Across all paths' },
              { label: 'Avg Path Duration', value: stats.avgDuration, icon: <Clock className="w-4 h-4 text-[#16A34A]" />, badge: 'Estimated hours' },
              { label: 'Avg Courses Per Path', value: stats.avgCourses, icon: <TrendingUp className="w-4 h-4 text-[#7C3AED]" />, badge: 'Structure density' },
            ].map((s, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">{s.icon}</div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-[#F8FAFC] text-[#6B7280] font-medium">
                    {s.badge}
                  </span>
                </div>
                <p className="text-[#111827] text-2xl font-bold leading-tight">{s.value}</p>
                <p className="text-[#6B7280] text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left: Path list (7 cols) */}
            <div className="col-span-7 flex flex-col gap-4">

              {/* Toolbar */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search learning paths..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-[#9CA3AF]">{pathsCountMessage(paginatedPaths.length, totalPages)}</span>
                  {search && (
                    <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="flex items-center gap-1 text-xs text-[#E11D48] font-medium">
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Path cards */}
              <div className="flex flex-col gap-3">
                {paginatedPaths.length === 0 ? (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                      <Inbox className="w-6 h-6 text-[#D1D5DB]" />
                    </div>
                    <p className="text-sm text-[#111827] font-semibold">No learning paths found</p>
                    <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search query.</p>
                    <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs font-medium">
                      Clear search
                    </button>
                  </div>
                ) : (
                  paginatedPaths.map(path => (
                    <div
                      key={path.id}
                      onClick={() => setSelectedId(path.id)}
                      className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${selectedId === path.id
                        ? 'border-[#E11D48] shadow-md shadow-[#E11D48]/5'
                        : 'border-[#E5E7EB] hover:border-gray-300'
                      }`}
                    >
                      {/* Selected Left Highlight Bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${selectedId === path.id ? 'bg-[#E11D48]' : 'bg-transparent group-hover:bg-gray-200'
                        }`}
                      />

                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 overflow-hidden" style={{ background: path.thumbnailUrl ? 'transparent' : path.thumbBg }}>
                          {path.thumbnailUrl ? (
                            <img src={path.thumbnailUrl} className="w-full h-full object-cover" />
                          ) : (
                            path.thumbIcon
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base text-[#111827] font-bold tracking-tight">{path.title}</h3>
                              {selectedId === path.id && (
                                <span className="px-2 py-0.5 bg-[#FFF1F3] text-[#E11D48] border border-[#FECDD3] rounded-full text-[10px] font-bold">SELECTED</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-[#4B5563] mb-3 line-clamp-2 leading-relaxed">{path.description}</p>

                          {/* Stats row with premium colored badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              {path.courses} courses
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              {path.duration}
                            </span>
                          </div>
                        </div>

                        {/* Actions (always visible with lower opacity, fully visible on hover) */}
                        <div className="flex flex-col gap-1.5 self-start shrink-0 ml-auto bg-gray-50 p-1.5 rounded-xl border border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedId(path.id); setViewingPath(path); }}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-blue-600 hover:text-blue-700 transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingPath(path); }}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 hover:text-gray-800 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setDeletingPathId(path.id); }}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-red-500 hover:text-red-700 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border border-[#E5E7EB] bg-white px-5 py-4 rounded-2xl mt-4 shadow-sm">
                  <p className="text-xs text-[#6B7280]">
                    Showing <span className="font-semibold text-[#111827]">{(activePage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-semibold text-[#111827]">
                      {Math.min(activePage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)}
                    </span>{' '}
                    of <span className="font-semibold text-[#111827]">{totalPages * ITEMS_PER_PAGE}</span> paths
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${pageNum === activePage
                          ? 'bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/25'
                          : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

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

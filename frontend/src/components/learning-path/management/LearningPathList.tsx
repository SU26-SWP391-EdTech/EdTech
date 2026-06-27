import React from 'react';
import { BookOpen, Clock, Edit2, Trash2, Inbox } from 'lucide-react';
import type { LearningPath } from '../../../utils/learning-path/learningPathHelpers';

interface LearningPathListProps {
    paginatedPaths: LearningPath[];
    selectedId: number | null;
    setSelectedId: (id: number | null) => void;
    setViewingPath: (p: LearningPath | null) => void;
    setEditingPath: (p: LearningPath | null) => void;
    setDeletingPathId: (id: number | null) => void;
    currentPage: number;
    setCurrentPage: (val: number | ((prev: number) => number)) => void;
    ITEMS_PER_PAGE: number;
    totalPages: number;
    activePage: number;
    clearSearch: () => void;
}

export function LearningPathList({
    paginatedPaths,
    selectedId,
    setSelectedId,
    setViewingPath,
    setEditingPath,
    setDeletingPathId,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    totalPages,
    activePage,
    clearSearch,
}: LearningPathListProps) {
    if (paginatedPaths.length === 0) {
        return (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-[#D1D5DB]" />
                </div>
                <p className="text-sm text-[#111827] font-semibold">No learning paths found</p>
                <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search query.</p>
                <button onClick={clearSearch} className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs font-medium">
                    Clear search
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {paginatedPaths.map(path => (
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
                        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${selectedId === path.id ? 'bg-[#E11D48]' : 'bg-transparent group-hover:bg-gray-200'}`}
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
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-medium ${
                                    path.level === 'advanced'
                                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                                        : path.level === 'intermediate'
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            : 'bg-green-50 text-green-700 border-green-100'
                                }`}>
                                    {path.level ? path.level.charAt(0).toUpperCase() + path.level.slice(1) : 'Beginner'}
                                </span>
                                {path.slug && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-lg text-[11px] font-mono">
                                        /{path.slug}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5 self-start shrink-0 ml-auto bg-gray-50 p-1.5 rounded-xl border border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
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
            ))}

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
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(typeof prev === 'number' ? prev - 1 : 1, 1))}
                            disabled={activePage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                            Previous
                        </button>

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

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(typeof prev === 'number' ? prev + 1 : totalPages, totalPages))}
                            disabled={activePage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

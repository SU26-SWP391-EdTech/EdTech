import React from 'react';
import { Search, X } from 'lucide-react';

interface LearningPathToolbarProps {
    search: string;
    setSearch: (val: string) => void;
    setCurrentPage: (val: number) => void;
    totalFiltered: number;
    totalPages: number;
    pathsCountMessage: (length: number, totalPages: number) => string;
}

export function LearningPathToolbar({
    search,
    setSearch,
    setCurrentPage,
    totalFiltered,
    totalPages,
    pathsCountMessage,
}: LearningPathToolbarProps) {
    return (
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
                <span className="text-xs text-[#9CA3AF]">{pathsCountMessage(totalFiltered, totalPages)}</span>
                {search && (
                    <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="flex items-center gap-1 text-xs text-[#E11D48] font-medium">
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>
        </div>
    );
}

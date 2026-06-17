import React from 'react';
import { Search } from 'lucide-react';
import { FilterSelect } from './FilterSelect';

interface CourseToolbarProps {
    search: string;
    setSearch: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    sortField: 'title' | 'students' | 'created' | 'updated';
    sortAsc: boolean;
    toggleSort: (field: 'title' | 'students' | 'created' | 'updated') => void;
    totalFiltered: number;
    isPendingPage: boolean;
    statuses: string[];
}

export function CourseToolbar({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    totalFiltered,
    isPendingPage,
    statuses,
}: CourseToolbarProps) {
    return (
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
                    <FilterSelect value={statusFilter} options={statuses} onChange={setStatusFilter} />
                </>
            )}
            <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-[#9CA3AF] shrink-0">{totalFiltered} courses</span>
            </div>
        </div>
    );
}

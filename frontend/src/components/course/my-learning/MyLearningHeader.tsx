import { Search } from 'lucide-react';
import type { MyLearningStats } from '../../../types/learner/my-learning.types';

interface MyLearningHeaderProps {
    stats: MyLearningStats;
    search: string;
    onSearchChange: (value: string) => void;
}

export function MyLearningHeader({ search, onSearchChange }: MyLearningHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <h1 className="text-[24px] font-bold text-[#111827] tracking-[-0.01em]">My Learning</h1>
            </div>

            <div className="flex w-full items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 md:w-[280px]">
                <Search className="h-4 w-4 text-[#9CA3AF]" />
                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search your courses..."
                    className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
                />
            </div>
        </div>
    );
}

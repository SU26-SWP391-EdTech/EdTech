import type { MyLearningStats, MyLearningTab } from '../../../types/learner/my-learning.types';

interface MyLearningTabsProps {
    activeTab: MyLearningTab;
    stats: MyLearningStats;
    onTabChange: (tab: MyLearningTab) => void;
}

export function MyLearningTabs({ activeTab, stats, onTabChange }: MyLearningTabsProps) {
    const tabs: { value: MyLearningTab; label: string }[] = [
        { value: 'all', label: `All (${stats.enrolled})` },
        { value: 'in-progress', label: `In Progress (${stats.inProgress})` },
        { value: 'completed', label: `Completed (${stats.completed})` },
    ];

    return (
        <div className="mb-5 flex w-fit gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1">
            {tabs.map(tab => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === tab.value
                            ? 'bg-[#E11D48] text-white'
                            : 'text-[#6B7280] hover:bg-[#F8FAFC]'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

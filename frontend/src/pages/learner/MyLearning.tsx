import { MyLearningCourseList } from '../../components/course/my-learning/MyLearningCourseList';
import { MyLearningHeader } from '../../components/course/my-learning/MyLearningHeader';
import { MyLearningStats } from '../../components/course/my-learning/MyLearningStats';
import { MyLearningTabs } from '../../components/course/my-learning/MyLearningTabs';
import { useMyLearning } from '../../hooks/learner/useMyLearning';

export function MyLearning() {
    const myLearning = useMyLearning();

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="mx-auto max-w-[1440px] px-6 py-8">
                <MyLearningHeader
                    stats={myLearning.stats}
                    search={myLearning.search}
                    onSearchChange={myLearning.setSearch}
                />
                <MyLearningStats stats={myLearning.stats} />
                <MyLearningTabs
                    activeTab={myLearning.tab}
                    stats={myLearning.stats}
                    onTabChange={myLearning.setTab}
                />
                <MyLearningCourseList
                    courses={myLearning.filteredCourses}
                    isLoading={myLearning.isLoading}
                    onOpenCourse={myLearning.openCourse}
                    onContinueCourse={myLearning.continueCourse}
                />
            </div>
        </div>
    );
}

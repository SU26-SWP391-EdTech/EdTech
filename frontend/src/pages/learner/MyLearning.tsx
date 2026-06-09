import { useMyLearning } from '../../components/learner/MyLearning/useMyLearning';
import MyLearningHeader from '../../components/learner/MyLearning/MyLearningHeader';
import MyLearningStats from '../../components/learner/MyLearning/MyLearningStats';
import MyLearningPathsSection from '../../components/learner/MyLearning/MyLearningPathsSection';
import EnrolledCoursesSection from '../../components/learner/MyLearning/EnrolledCoursesSection';
import ContinueHighlight from '../../components/learner/MyLearning/ContinueHighlight';
import AllPathsView from '../../components/learner/MyLearning/AllPathsView';
import AllCoursesView from '../../components/learner/MyLearning/AllCoursesView';

export function MyLearning() {
    const {
        navigate,
        activeView,
        setActiveView,
        tab,
        setTab,
        enrollments,
        learningPaths,
        isLoading,
        sortBy,
        setSortBy,
        timeAgo,
        inProgressCourses,
        completedCourses,
        displayEnrollment,
        parentPathTitle,
        filteredEnrollments,
        sortedEnrollments,
        getPathAccent,
        getCourseGradient,
    } = useMyLearning();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#6B7280] font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <main className="max-w-[1440px] mx-auto px-8 py-8">
                {activeView === 'dashboard' && (
                    <>
                        {/* Page Header */}
                        <MyLearningHeader
                            hasEnrollments={!!displayEnrollment}
                            onExploreMoreClick={() => navigate('/learner/explore')}
                            onContinueClick={() => navigate('/learner/explore')}
                        />

                        {/* Summary Cards */}
                        <MyLearningStats
                            inProgressCoursesCount={inProgressCourses.length}
                            pathsEnrolledCount={learningPaths.length}
                            completedCoursesCount={completedCourses.length}
                        />

                        {/* Main grid */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 space-y-8">
                                {/* Continue Learning Highlight */}
                                <section>
                                    <ContinueHighlight
                                        displayEnrollment={displayEnrollment}
                                        parentPathTitle={parentPathTitle}
                                        onContinueClick={() => navigate('/learner/explore')}
                                        onViewCourseClick={() => navigate('/learner/explore')}
                                        onBrowseClick={() => navigate('/learner/explore')}
                                    />
                                </section>

                                {/* My Learning Paths */}
                                <MyLearningPathsSection
                                    learningPaths={learningPaths}
                                    completedCourses={completedCourses}
                                    enrollments={enrollments}
                                    getPathAccent={getPathAccent}
                                    onViewAll={() => { setActiveView('all-paths'); window.scrollTo(0, 0); }}
                                    onPathClick={(pathId) => navigate(`/learner/learning-path/${pathId}`)}
                                />

                                {/* Enrolled Courses */}
                                <EnrolledCoursesSection
                                    filteredEnrollmentsCount={filteredEnrollments.length}
                                    sortedEnrollments={sortedEnrollments}
                                    timeAgo={timeAgo}
                                    getCourseGradient={getCourseGradient}
                                    onViewAll={() => { setActiveView('all-courses'); window.scrollTo(0, 0); }}
                                    onCtaClick={() => navigate('/learner/explore')}
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeView === 'all-paths' && (
                    <AllPathsView
                        learningPaths={learningPaths}
                        completedCourses={completedCourses}
                        enrollments={enrollments}
                        getPathAccent={getPathAccent}
                        onBack={() => { setActiveView('dashboard'); window.scrollTo(0, 0); }}
                        onPathClick={(pathId) => navigate(`/learner/learning-path/${pathId}`)}
                    />
                )}

                {activeView === 'all-courses' && (
                    <AllCoursesView
                        sortedEnrollments={sortedEnrollments}
                        tab={tab}
                        setTab={setTab}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        timeAgo={timeAgo}
                        getCourseGradient={getCourseGradient}
                        onBack={() => { setActiveView('dashboard'); window.scrollTo(0, 0); }}
                        onCtaClick={() => navigate('/learner/explore')}
                    />
                )}
            </main>
        </div>
    );
}

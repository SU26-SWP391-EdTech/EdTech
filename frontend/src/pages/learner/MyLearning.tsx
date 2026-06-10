import { Sparkles } from 'lucide-react';
import { useMyLearning } from '../../components/learner/MyLearning/useMyLearning';
import MyLearningHeader from '../../components/learner/MyLearning/MyLearningHeader';
import MyLearningStats from '../../components/learner/MyLearning/MyLearningStats';
import MyLearningPathsSection from '../../components/learner/MyLearning/MyLearningPathsSection';
import EnrolledCoursesSection from '../../components/learner/MyLearning/EnrolledCoursesSection';
import ContinueHighlight from '../../components/learner/MyLearning/ContinueHighlight';
import AllPathsView from '../../components/learner/MyLearning/AllPathsView';
import AllCoursesView from '../../components/learner/MyLearning/AllCoursesView';
import { getContinueLessonUrl } from '../../components/LessonPage/lessonUtils';

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
                            onContinueClick={() => {
                                if (displayEnrollment) {
                                    const url = getContinueLessonUrl(displayEnrollment.course.courseId, enrollments);
                                    navigate(url);
                                } else {
                                    navigate('/learner/explore');
                                }
                            }}
                        />

                        {enrollments.length === 0 ? (
                            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E5E7EB] rounded-2xl shadow-sm mt-6">
                                <Sparkles className="w-12 h-12 text-[#E11D48] mb-4 animate-pulse" />
                                <h2 className="text-xl font-bold text-[#111827] mb-2">No Courses Enrolled Yet</h2>
                                <p className="text-sm text-[#6B7280] max-w-md mb-6">
                                    You are not enrolled in any courses or learning paths yet. Explore our roadmap paths or find individual courses to kickstart your learning journey!
                                </p>
                                <button
                                    onClick={() => navigate('/learner/explore')}
                                    className="px-6 py-3 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-all font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Browse Curated Courses
                                </button>
                            </div>
                        ) : (
                            <>
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
                                                onContinueClick={() => {
                                                    if (displayEnrollment) {
                                                        const url = getContinueLessonUrl(displayEnrollment.course.courseId, enrollments);
                                                        navigate(url);
                                                    }
                                                }}
                                                onViewCourseClick={() => {
                                                    if (displayEnrollment) {
                                                        navigate(`/learner/courses/detail?id=${displayEnrollment.course.courseId}`);
                                                    }
                                                }}
                                                onBrowseClick={() => navigate('/learner/explore')}
                                            />
                                        </section>

                                        {/* My Learning Paths */}
                                        {learningPaths.length > 0 && (
                                            <MyLearningPathsSection
                                                learningPaths={learningPaths}
                                                completedCourses={completedCourses}
                                                enrollments={enrollments}
                                                getPathAccent={getPathAccent}
                                                onViewAll={() => { setActiveView('all-paths'); window.scrollTo(0, 0); }}
                                                onPathClick={(pathId) => navigate(`/learner/learning-path/${pathId}`)}
                                            />
                                        )}

                                        {/* Enrolled Courses */}
                                        <EnrolledCoursesSection
                                            id="enrolled-courses"
                                            filteredEnrollmentsCount={filteredEnrollments.length}
                                            sortedEnrollments={sortedEnrollments}
                                            timeAgo={timeAgo}
                                            getCourseGradient={getCourseGradient}
                                            onViewAll={() => { setActiveView('all-courses'); window.scrollTo(0, 0); }}
                                            onCtaClick={() => navigate('/learner/explore')}
                                            onCourseClick={(courseId) => navigate(`/learner/courses/detail?id=${courseId}`)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
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
                        onCourseClick={(courseId) => navigate(`/learner/courses/detail?id=${courseId}`)}
                    />
                )}
            </main>
        </div>
    );
}

import { useLearningPathDetail } from '../../components/LearningPathDetail/useLearningPathDetail';
import PathHeroBanner from '../../components/LearningPathDetail/PathHeroBanner';
import RoadmapCard from '../../components/LearningPathDetail/RoadmapCard';
import ModuleAccordion from '../../components/LearningPathDetail/ModuleAccordion';
import PathOverviewStats from '../../components/LearningPathDetail/PathOverviewStats';

export function LearningPathDetail() {
  const {
    path,
    isLoading,
    bookmarked,
    setBookmarked,
    activeCourseId,
    setActiveCourseId,
    roadmapNodes,
    totalCourses,
    completedCourses,
    overallProgress,
    remainingLessons,
    remainingHours,
    activeCourse,
    currentModules,
    handleEnrollSingleCourse,
    handleEnrollAllPath,
    handleStartLesson,
    handleContinueCourse,
  } = useLearningPathDetail();

  if (isLoading || !path) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading Learning Path details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Banner Section */}
      <PathHeroBanner
        path={path}
        totalCourses={totalCourses}
        overallProgress={overallProgress}
        completedCourses={completedCourses}
        remainingHours={remainingHours}
        remainingLessons={remainingLessons}
        bookmarked={bookmarked}
        onBookmarkToggle={() => setBookmarked(!bookmarked)}
        onEnrollAllPath={handleEnrollAllPath}
      />

      {/* Main Roadmap & Modules Layout */}
      <div className="max-w-[1376px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Vertical Roadmap Node Cards */}
          <div className="col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>Learning Roadmap</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{completedCourses} of {totalCourses} courses completed · follow the path sequentially</p>
                </div>
                <div className="flex items-center gap-3">
                  {(['completed', 'current', 'upcoming', 'locked'] as const).map(state => (
                    <div key={state} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{
                        backgroundColor: state === 'completed' ? '#16A34A' : state === 'current' ? '#E11D48' : state === 'upcoming' ? '#D1D5DB' : '#F3F4F6',
                        border: state === 'locked' ? '1px solid #E5E7EB' : 'none'
                      }} />
                      <span className="text-[10px] text-[#9CA3AF] capitalize">{state}</span>
                    </div>
                  ))}
                </div>
              </div>

              {roadmapNodes.map((node, i) => (
                <RoadmapCard 
                  key={node.id} 
                  node={node} 
                  isLast={i === roadmapNodes.length - 1} 
                  onSelect={() => node.state !== 'locked' && setActiveCourseId(node.id)}
                  onEnroll={() => handleEnrollSingleCourse(node.id)}
                  onContinue={() => handleContinueCourse(node.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Selected Course Content Modules & Progress Overview Charts */}
          <div className="col-span-5 flex flex-col gap-4">
            {activeCourse && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>Course Content</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{activeCourse.title} — {roadmapNodes.find(n => n.id === activeCourseId)?.progress || 0}% complete</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {currentModules.map((mod, i) => (
                    <ModuleAccordion 
                      key={mod.id} 
                      module={mod} 
                      defaultOpen={i === 0} 
                      onStartLesson={handleStartLesson}
                    />
                  ))}
                </div>
              </div>
            )}

            <PathOverviewStats
              overallProgress={overallProgress}
              remainingHours={remainingHours}
              remainingLessons={remainingLessons}
              completedCourses={completedCourses}
              totalCourses={totalCourses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

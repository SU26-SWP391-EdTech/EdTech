import { useLearningPathDetail } from '../../hooks/learning-path/useLearningPathDetail';
import PathHeroBanner from '../../components/learning-path/detail/PathHeroBanner';
import RoadmapCard from '../../components/learning-path/detail/RoadmapCard';
import ModuleAccordion from '../../components/learning-path/detail/ModuleAccordion';

export function LearningPathDetail() {
  const {
    path,
    isLoading,
    activeCourseId,
    setActiveCourseId,
    roadmapNodes,
    totalCourses,
    totalDurationLabel,
    completedCourses,
    overallProgress,
    activeCourse,
    currentModules,
    handleEnrollSingleCourse,
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
        totalDurationLabel={totalDurationLabel}
        overallProgress={overallProgress}
        completedCourses={completedCourses}
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
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{totalCourses} courses in this path</p>
                </div>
              </div>

              {roadmapNodes.map((node, i) => (
                <RoadmapCard 
                  key={node.id} 
                  node={node} 
                  isLast={i === roadmapNodes.length - 1} 
                  onSelect={() => setActiveCourseId(node.id)}
                  onEnroll={() => handleEnrollSingleCourse(node.id)}
                  onContinue={() => handleContinueCourse(node.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Selected Course Content Modules */}
          <div className="col-span-5 flex flex-col gap-4">
            {activeCourse && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>Course Content</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{activeCourse.title}</p>
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

          </div>
        </div>
      </div>
    </div>
  );
}

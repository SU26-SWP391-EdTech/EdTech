import { useNavigate } from 'react-router-dom';
import { Play, Search } from 'lucide-react';
import { useExplore } from '../../components/Explore/useExplore';
import SectionHeader from '../../components/Explore/SectionHeader';
import HeroDiscovery from '../../components/Explore/HeroDiscovery';
import ExplorePathCard from '../../components/Explore/ExplorePathCard';
import ExploreCourseCard from '../../components/Explore/ExploreCourseCard';

type Tab = 'all' | 'courses' | 'paths' | 'recommended' | 'saved';

export function ExplorePage() {
    const navigate = useNavigate();
    const {
        tab,
        setTab,
        searchTerm,
        setSearchTerm,
        setSelectedLanguage,
        isLoading,
        enrollingId,
        filteredCourses,
        filteredPaths,
        enrollments,
        enrolledPathIds,
        isEnrolled,
        handleEnroll,
        handleEnrollPath,
        getCourseLevel,
        getCourseGradient,
        user,
    } = useExplore();

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <main className="max-w-[1440px] mx-auto px-8 py-8">

                {/* Page Header */}
                <div className="flex items-end justify-between mb-7">
                    <div>
                        <h1 className="text-[32px] text-[#111827] mb-1.5" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Explore
                        </h1>
                        <p className="text-[#6B7280] text-[15px]">
                            Discover courses, learning paths, and skills tailored to your goals.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        {user?.roleName?.toLowerCase() === 'learner' && (
                            <>
                                <button onClick={() => navigate('/learner/my-learning')} className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors" style={{ fontWeight: 500 }}>
                                    View My Learning
                                </button>
                                <button onClick={() => navigate('/learner/my-learning')} className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                    <Play className="w-4 h-4 fill-white" />
                                    Continue Learning
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Hero Discovery */}
                <HeroDiscovery 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                />

                {/* Tabs */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 p-1 bg-white border border-[#E5E7EB] rounded-lg">
                        {([
                            { id: 'all', label: 'All' },
                            { id: 'paths', label: 'Learning Paths' },
                            { id: 'courses', label: 'Courses' },
                        ] as { id: Tab; label: string }[]).map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`px-3.5 py-1.5 text-sm rounded-md transition-colors ${tab === t.id ? 'bg-[#111827] text-white' : 'text-[#6B7280] hover:text-[#111827]'
                                    }`}
                                style={{ fontWeight: 500 }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-9">
                    {/* Featured Paths */}
                    {(tab === 'all' || tab === 'paths') && (
                        <section>
                            <SectionHeader 
                                title="Featured Learning Paths" 
                                subtitle="Curated career-focused journeys" 
                                actionLabel={tab === 'all' ? "View All" : ""} 
                                onAction={() => setTab('paths')}
                            />
                            {isLoading ? (
                                <div className="grid grid-cols-3 gap-4 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {(tab === 'all' ? filteredPaths.slice(0, 3) : filteredPaths).map((path, index) => {
                                        const colors = ['#E11D48', '#6366F1', '#8B5CF6', '#10B981'];
                                        const pathCourses = path.learningPathCourses || [];
                                        
                                        // Check if user is enrolled in the path
                                        const userEnrolledInPath = enrolledPathIds.includes(path.learningPathId);
                                        
                                        // Calculate personal completion rate
                                        const completedInPath = pathCourses.filter(pc =>
                                            enrollments.some(e => e.course?.courseId === pc.courseId && (e.status === 'completed' || e.progress === 100))
                                        ).length;
                                        const personalProgress = pathCourses.length > 0
                                            ? Math.round((completedInPath / pathCourses.length) * 100)
                                            : 0;

                                        return (
                                            <ExplorePathCard
                                                key={path.learningPathId}
                                                learningPathId={path.learningPathId}
                                                title={path.title}
                                                description={path.description || 'Step-by-step master curriculum.'}
                                                courses={pathCourses.length}
                                                duration="35h"
                                                difficulty={path.level}
                                                enrolled="1,250"
                                                completion={75}
                                                accent={colors[index % colors.length]}
                                                isPathEnrolled={userEnrolledInPath}
                                                personalProgress={personalProgress}
                                                onEnroll={() => handleEnrollPath(path)}
                                            />
                                        );
                                    })}
                                    {filteredPaths.length === 0 && (
                                        <p className="text-sm text-slate-500 col-span-3 py-6 text-center">No learning paths found.</p>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Trending Courses / Catalog */}
                                     {(tab === 'all' || tab === 'courses') && (
                                         <section>
                                             <SectionHeader 
                                                 title="Trending Courses" 
                                                 subtitle="What learners are taking this week" 
                                                 actionLabel={tab === 'all' ? "View All" : ""} 
                                                 onAction={() => setTab('courses')}
                                             />
                                             {isLoading ? (
                                                 <div className="grid grid-cols-5 gap-4 animate-pulse">
                                                     {[1, 2, 3, 4, 5].map(i => (
                                                         <div key={i} className="h-56 bg-slate-100 rounded-2xl" />
                                                     ))}
                                                 </div>
                                             ) : (
                                                 <div className="grid grid-cols-5 gap-4">
                                                     {(tab === 'all' ? filteredCourses.slice(0, 5) : filteredCourses).map((course, index) => {
                                                         const difficultyLevel = getCourseLevel(course);
                                                         const roleName = user?.roleName?.toLowerCase() || 'guest';
                                                         return (
                                                             <ExploreCourseCard
                                                                 key={course.courseId}
                                                                 title={course.title}
                                                                 provider={course.user?.fullName || "Senior Instructor"}
                                                                 rating={4.8}
                                                                 students="8.5k"
                                                                 duration={`${course.duration || 8}h`}
                                                                 difficulty={difficultyLevel}
                                                                 tags={[course.language || 'English']}
                                                                 thumb={getCourseGradient(index)}
                                                                 badge={index === 0 ? "Popular" : index === 1 ? "Trending" : undefined}
                                                                 isEnrolled={isEnrolled(course.courseId)}
                                                                 onEnroll={() => handleEnroll(course.courseId)}
                                                                 enrolling={enrollingId === course.courseId}
                                                                 onClick={() => {
                                                                     const prefix = roleName === 'learner' ? '/learner' : '';
                                                                     navigate(`${prefix}/courses/detail?id=${course.courseId}`);
                                                                 }}
                                                             />
                                                         );
                                                     })}
                                    {filteredCourses.length === 0 && (
                                        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-10 flex flex-col items-center text-center col-span-5">
                                            <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mb-4">
                                                <Search className="w-6 h-6 text-[#9CA3AF]" />
                                            </div>
                                            <h3 className="text-[16px] text-[#111827] mb-1" style={{ fontWeight: 600 }}>No results found</h3>
                                            <p className="text-sm text-[#6B7280] mb-5 max-w-sm">Try changing your filters or searching another keyword.</p>
                                            <button onClick={() => { setSearchTerm(''); setSelectedLanguage('all'); }} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
                                                Reset Filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

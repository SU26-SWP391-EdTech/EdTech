import { useNavigate } from 'react-router-dom';
import { Search, Tag as TagIcon, X } from 'lucide-react';
import { useExplore } from '../../hooks/course/useExplore';
import SectionHeader from '../../components/course/my-learning/SectionHeader';
import HeroDiscovery from '../../components/course/explore/HeroDiscovery';
import ExplorePathCard from '../../components/course/explore/ExplorePathCard';
import ExploreCourseCard from '../../components/course/explore/ExploreCourseCard';
import { extractCourseTags } from '../../services/course/course.service';

type Tab = 'all' | 'courses' | 'paths' | 'recommended' | 'saved';

function formatDuration(totalMinutes: number) {
    const minutes = Math.max(0, Math.round(totalMinutes || 0));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

export function ExplorePage() {
    const navigate = useNavigate();
    const {
        tab,
        setTab,
        searchTerm,
        setSearchTerm,
        setSelectedLanguage,
        selectedTag,
        setSelectedTag,
        allTags,
        isLoading,
        enrollingId,
        filteredCourses,
        filteredPaths,
        enrollments,
        enrolledPathIds,
        followedPathIds,
        isEnrolled,
        handleEnroll,
        handleFollow,
        handleUnfollow,
        getCourseGradient,
        user,
    } = useExplore();

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <main className="max-w-[1440px] mx-auto px-8 pt-4 pb-8">

                {/* Page Header */}
                <div className="mb-5">
                    <div>
                        <h1 className="text-[32px] text-[#111827] mb-1.5" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Explore
                        </h1>
                        <p className="text-[#6B7280] text-[15px]">
                            Discover courses, learning paths, and skills tailored to your goals.
                        </p>
                    </div>
                </div>

                {/* Hero Discovery */}
                <HeroDiscovery 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                />

                {/* Tabs & Tag Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-1 p-1 bg-white border border-[#E5E7EB] rounded-lg shrink-0">
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

                    {/* Tag Filter Chips */}
                    {allTags.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                            <span className="text-xs text-[#6B7280] font-medium flex items-center gap-1 shrink-0">
                                <TagIcon className="w-3.5 h-3.5 text-[#E11D48]" />
                                Tags:
                            </span>
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${!selectedTag ? 'bg-[#E11D48] text-white' : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#CBD5E1]'}`}
                            >
                                All Tags
                            </button>
                            {allTags.map((tag) => {
                                const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                                        className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${isSelected ? 'bg-[#E11D48] text-white' : 'bg-white text-[#475569] border border-[#E5E7EB] hover:border-[#E11D48]/40 hover:text-[#E11D48]'}`}
                                    >
                                        #{tag}
                                        {isSelected && <X className="w-3 h-3 text-white" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
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
                                    {filteredPaths.map((path, index) => {
                                        const colors = ['#E11D48', '#6366F1', '#8B5CF6', '#10B981'];
                                        const pathCourses = path.learningPathCourses || [];
                                        
                                        const userEnrolledInPath = enrolledPathIds.includes(path.learningPathId);
                                        const totalMinutes = pathCourses.reduce((sum, pc) => sum + (pc.course?.duration || 0), 0);
                                        
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
                                                duration={formatDuration(totalMinutes)}
                                                difficulty={path.level}
                                                accent={colors[index % colors.length]}
                                                thumbnailUrl={path.bannerUrl}
                                                isFollowed={followedPathIds.includes(path.learningPathId)}
                                                personalProgress={personalProgress}
                                                onFollow={() => handleFollow(path.learningPathId)}
                                                onUnfollow={() => handleUnfollow(path.learningPathId)}
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
                                                         const roleName = user?.roleName?.toLowerCase() || 'guest';
                                                         const getRolePrefix = (role: string) => {
                                                             if (role === 'learner') return '/learner';
                                                             if (role === 'course provider') return '/provider';
                                                             if (role === 'academic manager') return '/academic';
                                                             if (role === 'admin') return '/admin';
                                                             return '';
                                                         };
                                                         const prefix = getRolePrefix(roleName);
                                                         return (
                                                             <ExploreCourseCard
                                                                 key={course.courseId}
                                                                 title={course.title}
                                                                 provider={course.user?.fullName || "Senior Instructor"}
                                                                 duration={formatDuration(course.duration || 0)}
                                                                 tags={extractCourseTags(course)}
                                                                 thumb={getCourseGradient(index)}
                                                                 thumbnailUrl={course.thumbnailUrl}
                                                                 isEnrolled={isEnrolled(course.courseId)}
                                                                 onEnroll={() => handleEnroll(course.courseId)}
                                                                 enrolling={enrollingId === course.courseId}
                                                                 onTagClick={(tag) => setSelectedTag(selectedTag === tag ? null : tag)}
                                                                 role={roleName}
                                                                 onClick={() => {
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
                                            <button onClick={() => { setSearchTerm(''); setSelectedLanguage('all'); setSelectedTag(null); }} className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors" style={{ fontWeight: 500 }}>
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

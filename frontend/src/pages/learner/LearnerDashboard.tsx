import { useNavigate } from 'react-router-dom';
import { useLearnerDashboard } from '../../hooks/user/useLearnerDashboard';
import DashboardStatCard from '../../components/user/dashboard/learner/DashboardStatCard';
import DashboardHeader from '../../components/user/dashboard/learner/DashboardHeader';
import ContinueLearningSection from '../../components/user/dashboard/learner/ContinueLearningSection';
import LearningRoadmapSection from '../../components/user/dashboard/learner/LearningRoadmapSection';

export function LearnerDashboard() {
    const navigate = useNavigate();
    const {
        profile,
        activeStats,
        continueCourses,
        activePath,
        roadmapNodes,
        completedCount,
        enrollments
    } = useLearnerDashboard();

    return (
        <main className="max-w-[1440px] mx-auto px-8 py-8 space-y-8">
            {/* Header */}
            <DashboardHeader 
                fullName={profile?.fullName}
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-5">
                {activeStats.map(stat => (
                    <DashboardStatCard
                        key={stat.id}
                        label={stat.label}
                        value={stat.value}
                        sub={stat.sub}
                        icon={stat.icon}
                        color={stat.color}
                        bg={stat.bg}
                        sparkData={stat.sparkData}
                    />
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-12 gap-6">
                <ContinueLearningSection
                    continueCourses={continueCourses}
                    onViewAllClick={() => navigate('/learner/my-learning#enrolled-courses')}
                    onCourseClick={(courseId) => navigate(`/learner/courses/detail?id=${courseId}`)}
                    onBrowseClick={() => navigate('/learner/explore')}
                />

                <LearningRoadmapSection
                    activePath={activePath}
                    roadmapNodes={roadmapNodes}
                    completedCount={completedCount}
                    onViewFullMap={() => navigate(`/learner/learning-path/${activePath?.learningPathId}`)}
                    onExplorePathsClick={() => navigate('/learner/explore')}
                />
            </div>
        </main>
    );
}


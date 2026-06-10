import { useNavigate } from 'react-router-dom';
import { useLearnerDashboard } from '../../components/learner/LearnerDashboard/useLearnerDashboard';
import DashboardStatCard from '../../components/learner/LearnerDashboard/DashboardStatCard';
import DashboardHeader from '../../components/learner/LearnerDashboard/DashboardHeader';
import ContinueLearningSection from '../../components/learner/LearnerDashboard/ContinueLearningSection';
import LearningRoadmapSection from '../../components/learner/LearnerDashboard/LearningRoadmapSection';

export function LearnerDashboard() {
    const navigate = useNavigate();
    const {
        profile,
        activeStats,
        continueCourses,
        activePath,
        roadmapNodes,
        completedCount
    } = useLearnerDashboard();

    return (
        <main className="max-w-[1440px] mx-auto px-8 py-8 space-y-8">
            {/* Header */}
            <DashboardHeader 
                fullName={profile?.fullName}
                onContinueClick={() => navigate('/learner/my-learning')}
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
                    onContinueClick={(courseId) => navigate(`/learner/courses/detail?id=${courseId}`)}
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

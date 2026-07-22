import { useNavigate } from 'react-router-dom';
import { useLearnerDashboard } from '../../hooks/user/useLearnerDashboard';
import DashboardHeader from '../../components/user/dashboard/learner/DashboardHeader';
import ContinueLearningSection from '../../components/user/dashboard/learner/ContinueLearningSection';
import LearningRoadmapSection from '../../components/user/dashboard/learner/LearningRoadmapSection';
import StreakCalendarMap from '../../components/user/dashboard/learner/StreakCalendarMap';
import MiniLeaderboard from '../../components/user/dashboard/learner/MiniLeaderboard';
import MiniPvpWidget from '../../components/user/dashboard/learner/MiniPvpWidget';

export function LearnerDashboard() {
  const navigate = useNavigate();
  const {
    profile,
    continueCourses,
    activePath,
    followedPaths,
    selectedPathId,
    setSelectedPathId,
    roadmapNodes,
    enrolledCount,
  } = useLearnerDashboard();

  return (
    <main className="max-w-[1440px] mx-auto px-8 py-8 space-y-8">
      {/* Header */}
      <DashboardHeader
        fullName={profile?.fullName}
      />

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column (col-span-8) */}
        <div className="col-span-8 space-y-6">
          <ContinueLearningSection
            continueCourses={continueCourses}
            onViewAllClick={() => navigate('/learner/my-learning#enrolled-courses')}
            onCourseClick={(courseId) => navigate(`/learner/courses/detail?id=${courseId}`)}
            onBrowseClick={() => navigate('/learner/explore')}
          />

          <LearningRoadmapSection
            activePath={activePath}
            followedPaths={followedPaths}
            selectedPathId={selectedPathId}
            onSelectedPathChange={setSelectedPathId}
            roadmapNodes={roadmapNodes}
            enrolledCount={enrolledCount}
            onViewFullMap={() => navigate(`/learner/learning-path/${activePath?.learningPathId}`)}
            onExplorePathsClick={() => navigate('/learner/explore')}
          />
        </div>

        {/* Right column (col-span-4) */}
        <div className="col-span-4 space-y-6">
          {/* Mini PvP Arena Widget */}
          <MiniPvpWidget profile={profile} />

          {/* Mini Leaderboard Widget */}
          <MiniLeaderboard />
        </div>
      </div>

      {/* GitHub-style Learning Activity Heatmap with Integrated Streak */}
      <StreakCalendarMap
        activeDates={profile?.activeDates ?? []}
        currentStreak={profile?.streakCount ?? 0}
        longestStreak={profile?.longestStreak ?? 0}
        streakLife={profile?.streakLife ?? 1}
      />
    </main>
  );
}


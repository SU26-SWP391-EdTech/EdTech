import type { RouteObject } from 'react-router-dom';
import { LearnerGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { CourseDetail } from '../pages/course/CourseDetail';
import { ExplorePage } from '../pages/course/ExplorePage';
import { LearnerDashboard } from '../pages/learner/LearnerDashboard';
import { MyLearning } from '../pages/learner/MyLearning';
import { LearningPathDetail } from '../pages/learning-path/LearningPathDetail';
import { LessonPage } from '../pages/lesson/LessonPage';
import { LearnerProfile } from '../pages/user/LearnerProfile';
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage';
import { PvpBattlePage } from '../pages/pvp/PvpBattlePage';
import { PvpArenaPage } from '../pages/pvp/PvpArenaPage';

export const learnerRoutes: RouteObject = {
    path: '/learner',
    element: (
        <LearnerGuard>
            <DashboardLayout role="learner" />
        </LearnerGuard>
    ),
    children: [
        { index: true, element: <LearnerDashboard /> },
        { path: 'learnerprofile', element: <LearnerProfile /> },
        { path: 'my-learning', element: <MyLearning /> },
        { path: 'explore', element: <ExplorePage /> },
        { path: 'courses/detail', element: <CourseDetail /> },
        { path: 'learning-path/:id', element: <LearningPathDetail /> },
        { path: 'lesson', element: <LessonPage /> },
        { path: 'leaderboard', element: <LeaderboardPage /> },
        { path: 'pvp', element: <PvpArenaPage /> },
        { path: 'pvp/battle', element: <PvpBattlePage /> },
    ],
};

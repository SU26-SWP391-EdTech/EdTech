import { Navigate, type RouteObject } from 'react-router-dom';
import { AcademicGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { CourseDetail } from '../pages/course/CourseDetail';
import { CourseManagement } from '../pages/course/CourseManagement';
import { PendingCourses } from '../pages/course/PendingCourses';
import { LearningPathManagement } from '../pages/learning-path/LearningPathManagement';
import { LessonPage } from '../pages/lesson/LessonPage';
import { UserProfile } from '../pages/user/UserProfile';
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage';

export const academicRoutes: RouteObject = {
    path: '/academic',
    element: (
        <AcademicGuard>
            <DashboardLayout role="academic-manager" />
        </AcademicGuard>
    ),
    children: [
        { index: true, element: <Navigate to="courses" replace /> },
        { path: 'userprofile', element: <UserProfile /> },
        { path: 'courses', element: <CourseManagement /> },
        { path: 'pending-courses', element: <PendingCourses /> },
        { path: 'courses/detail', element: <CourseDetail /> },
        { path: 'courses/lessons', element: <CourseManagement /> },
        { path: 'lesson', element: <LessonPage /> },
        { path: 'learning-paths', element: <LearningPathManagement /> },
        { path: 'leaderboard', element: <LeaderboardPage /> },
    ],
};

import type { RouteObject } from 'react-router-dom';
import { ProviderGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { CourseDetail } from '../pages/course/CourseDetail';
import { CourseManagement } from '../pages/course/CourseManagement';
import { CreateCoursePage } from '../pages/course/CreateCourse';
import { ExplorePage } from '../pages/course/ExplorePage';
import { MyCoursesPage } from '../pages/course/MyCoursePage';
import { LearningPathDetail } from '../pages/learning-path/LearningPathDetail';
import { CreateLessonPage } from '../pages/lesson/CreateLesson';
import { ProviderProfile } from '../pages/user/ProviderProfile';

export const providerRoutes: RouteObject = {
    path: '/provider',
    element: (
        <ProviderGuard>
            <DashboardLayout role="provider" />
        </ProviderGuard>
    ),
    children: [
        { index: true, element: <h1>Home Provider</h1> },
        { path: 'profile', element: <ProviderProfile /> },
        { path: 'courses', element: <MyCoursesPage /> },
        { path: 'courses/create', element: <CreateCoursePage /> },
        { path: 'courses/detail', element: <CourseDetail /> },
        { path: 'courses/lessons', element: <CourseManagement /> },
        { path: 'lessons/create', element: <CreateLessonPage /> },
        { path: 'explore', element: <ExplorePage /> },
        { path: 'learning-path/:id', element: <LearningPathDetail /> },
    ],
};

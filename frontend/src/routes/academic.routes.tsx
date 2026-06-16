import type { RouteObject } from 'react-router-dom';
import { AcademicGuard } from '../components/auth/RoleGuards';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { CourseDetail } from '../pages/course/CourseDetail';
import { CourseManagement } from '../pages/course/CourseManagement';
import { LearningPathDetail } from '../pages/learning-path/LearningPathDetail';
import { LearningPathManagement } from '../pages/learning-path/LearningPathManagement';
import { ProviderProfile } from '../pages/user/ProviderProfile';
import { UserProfile } from '../pages/user/UserProfile';

export const academicRoutes: RouteObject = {
    path: '/academic',
    element: (
        <AcademicGuard>
            <DashboardLayout role="academic-manager" />
        </AcademicGuard>
    ),
    children: [
        { index: true, element: <h1>Home Academic</h1> },
        { path: 'userprofile', element: <UserProfile /> },
        { path: 'courses', element: <CourseManagement /> },
        { path: 'pending-courses', element: <CourseManagement /> },
        { path: 'courses/detail', element: <CourseDetail /> },
        { path: 'courses/lessons', element: <CourseManagement /> },
        { path: 'learning-path/:id', element: <LearningPathDetail /> },
        { path: 'learning-paths', element: <LearningPathManagement /> },
        { path: 'providers/:id', element: <ProviderProfile /> },
    ],
};

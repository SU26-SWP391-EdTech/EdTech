import type { RouteObject } from 'react-router-dom';
import { GuestLayout } from '../layouts/dashboard/GuestLayout';
import { CourseDetail } from '../pages/course/CourseDetail';
import { ExplorePage } from '../pages/course/ExplorePage';
import { LearningPathDetail } from '../pages/learning-path/LearningPathDetail';
import { ProviderProfile } from '../pages/user/ProviderProfile';
import { HomeRedirect } from './HomeRedirect';

export const publicRoutes: RouteObject = {
    path: '/',
    element: <GuestLayout />,
    children: [
        { index: true, element: <HomeRedirect /> },
        { path: 'explore', element: <ExplorePage /> },
        { path: 'courses/detail', element: <CourseDetail /> },
        { path: 'learning-path/:id', element: <LearningPathDetail /> },
        { path: 'providers/:id', element: <ProviderProfile /> },
    ],
};

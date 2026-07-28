import { createBrowserRouter, Navigate } from 'react-router-dom';
import { academicRoutes } from './academic.routes';
import { adminRoutes } from './admin.routes';
import { authRoutes } from './auth.routes';
import { learnerRoutes } from './learner.routes';
import { providerRoutes } from './provider.routes';
import { publicRoutes } from './public.routes';

export const router = createBrowserRouter([
    publicRoutes,
    authRoutes,
    learnerRoutes,
    providerRoutes,
    adminRoutes,
    academicRoutes,
    { path: '*', element: <Navigate to="/" replace /> },
]);

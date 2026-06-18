import type { RouteObject } from 'react-router-dom';
import { GuestGuard } from '../components/auth/RoleGuards';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { SignIn } from '../pages/auth/SignIn';
import { SignUp } from '../pages/auth/SignUp';
import { VerifyEmail } from '../pages/auth/VerifyEmail';

export const authRoutes: RouteObject = {
    element: <GuestGuard />,
    children: [
        { path: '/login', element: <SignIn /> },
        { path: '/register', element: <SignUp /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/verify-email', element: <VerifyEmail /> },
    ],
};

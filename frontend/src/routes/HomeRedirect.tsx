import { Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/landing/LandingPage';
import { useAuthStore } from '../stores/auth/auth.stores';

export function HomeRedirect() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <LandingPage />;
    }

    switch (user.roleName?.toLowerCase()) {
        case 'admin':
            return <Navigate to="/admin" replace />;
        case 'learner':
            return <Navigate to="/learner" replace />;
        case 'course provider':
            return <Navigate to="/provider" replace />;
        case 'academic manager':
            return <Navigate to="/academic/courses" replace />;
        default:
            return <LandingPage />;
    }
}

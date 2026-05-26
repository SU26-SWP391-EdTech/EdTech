import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, getPostLoginPath } from '../../stores/auth.store';

const GuestRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user) {
    return (
      <Navigate to={getPostLoginPath(user.roleName)} replace />
    );
  }

  return <Outlet />;
};

export default GuestRoute;

import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.stores';

interface GuardProps {
  children?: ReactNode;
}

export function getDefaultRoute(roleName: string): string {
  if (roleName === 'admin') return '/admin';
  if (roleName === 'course provider') return '/provider';
  if (roleName === 'academic manager') return '/academic';
  return '/learner';
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E11D48]"></div>
    </div>
  );
}

/**
 * GuestGuard: Chỉ cho phép người dùng chưa đăng nhập truy cập.
 * Nếu đã đăng nhập, tự động chuyển hướng đến trang dashboard tương ứng.
 */
export function GuestGuard({ children }: GuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * LearnerGuard: Chỉ cho phép người dùng có vai trò 'learner' (Học viên).
 */
export function LearnerGuard({ children }: GuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleName !== 'learner') {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * ProviderGuard: Chỉ cho phép người dùng có vai trò 'course provider' (Giảng viên/Nhà cung cấp).
 */
export function ProviderGuard({ children }: GuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleName !== 'course provider') {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * AdminGuard: Chỉ cho phép người dùng có vai trò 'admin' (Quản trị viên).
 */
export function AdminGuard({ children }: GuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleName !== 'admin') {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * AcademicGuard: Chỉ cho phép người dùng có vai trò 'academic manager' (Quản lý đào tạo).
 */
export function AcademicGuard({ children }: GuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleName !== 'academic manager') {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

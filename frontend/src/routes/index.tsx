import { createBrowserRouter, Navigate } from 'react-router-dom';
import UserPage from '../layouts/admin/UserPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AdminLayout from '../layouts/admin/AdminLayout';
import LoginPage from '../pages/public/LoginPage';
import HomePage from '../pages/public/HomePage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import GuestRoute from '../components/auth/GuestRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'users',
            element: <UserPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

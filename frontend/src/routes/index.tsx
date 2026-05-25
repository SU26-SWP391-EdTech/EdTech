import { createBrowserRouter } from 'react-router-dom';
import UserPage from '../layouts/admin/UserPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AdminLayout from '../layouts/admin/AdminLayout';

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "users",
        element: <UserPage />,
      },
    ],

    // viet tiep vao day
  }
])
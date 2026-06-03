<<<<<<< Updated upstream
import { createBrowserRouter, Navigate } from 'react-router-dom';
import UserPage from '../layouts/admin/UserPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AdminLayout from '../layouts/admin/AdminLayout';
import LoginPage from '../pages/public/LoginPage';
import HomePage from '../pages/public/HomePage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import GuestRoute from '../components/auth/GuestRoute';
=======
import { createBrowserRouter } from 'react-router-dom';
//Landing pages
import { LandingPage } from '../pages/LandingPage/LandingPage';
//Auth pages
import { SignIn } from '../pages/auth/SignIn';
import { SignUp } from '../pages/auth/SignUp';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
//Admin pages
import { UserManagement } from '../pages/admin/UserManagement';
//User Profile page
import { UserProfile } from '../pages/Users/UserProfile';
//Role navigation pages 
import { GuestLayout } from '../layouts/Dashboard/GuestLayout';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
            {
                index: true,
                element: <LandingPage />
            },
            {
                path: "explore",
                element: <div>Trang tìm kiếm khóa học công khai</div>
            }
        ]
    },
    // ==========================================
    // 🔐 NHÓM 2: Giao diện đăng nhập/đăng ký (AUTH LAYOUT)
    // ==========================================
    {
        children: [
            {
                path: "/login",
                element: <SignIn />
            },
            {
                path: "/register",
                element: <SignUp />
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "/verify-email",
                element: <VerifyEmail />
            }
        ]
    },
    // ==========================================
    // 📊 NHÓM 3: Giao diện bảo mật theo vai trò (DASHBOARD LAYOUT)
    // ==========================================
    // Bạn truyền trực tiếp prop `role` tương ứng vào DashboardLayout!

    // --- CHO HỌC VIÊN ---
    {
        path: "/learner",
        element: <DashboardLayout role="learner" />, // Tự động có LearnerHeader với màu Crimson
        children: [
            {
                index: true,
                element: <h1>Home learner</h1>
            },
            {
                path: 'userprofile',
                element: <UserProfile />
            }
        ]
    },
    // --- CHO GIẢNG VIÊN (PROVIDER) ---
    {
        path: "/provider",
        element: <DashboardLayout role="provider" />, // Tự động có ProviderHeader với màu Sky Blue
        children: [
            {
                index: true,
                element: <h1>Home Provider</h1>
            },
            {
                path: 'userprofile',
                element: <UserProfile />
            }
        ]
    },
    // --- CHO QUẢN TRỊ VIÊN (ADMIN) ---
    {
        path: "/admin",
        element: <DashboardLayout role="admin" />,
        children: [
            {
                index: true,
                element: <h1>Home Admin</h1>
            },
            {
                path: 'usermanagement',
                element: <UserManagement />
            },
            {
                path: 'analytics',
                element: <h1>Analytics Admin</h1>
            },
            {
                path: 'userprofile',
                element: <UserProfile />
            }
        ]
    },
    // --- CHO QUẢN LÝ ĐÀO TẠO (ACADEMIC MANAGER) ---
    {
        path: "/academic",
        element: <DashboardLayout role="academic-manager" />,
        children: [
            {
                index: true,
                element: <h1>Home Academic</h1>
            },
            {
                path: 'userprofile',
                element: <UserProfile />
            }
        ]
    },
]);
>>>>>>> Stashed changes

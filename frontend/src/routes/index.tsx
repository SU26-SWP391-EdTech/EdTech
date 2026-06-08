import { createBrowserRouter, Navigate } from 'react-router-dom';

// Landing pages
import { LandingPage } from '../pages/LandingPage/LandingPage';

// Auth pages
import { SignIn } from '../pages/auth/SignIn';
import { SignUp } from '../pages/auth/SignUp';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';

// Admin pages
import { UserManagement } from '../pages/admin/UserManagement';

// User Profile page
import { LearnerProfile } from '../pages/Users/LearnerProfile';
import { UserProfile } from '../pages/Users/UserProfile';

// Course pages
import { CourseManagement } from '../pages/auth/Course/CourseManagement';

// Role navigation pages 
import { GuestLayout } from '../layouts/Dashboard/GuestLayout';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';

// Role Guards
import { GuestGuard, LearnerGuard, ProviderGuard, AdminGuard, AcademicGuard } from '../components/auth/RoleGuards';
import { AdminProfile } from '../pages/admin/AdminProfile';

export const router = createBrowserRouter([
    // ==========================================
    // 🌐 NHÓM 1: Giao diện công khai (GUEST LAYOUT)
    // ==========================================
    {
        path: "/",
        element: <GuestLayout />, // Sử dụng GuestLayout cho các trang công khai
        children: [
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
        element: <GuestGuard />, // Chỉ cho phép khách chưa đăng nhập truy cập
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

    // --- CHO HỌC VIÊN ---
    {
        path: "/learner",
        element: (
            <LearnerGuard>
                <DashboardLayout role="learner" />
            </LearnerGuard>
        ),
        children: [
            {
                index: true,
                element: <h1>Home learner</h1>
            },
            {
                path: 'learnerprofile',
                element: <LearnerProfile />
            },
            {
                path: 'my-learning',
                element: <CourseManagement />
            },
            {
                path: 'lessons',
                element: <CourseManagement />
            }
        ]
    },
    // --- CHO GIẢNG VIÊN (PROVIDER) ---
    {
        path: "/provider",
        element: (
            <ProviderGuard>
                <DashboardLayout role="provider" />
            </ProviderGuard>
        ),
        children: [
            {
                index: true,
                element: <h1>Home Provider</h1>
            },
            {
                path: 'userprofile',
                element: <UserProfile />
            },
            {
                path: 'courses',
                element: <CourseManagement />
            },
            {
                path: 'courses/detail',
                element: <CourseManagement />
            },
            {
                path: 'courses/lessons',
                element: <CourseManagement />
            }
        ]
    },
    // --- CHO QUẢN TRỊ VIÊN (ADMIN) ---
    {
        path: "/admin",
        element: (
            <AdminGuard>
                <DashboardLayout role="admin" />
            </AdminGuard>
        ),
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
                path: 'adminprofile',
                element: <AdminProfile />
            },
            {
                path: 'courses',
                element: <CourseManagement />
            },
            {
                path: 'courses/detail',
                element: <CourseManagement />
            },
            {
                path: 'courses/lessons',
                element: <CourseManagement />
            }
        ]
    },
    // --- CHO QUẢN LÝ ĐÀO TẠO (ACADEMIC MANAGER) ---
    {
        path: "/academic",
        element: (
            <AcademicGuard>
                <DashboardLayout role="academic-manager" />
            </AcademicGuard>
        ),
        children: [
            {
                index: true,
                element: <h1>Home Academic</h1>
            },
            {
                path: 'userprofile',
                element: <UserProfile />
            },
            {
                path: 'courses',
                element: <CourseManagement />
            },
            {
                path: 'pending-courses',
                element: <CourseManagement />
            },
            {
                path: 'courses/detail',
                element: <CourseManagement />
            },
            {
                path: 'courses/lessons',
                element: <CourseManagement />
            }
        ]
    },
    // --- FALLBACK ---
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

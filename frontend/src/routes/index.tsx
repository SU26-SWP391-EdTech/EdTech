import { createBrowserRouter } from 'react-router-dom';
//Landing pages
import { LandingPage } from '../pages/LandingPage/LandingPage';
//Auth pages
import { SignIn } from '../pages/auth/SignIn';
//Role Guards
import { GuestGuard, LearnerGuard, ProviderGuard, AdminGuard, AcademicGuard } from '../components/auth/RoleGuards';
import { SignUp } from '../pages/auth/SignUp';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
//Role navigation pages 
import { GuestLayout } from '../layouts/Dashboard/GuestLayout';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';
import { CourseManagement } from '../pages/course/CourseManagement';

export const router = createBrowserRouter([
    // ==========================================
    // 🌐 NHÓM 1: Giao diện công khai (GUEST LAYOUT)
    // ==========================================
    {
        path: "/",
        element: <GuestLayout />, // Tự động có GuestHeader ở trên
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
        element: <GuestGuard />, // Chỉ cho phép khách chưa đăng nhập truy cập trang login/register
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
        element: (
            <LearnerGuard>
                <DashboardLayout role="learner" />
            </LearnerGuard>
        ), // Tự động có LearnerHeader với màu Crimson
        children: [
            {
                index: true,
                element: <h1>Home learner</h1>
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
        ), // Tự động có ProviderHeader với màu Sky Blue
        children: [
            {
                index: true,
                element: <h1>Home Provider</h1>
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
            }
        ]
    },
    // --- CHO QUẢN LÝ CÁC KHÓA HỌC (COURSE MMANAGER) ---
    {
        path: "/provider/courses",
        element: (
            <ProviderGuard>
                <DashboardLayout role="provider"/>
            </ProviderGuard>
        ),
        children: [
            {
                index: true,
                element: <CourseManagement/>,
            }
        ]
    },
]);

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
import { PlatformSetup } from '../pages/admin/PlatformSetup';

// Learner page
import { LearnerProfile } from '../pages/Users/LearnerProfile';
import { MyLearning } from '../pages/learner/MyLearning';
import { LearnerDashboard } from '../pages/learner/LearnerDashboard';
import { ExplorePage } from '../pages/Users/ExplorePage';
import { LearningPathDetail } from '../pages/LearningPath/LearningPathDetail';
import { ProviderProfile } from '../pages/Users/ProviderProfile';

// User Profile page
import { UserProfile } from '../pages/Users/UserProfile';

// Course pages
import { CourseManagement } from '../pages/Course/CourseManagement';
import { CourseDetail } from '../pages/Course/CourseDetail';
import { CreateCoursePage } from '../pages/Course/createCourse';
import { LearningPathManagement } from '../pages/LearningPath/LearningPathManagement';

// Role navigation pages 
import { GuestLayout } from '../layouts/Dashboard/GuestLayout';
import { DashboardLayout } from '../layouts/Dashboard/Dashboard';

// Role Guards
import { GuestGuard, LearnerGuard, ProviderGuard, AdminGuard, AcademicGuard } from '../components/auth/RoleGuards';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { PlatformSettings } from '../pages/admin/PlatformSettings';


import { useAuthStore } from '../stores/auth.stores';
import { LessonPage } from '../pages/Lesson/LessonPage';
import { CreateLessonPage } from '../pages/Lesson/CreateLesson';

function HomeRedirect() {
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
            return <Navigate to="/academic" replace />;
        default:
            return <LandingPage />;
    }
}

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
                element: <HomeRedirect />
            },
            {
                path: "explore",
                element: <ExplorePage />
            },
            {
                path: "courses/detail",
                element: <CourseDetail />
            },
            {
                path: "learning-path/:id",
                element: <LearningPathDetail />
            },
            {
                path: "providers/:id",
                element: <ProviderProfile />
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
                element: <LearnerDashboard />
            },
            {
                path: 'learnerprofile',
                element: <LearnerProfile />
            },
            {
                path: 'my-learning',
                element: <MyLearning />
            },
            {
                path: 'explore',
                element: <ExplorePage />
            },
            {
                path: 'courses/detail',
                element: <CourseDetail />
            },
            {
                path: 'learning-path/:id',
                element: <LearningPathDetail />
            },
            {
                path: 'providers/:id',
                element: <ProviderProfile />
            },
            {
                path: 'lesson',
                element: <LessonPage />
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
                path: 'courses/create',
                element: <CreateCoursePage />
            },
            {
                path: 'courses/detail',
                element: <CourseDetail />
            },
            {
                path: 'courses/lessons',
                element: <CourseManagement />
            },
            {
                path: 'lessons/create',
                element: <CreateLessonPage />
            },
            {
                path: 'explore',
                element: <ExplorePage />
            },
            {
                path: 'learning-path/:id',
                element: <LearningPathDetail />
            },
            {
                path: 'providers/:id',
                element: <ProviderProfile />
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
                path: 'settings',
                element: <PlatformSettings />
            },
            {
                path: 'providers/:id',
                element: <ProviderProfile />
            },
            {
                path: 'setup',
                element: <PlatformSetup />,
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
                element: <CourseDetail />
            },
            {
                path: 'courses/lessons',
                element: <CourseManagement />
            },
            {
                path: 'learning-path/:id',
                element: <LearningPathDetail />
            },
            {
                path: 'learning-paths',
                element: <LearningPathManagement />
            },
            {
                path: 'providers/:id',
                element: <ProviderProfile />
            }
        ]
    },
    // --- FALLBACK ---
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

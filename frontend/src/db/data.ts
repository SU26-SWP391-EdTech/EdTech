import type { Course } from '../services/course/course.service';
import type { LearningPath } from '../services/learning-path/learning-path.service';
import type { Enrollment } from '../services/enrollment/enrollment.service';

const MOCK_USER = {
    userId: 1,
    fullName: 'Dr. John Doe',
    email: 'john.doe@edtech.com',
    avatar: null,
};

export const MOCK_COURSES: Course[] = [
    {
        courseId: 1,
        title: 'ReactJS Cơ Bản đến Nâng Cao',
        status: 'approved',
        description: 'Làm chủ React hook, Custom Hooks, Redux Toolkit, Context API và tối ưu hiệu năng ứng dụng.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'Vietnamese',
        duration: 12,
        totalLessons: 24,
        enrollmentCount: 1540,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    },
    {
        courseId: 2,
        title: 'Xây Dựng REST APIs với Node.js & Express',
        status: 'approved',
        description: 'Tự tay thiết kế hệ thống RESTful API chuẩn REST, bảo mật với JWT, kết nối MongoDB/PostgreSQL.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'Vietnamese',
        duration: 16,
        totalLessons: 30,
        enrollmentCount: 980,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    },
    {
        courseId: 3,
        title: 'Thiết Kế Giao Diện UI/UX cơ bản Figma',
        status: 'approved',
        description: 'Học cách thiết kế Wireframe, Prototype và tạo UI Components chuẩn Figma từ chuyên gia thiết kế.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'Vietnamese',
        duration: 8,
        totalLessons: 15,
        enrollmentCount: 2200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    },
    {
        courseId: 4,
        title: 'Làm chủ TypeScript cho React',
        status: 'approved',
        description: 'Đi từ cơ bản đến nâng cao TS: Generics, Mapped Types, tsconfig và áp dụng thực tế vào React.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'Vietnamese',
        duration: 10,
        totalLessons: 20,
        enrollmentCount: 1250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    },
    {
        courseId: 5,
        title: 'Docker cho Lập Trình Viên',
        status: 'approved',
        description: 'Container hóa ứng dụng Node/React, thiết lập Docker Compose cho môi trường phát triển và production.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'English',
        duration: 10,
        totalLessons: 18,
        enrollmentCount: 890,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    },
    {
        courseId: 6,
        title: 'GraphQL API Design',
        status: 'approved',
        description: 'Thiết lập Schema, Query, Mutation và Apollo Client để tối ưu hóa truyền tải dữ liệu.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'English',
        duration: 8,
        totalLessons: 14,
        enrollmentCount: 650,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    },
    {
        courseId: 7,
        title: 'Kiểm Thử Ứng Dụng với Vitest',
        status: 'approved',
        description: 'Viết Unit Test, Integration Test và Component Test cho React cực kỳ nhanh chóng bằng Vitest.',
        thumbnailUrl: null,
        projectUrl: null,
        language: 'Vietnamese',
        duration: 5,
        totalLessons: 10,
        enrollmentCount: 420,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: MOCK_USER,
    }
];

export const MOCK_LEARNING_PATHS: LearningPath[] = [
    {
        learningPathId: 1,
        title: 'Frontend Mastery Path',
        description: 'Trở thành Frontend Engineer chuyên nghiệp từ thiết kế UI đến lập trình React/TS.',
        slug: 'frontend-mastery',
        bannerUrl: null,
        level: 'intermediate',
        createdAt: new Date().toISOString(),
        learningPathCourses: [
            { learningPathId: 1, courseId: 3, position: 1, course: MOCK_COURSES[2] },
            { learningPathId: 1, courseId: 1, position: 2, course: MOCK_COURSES[0] },
            { learningPathId: 1, courseId: 4, position: 3, course: MOCK_COURSES[3] }
        ]
    },
    {
        learningPathId: 2,
        title: 'Full-Stack Developer Path',
        description: 'Lộ trình kết hợp tối ưu ReactJS, Node.js API và công cụ containerization Docker.',
        slug: 'full-stack-engineering',
        bannerUrl: null,
        level: 'advanced',
        createdAt: new Date().toISOString(),
        learningPathCourses: [
            { learningPathId: 2, courseId: 1, position: 1, course: MOCK_COURSES[0] },
            { learningPathId: 2, courseId: 2, position: 2, course: MOCK_COURSES[1] },
            { learningPathId: 2, courseId: 5, position: 3, course: MOCK_COURSES[4] }
        ]
    },
    {
        learningPathId: 3,
        title: 'UI/UX Product Design Path',
        description: 'Lộ trình cơ bản làm quen thiết kế giao diện ứng dụng và trải nghiệm người dùng.',
        slug: 'product-design',
        bannerUrl: null,
        level: 'beginner',
        createdAt: new Date().toISOString(),
        learningPathCourses: [
            { learningPathId: 3, courseId: 3, position: 1, course: MOCK_COURSES[2] }
        ]
    }
];

export const MOCK_ENROLLMENTS: Enrollment[] = [
    {
        enrollmentId: 101,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 52,
        lastAccessedAt: new Date().toISOString(),
        completedAt: null,
        expiresAt: null,
        course: MOCK_COURSES[0],
    },
    {
        enrollmentId: 102,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 31,
        lastAccessedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: null,
        expiresAt: null,
        course: MOCK_COURSES[1],
    },
    {
        enrollmentId: 103,
        enrolledAt: new Date().toISOString(),
        status: 'completed',
        progress: 100,
        lastAccessedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: null,
        course: MOCK_COURSES[2],
    }
];

export const MOCK_PROFILE = {
    fullName: 'Nguyễn Văn Learner',
    email: 'learner@edtech.com',
    streakCount: 12,
    completedCourses: 1,
    learningHours: 124,
    enrolledPaths: 2,
};

export const MOCK_LEARNER_PROFILE_FULL = {
    fullName: 'Nguyễn Văn Learner',
    email: 'learner@edtech.com',
    avatarUrl: null,
    learningGoal: 'Master React and Node.js for Fullstack',
    level: 'Intermediate',
    createdAt: '2026-06-01T08:00:00Z',
    bio: 'Học viên năng nổ học hỏi công nghệ mới.',
};

export const MOCK_ACADEMIC_PROFILE = {
    fullName: 'Trần Thị Provider',
    email: 'provider@edtech.com',
    avatarUrl: null,
    expertise: 'Software Architecture & React',
    experienceYears: 8,
    createdAt: '2026-05-15T10:00:00Z',
    bio: 'Dạy học với cả trái tim và kinh nghiệm thực chiến.',
};

export const MOCK_USERS_BACKEND = [
    {
        userId: 1,
        fullName: 'Nguyễn Văn Learner',
        email: 'learner@edtech.com',
        role: { roleName: 'learner' },
        isEmailVerified: true,
        createdAt: '2026-06-01T08:00:00Z',
        updatedAt: '2026-06-07T12:00:00Z',
        avatar: null
    },
    {
        userId: 2,
        fullName: 'Trần Thị Provider',
        email: 'provider@edtech.com',
        role: { roleName: 'course provider' },
        isEmailVerified: true,
        createdAt: '2026-05-15T10:00:00Z',
        updatedAt: '2026-06-05T09:30:00Z',
        avatar: null
    },
    {
        userId: 3,
        fullName: 'Lê Văn Manager',
        email: 'manager@edtech.com',
        role: { roleName: 'academic manager' },
        isEmailVerified: true,
        createdAt: '2026-04-20T14:00:00Z',
        updatedAt: '2026-06-01T11:15:00Z',
        avatar: null
    },
    {
        userId: 4,
        fullName: 'Phạm Hồng Admin',
        email: 'admin@edtech.com',
        role: { roleName: 'admin' },
        isEmailVerified: true,
        createdAt: '2026-01-10T09:00:00Z',
        updatedAt: '2026-06-07T18:00:00Z',
        avatar: null
    },
    {
        userId: 5,
        fullName: 'Nguyễn Thị Hoa',
        email: 'hoa.nt@example.com',
        role: { roleName: 'learner' },
        isEmailVerified: false,
        createdAt: '2026-06-06T15:45:00Z',
        updatedAt: '2026-06-06T15:45:00Z',
        avatar: null
    }
];

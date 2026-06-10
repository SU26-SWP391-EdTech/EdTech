-- Mock data for the EdTech NestJS/MySQL backend.
-- Run after the backend has started once, because TypeORM synchronize=true creates the tables.
-- Demo password for every seeded non-admin account: Password@123
-- This file keeps the default admin account created by the backend.

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM learning_path_courses;
DELETE FROM enrollments;
DELETE FROM lessons;
DELETE FROM courses;
DELETE FROM learner_profiles
WHERE user_id IN (
  SELECT user_id FROM users
  WHERE email IN ('manager@edtech.com', 'provider@edtech.com', 'learner@edtech.com', 'bao.learner@edtech.com')
);
DELETE FROM user_profiles
WHERE user_id IN (
  SELECT user_id FROM users
  WHERE email IN ('manager@edtech.com', 'provider@edtech.com', 'learner@edtech.com', 'bao.learner@edtech.com')
);
DELETE FROM users
WHERE email IN ('manager@edtech.com', 'provider@edtech.com', 'learner@edtech.com', 'bao.learner@edtech.com');
DELETE FROM platform_settings;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO roles (role_name) VALUES
  ('admin'),
  ('academic manager'),
  ('course provider'),
  ('learner')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

SET @admin_role_id = (SELECT role_id FROM roles WHERE role_name = 'admin' LIMIT 1);
SET @manager_role_id = (SELECT role_id FROM roles WHERE role_name = 'academic manager' LIMIT 1);
SET @provider_role_id = (SELECT role_id FROM roles WHERE role_name = 'course provider' LIMIT 1);
SET @learner_role_id = (SELECT role_id FROM roles WHERE role_name = 'learner' LIMIT 1);

INSERT INTO users (
  full_name,
  email,
  password,
  avatar_url,
  role_id,
  is_email_verified,
  email_verification_token,
  email_verification_expires_at,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (
    'An Nguyen',
    'manager@edtech.com',
    '$2b$10$7BfJHvbwa0LeOjT/hL65y.VD.rNjNwbSskrY3zwqT5zITkDXuwb4y',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    @manager_role_id,
    1,
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Minh Tran',
    'provider@edtech.com',
    '$2b$10$7BfJHvbwa0LeOjT/hL65y.VD.rNjNwbSskrY3zwqT5zITkDXuwb4y',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    @provider_role_id,
    1,
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Linh Pham',
    'learner@edtech.com',
    '$2b$10$7BfJHvbwa0LeOjT/hL65y.VD.rNjNwbSskrY3zwqT5zITkDXuwb4y',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    @learner_role_id,
    1,
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL
  ),
  (
    'Bao Le',
    'bao.learner@edtech.com',
    '$2b$10$7BfJHvbwa0LeOjT/hL65y.VD.rNjNwbSskrY3zwqT5zITkDXuwb4y',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    @learner_role_id,
    1,
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL
  );

SET @manager_id = (SELECT user_id FROM users WHERE email = 'manager@edtech.com' LIMIT 1);
SET @provider_id = (SELECT user_id FROM users WHERE email = 'provider@edtech.com' LIMIT 1);
SET @learner_id = (SELECT user_id FROM users WHERE email = 'learner@edtech.com' LIMIT 1);
SET @second_learner_id = (SELECT user_id FROM users WHERE email = 'bao.learner@edtech.com' LIMIT 1);

INSERT INTO user_profiles (user_id, expertise, experience_years, created_at, updated_at) VALUES
  (@manager_id, 'Curriculum design, quality assurance, course review', 6, NOW(), NOW()),
  (@provider_id, 'Frontend Engineering, Backend APIs, Cloud Deployment', 5, NOW(), NOW()),
  (@learner_id, 'React beginner, JavaScript fundamentals', 1, NOW(), NOW()),
  (@second_learner_id, 'Java backend learner, database fundamentals', 1, NOW(), NOW());

INSERT INTO learner_profiles (user_id, learning_goal, level, bio) VALUES
  (
    @learner_id,
    'Become a confident frontend developer and build production-ready React applications.',
    'beginner',
    'I am learning React, TypeScript, and practical web application workflows.'
  ),
  (
    @second_learner_id,
    'Build REST APIs with Java Spring Boot and understand database design.',
    'beginner',
    'I enjoy backend development and want a structured learning path.'
  );

INSERT INTO platform_settings (
  setting_id,
  platform_name,
  platform_email,
  logo_url,
  banner_url,
  description,
  created_at
) VALUES
  (
    1,
    'EdTech Learning Platform',
    'support@edtech.com',
    'https://placehold.co/160x160?text=EdTech',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    'A learning platform for guided courses, roadmaps, and learner progress tracking.',
    NOW()
  );

INSERT INTO courses (
  course_id,
  user_id,
  title,
  status,
  description,
  thumbnail_url,
  project_url,
  language,
  duration,
  total_lessons,
  created_at,
  updated_at,
  reviewed_by,
  enrollment_count
) VALUES
  (
    1,
    @provider_id,
    'React Fundamentals',
    'approved',
    'Learn components, props, state, hooks, and routing by building practical React screens.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    'https://github.com/example/react-fundamentals',
    'English',
    18,
    4,
    NOW(),
    NOW(),
    @manager_id,
    2
  ),
  (
    2,
    @provider_id,
    'TypeScript for Frontend Developers',
    'approved',
    'Use TypeScript to model UI data, API responses, forms, and reusable React components.',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
    'https://github.com/example/typescript-frontend',
    'English',
    14,
    4,
    NOW(),
    NOW(),
    @manager_id,
    1
  ),
  (
    3,
    @provider_id,
    'REST API Integration with React',
    'approved',
    'Connect React applications to backend APIs using axios, auth tokens, loading states, and error handling.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    'https://github.com/example/react-api-integration',
    'English',
    16,
    4,
    NOW(),
    NOW(),
    @manager_id,
    1
  ),
  (
    4,
    @provider_id,
    'Java Spring Boot REST APIs',
    'pending',
    'Design REST APIs, validate DTOs, secure endpoints, and connect Spring Boot services to a relational database.',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    'https://github.com/example/spring-boot-rest',
    'English',
    24,
    4,
    NOW(),
    NOW(),
    NULL,
    0
  ),
  (
    5,
    @provider_id,
    'MySQL Database Essentials',
    'approved',
    'Understand relational modeling, SQL queries, joins, constraints, indexing, and practical schema design.',
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d',
    'https://github.com/example/mysql-essentials',
    'English',
    12,
    4,
    NOW(),
    NOW(),
    @manager_id,
    1
  );

INSERT INTO lessons (
  lesson_id,
  course_id,
  title,
  description,
  video_url,
  video_duration,
  content,
  created_at,
  updated_at
) VALUES
  (1, 1, '[Video] React Project Setup', 'Create a Vite React project and understand the file structure.', 'https://www.youtube.com/embed/SqcY0GlETPk', 900, NULL, NOW(), NOW()),
  (2, 1, '[Doc] Components and Props Guide', 'Read how to break UI into reusable components and pass data with props.', NULL, NULL, 'DOC: Components should stay small, reusable, and focused on one UI responsibility. Practice by creating CourseCard, LessonRow, and DashboardStatCard components with typed props.', NOW(), NOW()),
  (3, 1, '[Quiz] State and Events Checkpoint', 'Check your understanding of useState and event handlers.', NULL, NULL, 'QUIZ: 1) What hook stores local component state? 2) Why should event handlers update state immutably? 3) When should derived values be computed instead of stored?', NOW(), NOW()),
  (4, 1, '[Assignment] React Router Mini Project', 'Build a small routed learning dashboard.', NULL, NULL, 'ASSIGNMENT: Create three routes: dashboard, course detail, and lesson page. Add navigation buttons and submit a short summary of how route params are used.', NOW(), NOW()),
  (5, 2, '[Video] Typing API Responses', 'Define interfaces for backend data returned from REST APIs.', 'https://www.youtube.com/embed/BCg4U1FzODs', 1000, NULL, NOW(), NOW()),
  (6, 2, '[Doc] Typing React Props', 'Use TypeScript for component contracts.', NULL, NULL, 'DOC: Prefer explicit interfaces for reusable components. Keep optional props marked with ? and use union types for limited UI states.', NOW(), NOW()),
  (7, 2, '[Quiz] Union Types and Status Values', 'Represent fixed backend states safely.', NULL, NULL, 'QUIZ: 1) Create a CourseStatus union. 2) Explain why string unions are safer than plain string. 3) Which status should represent a reviewed course?', NOW(), NOW()),
  (8, 2, '[Assignment] Safe Form DTO', 'Type form state and submit payloads.', NULL, NULL, 'ASSIGNMENT: Build a typed CreateCourseDto object from form state. Validate title, optional description, language, and duration before submitting.', NOW(), NOW()),
  (9, 3, '[Video] Axios Instance Setup', 'Centralize base URL and headers.', 'https://www.youtube.com/embed/6LyagkoRWYA', 800, NULL, NOW(), NOW()),
  (10, 3, '[Doc] Auth Token Interceptor', 'Attach Bearer tokens automatically to protected requests.', NULL, NULL, 'DOC: Use a shared axios instance. Read the token from localStorage, attach Authorization: Bearer token, and handle 401 responses in one place.', NOW(), NOW()),
  (11, 3, '[Quiz] Loading and Error States', 'Handle API lifecycle states in hooks.', NULL, NULL, 'QUIZ: 1) What state is shown while an API request is pending? 2) Where should errors be caught? 3) Why should components avoid duplicating fetch logic?', NOW(), NOW()),
  (12, 3, '[Assignment] Dashboard Data Mapping', 'Map backend data into learner dashboard cards.', NULL, NULL, 'ASSIGNMENT: Fetch profile, enrollments, and learning paths. Transform them into activeStats, continueCourses, activePath, and roadmapNodes for the learner dashboard.', NOW(), NOW()),
  (13, 4, '[Video] Spring Boot Controllers', 'Create REST controllers and route handlers.', 'https://www.youtube.com/embed/9SGDpanrc8U', 1200, NULL, NOW(), NOW()),
  (14, 4, '[Doc] Service Layer Design', 'Keep business logic outside controllers.', NULL, NULL, 'DOC: Controllers should parse requests and return responses. Services should own business rules, repository calls, and transaction boundaries.', NOW(), NOW()),
  (15, 4, '[Quiz] Validation and Exceptions', 'Validate input and return useful errors.', NULL, NULL, 'QUIZ: 1) Why validate DTOs before saving? 2) What status code should invalid input return? 3) When should a NotFound error be thrown?', NOW(), NOW()),
  (16, 4, '[Assignment] Database Persistence API', 'Persist entities into a relational database.', NULL, NULL, 'ASSIGNMENT: Design an endpoint that creates a course, validates required fields, saves it, and returns the created resource with its generated id.', NOW(), NOW()),
  (17, 5, '[Video] Tables and Constraints', 'Create relational tables with primary and foreign keys.', 'https://www.youtube.com/embed/7S_tz1z_5bA', 980, NULL, NOW(), NOW()),
  (18, 5, '[Doc] Select Queries and Joins', 'Read data across related tables.', NULL, NULL, 'DOC: Use joins to combine users, enrollments, courses, and learning paths. Start with INNER JOIN for required relations and LEFT JOIN for optional relations.', NOW(), NOW()),
  (19, 5, '[Quiz] Indexes and Performance', 'Improve query performance with indexes.', NULL, NULL, 'QUIZ: 1) Which columns are good index candidates? 2) Why can too many indexes slow writes? 3) How do foreign keys relate to lookup speed?', NOW(), NOW()),
  (20, 5, '[Assignment] Seed Data Workflow', 'Prepare repeatable seed scripts for development.', NULL, NULL, 'ASSIGNMENT: Write a seed SQL file that inserts roles, users, courses, lessons, learning paths, and enrollments in foreign-key-safe order.', NOW(), NOW());

INSERT INTO learning_paths (
  learning_path_id,
  title,
  description,
  slug,
  banner_url,
  level,
  editted_by,
  created_at
) VALUES
  (
    1,
    'Frontend Developer Roadmap',
    'A practical sequence for learning React, TypeScript, and API integration.',
    'frontend-developer-roadmap',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'beginner',
    @manager_id,
    NOW()
  ),
  (
    2,
    'Backend API Foundations',
    'A structured path for learning REST APIs, MySQL, and backend service design.',
    'backend-api-foundations',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
    'beginner',
    @manager_id,
    NOW()
  );

INSERT INTO learning_path_courses (
  learning_path_id,
  course_id,
  position,
  editted_by
) VALUES
  (1, 1, 1, @manager_id),
  (1, 2, 2, @manager_id),
  (1, 3, 3, @manager_id),
  (2, 5, 1, @manager_id),
  (2, 4, 2, @manager_id);

INSERT INTO enrollments (
  enrollments_id,
  user_id,
  course_id,
  enrolled_at,
  status,
  progress,
  last_accessed_at,
  completed_at,
  expires_at
) VALUES
  (1, @second_learner_id, 5, DATE_SUB(NOW(), INTERVAL 7 DAY), 'active', 35, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, NULL);

ALTER TABLE platform_settings AUTO_INCREMENT = 2;
ALTER TABLE courses AUTO_INCREMENT = 6;
ALTER TABLE lessons AUTO_INCREMENT = 21;
ALTER TABLE learning_paths AUTO_INCREMENT = 3;
ALTER TABLE enrollments AUTO_INCREMENT = 2;

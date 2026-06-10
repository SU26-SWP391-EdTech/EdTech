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
  (1, 1, 'React Project Setup', 'Create a Vite React project and understand the file structure.', 'https://example.com/videos/react-setup', 900, 'Install dependencies, run the dev server, and inspect the starter app.', NOW(), NOW()),
  (2, 1, 'Components and Props', 'Break UI into reusable components and pass data with props.', 'https://example.com/videos/react-components', 1200, 'Create card, list, and section components with typed props.', NOW(), NOW()),
  (3, 1, 'State and Events', 'Use useState and event handlers for interactive UI.', 'https://example.com/videos/react-state', 1100, 'Build small interactions using controlled state.', NOW(), NOW()),
  (4, 1, 'React Router Basics', 'Create routes and navigate between pages.', 'https://example.com/videos/react-router', 1000, 'Define routes, nested layouts, and navigation actions.', NOW(), NOW()),
  (5, 2, 'Typing API Responses', 'Define interfaces for backend data.', 'https://example.com/videos/ts-api-types', 1000, 'Model API responses with TypeScript interfaces.', NOW(), NOW()),
  (6, 2, 'Typing React Props', 'Use TypeScript for component contracts.', 'https://example.com/videos/ts-props', 950, 'Create reusable components with clear prop types.', NOW(), NOW()),
  (7, 2, 'Union Types and Status Values', 'Represent fixed backend states safely.', 'https://example.com/videos/ts-unions', 870, 'Use unions for statuses like draft, pending, approved, rejected.', NOW(), NOW()),
  (8, 2, 'Safe Form Data', 'Type form state and submit payloads.', 'https://example.com/videos/ts-forms', 1050, 'Build typed form handlers and DTO payloads.', NOW(), NOW()),
  (9, 3, 'Axios Instance Setup', 'Centralize base URL and headers.', 'https://example.com/videos/axios-instance', 800, 'Create a shared axios client with Content-Type defaults.', NOW(), NOW()),
  (10, 3, 'Auth Token Interceptor', 'Attach Bearer tokens automatically.', 'https://example.com/videos/auth-interceptor', 960, 'Read token from storage and add Authorization headers.', NOW(), NOW()),
  (11, 3, 'Loading and Error States', 'Handle API lifecycle states in hooks.', 'https://example.com/videos/loading-errors', 930, 'Show loading UI, catch errors, and keep components clean.', NOW(), NOW()),
  (12, 3, 'Dashboard Data Mapping', 'Map backend data into learner dashboard cards.', 'https://example.com/videos/dashboard-mapping', 990, 'Convert enrollments and learning paths into display-ready view models.', NOW(), NOW()),
  (13, 4, 'Spring Boot Controllers', 'Create REST controllers and route handlers.', 'https://example.com/videos/spring-controllers', 1200, 'Define endpoints with request and response DTOs.', NOW(), NOW()),
  (14, 4, 'Service Layer Design', 'Keep business logic outside controllers.', 'https://example.com/videos/service-layer', 1100, 'Structure service classes and repository calls.', NOW(), NOW()),
  (15, 4, 'Validation and Exceptions', 'Validate input and return useful errors.', 'https://example.com/videos/validation-exceptions', 1000, 'Use DTO validation and exception handlers.', NOW(), NOW()),
  (16, 4, 'Database Persistence', 'Persist entities into a relational database.', 'https://example.com/videos/persistence', 1250, 'Map entities, repositories, and transactions.', NOW(), NOW()),
  (17, 5, 'Tables and Constraints', 'Create relational tables with primary and foreign keys.', 'https://example.com/videos/mysql-tables', 980, 'Understand constraints and referential integrity.', NOW(), NOW()),
  (18, 5, 'Select Queries and Joins', 'Read data across related tables.', 'https://example.com/videos/mysql-joins', 1150, 'Practice inner joins and left joins for dashboard data.', NOW(), NOW()),
  (19, 5, 'Indexes and Performance', 'Improve query performance with indexes.', 'https://example.com/videos/mysql-indexes', 900, 'Identify columns that benefit from indexing.', NOW(), NOW()),
  (20, 5, 'Seed Data Workflow', 'Prepare repeatable seed scripts for development.', 'https://example.com/videos/mysql-seeding', 850, 'Use insert scripts safely in local and staging databases.', NOW(), NOW());

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

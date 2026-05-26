# Backend Folder Structure Overview

This document explains the structure of the `backend/monolithic` folder for the EdTech project.

## Root of `backend/monolithic`

- `.env` / `.env.example`
  - Environment variable files for local configuration and example values.
- `.gitignore`
  - Files and directories that should not be committed.
- `.prettierrc`
  - Prettier formatting configuration.
- `dist/`
  - Compiled output directory generated after building the application.
- `eslint.config.mjs`
  - ESLint configuration for linting the backend code.
- `nest-cli.json`
  - NestJS CLI configuration file.
- `package.json`
  - Node dependencies, scripts, and backend project metadata.
- `package-lock.json`
  - Exact dependency versions installed for reproducible builds.
- `README.md`
  - Project-specific backend documentation.
- `src/`
  - Main source code for the backend application.
- `test/`
  - Integration or end-to-end test files.
- `tsconfig.json`
  - TypeScript compiler settings for development.
- `tsconfig.build.json`
  - TypeScript compiler settings for production builds.

## `src/`

The `src` folder is the heart of the backend and contains all application code.

### `src/main.ts`

- Application entry point.
- Boots the NestJS application, applies global middleware, and starts the HTTP server.

### `src/app.module.ts`

- Root application module.
- Imports and registers feature modules and global providers.

### `src/common/`

Shared utilities, constants, decorators, guards, enums, and strategies live here.

- `common.module.ts`
  - Re-exports shared providers and modules used across the application.
- `constants/`
  - Application-wide constant values, such as JWT and role keys.
- `decorators/`
  - Custom decorators for request handling, authentication contexts, and route metadata.
- `enums/`
  - Shared enumeration types used in multiple modules.
- `guards/`
  - Authentication and authorization guards, such as JWT and role guards.
- `helpers/`
  - Utility helpers for shared logic, like JWT token handling.
- `strategies/`
  - Passport strategies used by NestJS for authentication.

### `src/modules/`

Feature modules implementing the domain logic of the application.
Each module typically includes its controller, service, DTOs, and entity definitions.

- `auth/`
  - Authentication logic, login routes, and token generation.
- `course-providers/`
  - Management of course provider entities and operations.
- `courses/`
  - Course management features.
- `enrollments/`
  - Enrollment flows and learner-course relationships.
- `join-organization-application/`
  - Organization join request handling.
- `learners/`
  - Learner-related endpoints and business logic.
- `learning-paths/`
  - Learning path definitions and workflows.
- `lessons/`
  - Lesson creation, retrieval, and updates.
- `organization-member-profiles/`
  - Profiles for organization members.
- `organization-registration-application/`
  - Organization registration and approval workflows.
- `organizations/`
  - Organization management logic.
- `roles/`
  - Role definitions and role-based access controls.
- `users/`
  - User account management and user-related operations.

## How it fits together

- `main.ts` starts the NestJS application.
- `app.module.ts` imports the feature modules and shared `common` module.
- Feature modules are grouped under `src/modules/`.
- Shared cross-cutting concerns are in `src/common/`.
- Tests are kept under `test/` and compiled output goes into `dist/`.

## Summary

The backend is organized as a NestJS monolithic application with:
- a clean entry point (`src/main.ts`)
- a central module registry (`src/app.module.ts`)
- shared infrastructure in `src/common/`
- domain-specific features in `src/modules/`
- supporting config and tooling at the repository root

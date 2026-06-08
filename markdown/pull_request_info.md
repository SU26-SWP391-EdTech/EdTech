# Pull Request / Issue Description

## 📋 Description of Changes
This pull request integrates the unified **Explore Page** across all three major user roles (Guest, Learner, and Course Provider) and introduces dynamic, role-based header navigation, backend catalog public access decorators, modular frontend API services, and responsive grid layout enhancements.

---

## 🚀 Key Features Implemented

### 1. Unified Explore Page Layout (`ExplorePage.tsx`)
*   **Dynamic Data Loading**: Connects directly to backend `GET /courses` and `GET /learning-paths` endpoints (replacing previous dummy mock arrays).
*   **Grid Layout Optimization**:
    *   Removed nested `grid-cols-12` container wrapper allowing full-width presentation.
    *   Configured **Courses** (Recommended & Trending sections) to render **5 columns per row** (`grid-cols-5`).
    *   Configured **Learning Paths** to render **3 columns per row** (`grid-cols-3`).
*   **Role-Based Enrollment Logic**:
    *   **Guest**: Redirects immediately to `/login` showing an warning toast request.
    *   **Learner**: Invokes API enrollment endpoint and dynamically changes the button state to **"Already Enrolled"** or **"Enrolled"**.
    *   **Course Provider**: Displays an alert toast blocking the enrollment action.

### 2. Frontend Navigation & Router Synchronization
*   Configured routing in `routes/index.tsx` for `/explore` (Guest), `/learner/explore` (Learner), and `/provider/explore` (Provider).
*   Synced navigation menus in `GuestHeader`, `LearnerHeader`, and `ProviderHeader` to track active URL paths using React Router hooks (`useNavigate`, `useLocation`).
*   Removed internal headers from the Explore views to respect layout nesting.

### 3. Backend REST Catalog Endpoints Enablement
*   Applied `@Public()` decorator to `CoursesController` (search and findOne endpoints) and `LearningPathsController` (listing endpoints) to support unauthenticated guest views without 401 response loops.

### 4. Code Modularization & Clean Services
*   Decompiled and refactored the old monolithic `user.service.ts` into specialized API folders:
    *   `course/` (Course Service)
    *   `enrollment/` (Enrollment Service)
    *   `learner/` (Learner Service)
    *   `learning-path/` (Learning Path Service)
    *   `lesson/` (Lesson Service)
    *   `platform-setting/` (Platform Settings Service)
    *   `user/` (User Service)

### 5. Platform Architecture Documentation
*   Generated a comprehensive **Package Diagram** (`markdown/package_diagram.md`) utilizing Mermaid modeling.
*   Generated detailed **Functional Requirements** (`markdown/functional_requirements.md`) with mock layouts and specifications.

---

## 🛠️ Chi tiết các tệp thay đổi (Files Modified Details)

### 1. Backend Monolithic Module:
*   `backend/monolithic/src/modules/courses/courses.controller.ts`
    *   Thêm `@Public()` decorator vào endpoint tìm kiếm (`searchCourses`) và lấy chi tiết khóa học (`findOne`), giúp Guest có thể xem danh sách khóa học mà không bị lỗi 401.
*   `backend/monolithic/src/modules/learning-paths/learning-paths.controller.ts`
    *   Thêm `@Public()` decorator cho các API xem danh sách và chi tiết lộ trình học.
*   `backend/monolithic/src/modules/learning-paths/learning-paths.service.ts`
    *   Cập nhật hàm truy vấn để tự động nạp kèm danh sách khóa học (`learningPathCourses.course`) của lộ trình học.
*   `backend/monolithic/src/modules/mail/mail.service.ts` & `entities/user.entity.ts` & `enrollments.repository.ts` & `learning-paths.repository.ts`
    *   Cấu hình các mối quan hệ (relations), điều chỉnh các hàm lưu trữ truy vấn cơ sở dữ liệu phù hợp với phân trang thực tế.

### 2. Frontend Application Module:
*   `frontend/src/pages/Users/ExplorePage.tsx` [NEW]
    *   Tạo mới trang Explore chung cho cả 3 vai trò (Guest, Learner, Provider).
    *   Gọi API thực để lấy thông tin khóa học và lộ trình học.
    *   Chia cột hiển thị: **5 khóa học / dòng** và **3 lộ trình học / dòng**.
    *   Logic nút Enroll: Guest chuyển hướng đến trang `/login`, Learner gọi API đăng ký và cập nhật giao diện, Provider hiển thị thông báo toast lỗi.
*   `frontend/src/pages/learner/MyLearning.tsx`
    *   Cập nhật giao diện rộng 12 cột, ẩn đi cột thông số phụ bên phải và các phần Saved Content, History không sử dụng để giao diện học tập của Learner trông rộng rãi, chuyên nghiệp hơn.
*   `frontend/src/routes/index.tsx`
    *   Cấu hình các Route `/explore` (Guest), `/learner/explore` (Learner), và `/provider/explore` (Provider) trỏ chung vào component `ExplorePage`.
*   `frontend/src/components/header/roleNav/` (`GuestHeader.tsx`, `LearnerHeader.tsx`, `ProviderHeader.tsx`)
    *   Sử dụng các hook `useLocation` và `useNavigate` để đồng bộ hóa trạng thái active (in đậm) của liên kết "/explore" trên Header dựa trên URL hiện tại.
*   `frontend/src/components/auth/RoleGuards.tsx` & `header/config/nav-config.tsx`
    *   Điều chỉnh cấu hình điều hướng và phân quyền để định tuyến chính xác các Dashboard con.
*   `frontend/src/services/` [NEW / REFACTORED]
    *   Xóa file monolithic `user.service.ts` cũ.
    *   Tách thành các thư mục dịch vụ API chuyên biệt độc lập: `course`, `enrollment`, `learner`, `learning-path`, `lesson`, `platform-setting`, `user`.
*   `frontend/src/pages/Users/LearnerProfile.tsx`, `UserProfile.tsx`, `admin/AdminProfile.tsx`, `admin/UserManagement.tsx`
    *   Cập nhật lại đường dẫn import các API services mới sau khi tái cấu trúc.

---

## 📝 Commit Writing Guide (Conventional Commits)

To commit this work professionally in Git, please follow the **Conventional Commits** standard:

### 1. Recommended Commit Split (Recommended for clean histories)

*   **Commit 1 (Backend Endpoint Access)**:
    ```bash
    git add backend/monolithic/
    git commit -m "feat(backend): add public decorator for courses and learning-paths catalog"
    ```
*   **Commit 2 (Frontend Services Refactoring)**:
    ```bash
    git add frontend/src/services/
    git commit -m "refactor(frontend): split monolithic user service into modular API sub-services"
    ```
*   **Commit 3 (Explore Page & Layout Integrations)**:
    ```bash
    git add frontend/src/pages/ Users/ components/ routes/
    git commit -m "feat(frontend): integrate unified explore page with role-based headers and grid optimization"
    ```
*   **Commit 4 (Documentation & Architecture)**:
    ```bash
    git add markdown/ package_diagram.md functional_requirements.md
    git commit -m "docs: generate system package diagram and explore functional requirements"
    ```

### 2. Single Commit (If committing everything at once)
```bash
git add .
git commit -m "feat(explore): integrate dynamic multi-role explore page with responsive grid layout and backend public access"
```

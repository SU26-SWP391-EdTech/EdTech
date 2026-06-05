# 📘 HƯỚNG DẪN KIẾN TRÚC & CẤU TRÚC THƯ MỤC FRONTEND

Tài liệu này cung cấp cái nhìn toàn diện về cấu trúc thư mục, kiến trúc dự án và chức năng của từng thành phần trong mã nguồn Frontend dự án EdTech. Giao diện được xây dựng bằng **React 18**, **TypeScript**, **Vite**, **Zustand** (quản lý state toàn cục), và **TailwindCSS** (styling).

---

## 📂 1. Sơ đồ Cấu trúc Thư mục Tổng quan

Dưới đây là cây thư mục chính của dự án Frontend nằm trong thư mục `frontend/src`:

```bash
src/
├── assets/             # 🎨 Tài nguyên tĩnh (Hình ảnh, logo, svg, v.v.)
├── components/         # 🧱 Các Component giao diện nhỏ, tái sử dụng cao
│   ├── auth/           #   - FormInput, CustomCheckbox, PrimaryButton cho Auth
│   └── header/         #   - Các Header chuyên biệt theo từng vai trò (Role)
│       ├── config/     #     * nav-config.tsx (Cấu hình menu điều hướng)
│       ├── roleNav/    #     * GuestHeader, LearnerHeader, AdminHeader, v.v.
│       └── shared/     #     * Logo, SearchBar, NotifBell dùng chung
├── contexts/           # 🌐 React Contexts quản lý state nội bộ của cây component
├── hooks/              # ⚓ Custom Hooks tùy chỉnh tái sử dụng logic React
├── layouts/            # 📐 Khung bao bọc giao diện lớn (Layouts)
│   ├── Auth/           #   - SplitAuthLayout, CenteredAuthLayout
│   └── Dashboard/      #   - GuestLayout (Landing), DashboardLayout (Dashboard chính)
├── lib/                # ⚙️ Cấu hình thư viện bên thứ ba (Axios Client)
│   └── axios.ts        #   - Axios interceptors xử lý Token và đồng bộ 401
├── pages/              # 📄 Các màn hình (Pages) chính của ứng dụng
│   ├── auth/           #   - Màn hình Login, SignUp, VerifyEmail
│   ├── dashboard/      #   - Trang Dashboard chung sau đăng nhập
│   └── (modules)/      #   - Các màn hình chuyên biệt (Learner, Provider, Admin...)
├── routes/             # 🛣️ Định tuyến & Phân quyền trang (Routing & Guards)
│   ├── index.tsx       #   - Khai báo Router, Route Guards bảo vệ các tuyến đường
│   └── routeGuards.tsx #   - GuestGuard, LearnerGuard, ProviderGuard, v.v.
├── services/           # 🔌 Lớp kết nối API mạng (Services)
│   └── auth/           #   - Module Auth Service chứa auth.service.ts gọi API
├── stores/             # 💾 Quản lý State toàn cục bằng Zustand
│   └── auth.stores.ts  #   - Lưu trữ phiên đăng nhập, thông tin user và token
├── types/              # 🏷️ Các định nghĩa kiểu dữ liệu (TypeScript Interfaces/Types)
└── utils/              # 🛠️ Các hàm tiện ích bổ trợ (Utilities)
```

---

## 🔍 2. Chức năng Chi tiết của Từng Thư mục

### 🎨 2.1. `src/assets`
* **Vai trò:** Nơi lưu trữ tất cả các tệp tĩnh không thay đổi trong quá trình chạy ứng dụng.
* **Nội dung:** Ảnh minh họa, biểu tượng SVG tùy biến, tệp font chữ hoặc ảnh đại diện mặc định.

### 🧱 2.2. `src/components`
* **Vai trò:** Chứa các Component UI độc lập, không gắn liền với một trang cụ thể, có thể tái sử dụng ở nhiều nơi.
* **Cấu trúc con:**
  * `auth/`: Chứa các ô nhập liệu dạng Form, nút nhấn đặc trưng của luồng đăng ký/đăng nhập.
  * `header/`: Chứa toàn bộ hệ thống thanh điều hướng phân quyền (Role-based Navigation). Các file thiết kế riêng cho từng vai trò được đặt trong `roleNav/`, các cấu phần nhỏ dùng chung như `Logo`, `SearchBar`, `NotifBell` được đặt trong `shared/`, và menu điều hướng tĩnh được cấu hình tại `config/nav-config.tsx`.

### 🌐 2.3. `src/contexts`
* **Vai trò:** Nơi định nghĩa các React Context để chia sẻ dữ liệu hoặc trạng thái nhẹ cho các Component cấp dưới mà không cần dùng đến Zustand.
* **Ứng dụng:** Theme chế độ sáng/tối (Dark/Light), cài đặt ngôn ngữ cục bộ, v.v.

### ⚓ 2.4. `src/hooks`
* **Vai trò:** Chứa các React Custom Hooks để tách biệt logic xử lý ra khỏi giao diện hiển thị, giúp code ngắn gọn và dễ bảo trì hơn.
* **Ví dụ:** `useDebounce` (tránh gọi API liên tục khi gõ tìm kiếm), `useWindowSize` (lắng nghe kích thước màn hình).

### 📐 2.5. `src/layouts`
* **Vai trò:** Định nghĩa khung bố cục lớn của các trang. Layout quyết định vị trí hiển thị của Header, Sidebar, Footer và phần nội dung động (thông qua `<Outlet />`).
* **Ví dụ:**
  * `SplitAuthLayout`: Thiết kế chia đôi màn hình (một bên là Form, một bên là Banner) dùng cho Đăng nhập/Đăng ký.
  * `DashboardLayout`: Giao diện làm việc chính, tự động kiểm tra vai trò của người dùng để render Header tương ứng và bao bọc các trang nội dung bên trong.

### ⚙️ 2.6. `src/lib`
* **Vai trò:** Cấu hình và khởi tạo các thư viện bên thứ ba được sử dụng trong dự án.
* **Ví dụ:** `axios.ts` thiết lập một Axios client gọi là `api` có cấu hình `baseURL` và tự động gắn Token dạng `Bearer` vào Request Header, đồng thời xử lý lỗi `401` để tự động đăng xuất người dùng khi token hết hạn.

### 📄 2.7. `src/pages`
* **Vai trò:** Nơi chứa giao diện hoàn chỉnh của từng trang ứng dụng tương ứng với các URL định tuyến. Các file ở đây sẽ ghép nối các Component nhỏ lại và gọi Action từ Store để hiển thị dữ liệu.
* **Cấu trúc:** Phân nhóm theo thư mục chức năng, ví dụ `/auth/Login.tsx`, `/auth/VerifyEmail.tsx`.

### 🛣️ 2.8. `src/routes`
* **Vai trò:** Quản lý toàn bộ cấu trúc định tuyến (URLs) và kiểm soát phân quyền truy cập trang.
* **Nội dung:** 
  * Định nghĩa danh sách các Route (Tĩnh và Động) bằng `react-router-dom`.
  * Triển khai các **Route Guards** (như `GuestGuard` chặn người dùng chưa đăng nhập truy cập dashboard, và `LearnerGuard`/`ProviderGuard`/`AdminGuard` chặn người dùng truy cập vào trang của vai trò khác).

### 🔌 2.9. `src/services`
* **Vai trò:** Lớp gọi API mạng. Tách biệt hoàn toàn các logic gửi yêu cầu (HTTP Requests) tới server ra khỏi giao diện và store.
* **Nội dung:** `auth/auth.service.ts` định nghĩa các hàm bất đồng bộ tương tác trực tiếp với Backend.

### 💾 2.10. `src/stores`
* **Vai trò:** Quản lý các State toàn cục (Global States) của ứng dụng bằng **Zustand** kết hợp Persist Middleware.
* **Nội dung:** `auth.stores.ts` quản lý việc lưu trữ token, thông tin người dùng đang đăng nhập và tự động đồng bộ hóa với localStorage.

### 🏷️ 2.11. `src/types`
* **Vai trò:** Nơi khai báo tập trung các Interface, Type của TypeScript để chia sẻ kiểu dữ liệu trên toàn dự án, tránh lặp lại định nghĩa kiểu.
* **Ví dụ:** Định nghĩa kiểu `User`, `Course`, `Lesson`, `Notification`.

### 🛠️ 2.12. `src/utils`
* **Vai trò:** Các hàm xử lý logic thuần túy (Helper/Utility functions) không liên quan trực tiếp đến giao diện.
* **Ví dụ:** Định dạng ngày tháng năm, kiểm tra độ mạnh của mật khẩu (`passwordStrength.ts`).

---

## ⚡ 3. Các Luồng Hoạt Động Cốt Lõi (Core Workflows)

### 3.1. Luồng Xác thực Email (Email Verification Flow)
* **Kích hoạt:** Khi nhấp vào liên kết xác nhận trên email -> Mở trang `/verify-email?token=...`.
* **Xử lý:**
  1. Frontend giải mã JWT token tại Client thông qua hàm `decodeJwt(token)` để lấy thông tin email và hiển thị ngay trên UI của trang.
  2. Gửi yêu cầu kiểm tra token lên backend thông qua action `verifyEmail(token)`.
  3. Hiển thị thông báo Toast kết quả thành công/thất bại và thiết lập bộ đếm thời gian 5 giây để điều hướng trở lại màn hình Đăng nhập `/login`.

### 3.2. Đồng bộ hóa Trạng thái Đăng xuất & Lỗi 401
* **Khi Người dùng Đăng xuất (Sign Out):** 
  Hàm `logout` trong `auth.stores.ts` được kích hoạt sẽ thực hiện gọi API `POST /auth/logout` để báo cho Backend xóa cookie, đồng thời xóa token ở `localStorage` và đặt lại Zustand State của user về `null`.
* **Khi Tài khoản bị xóa hoặc Token hết hạn (Lỗi 401):**
  Axios Interceptor ở `lib/axios.ts` phát hiện mã lỗi `401 Unauthorized` từ API -> Tự động phát ra một sự kiện toàn cục `auth:logout` -> `auth.stores.ts` lắng nghe sự kiện này và reset ngay lập tức Zustand State về trạng thái chưa đăng nhập, giúp các Route Guards kích hoạt chuyển hướng tức thì và an toàn về `/login`.

### 3.3. Luồng Điều hướng & Tùy biến Hồ sơ theo Vai trò (Role-based Profile Workflow)
* **Kích hoạt:** Khi nhấp vào nút "My Profile" trong dropdown của Header tại trang Dashboard.
* **Xử lý Điều hướng:**
  1. **Học viên (Learner):** `LearnerHeader` điều hướng đến `/learner/learnerprofile` (tương ứng với `<LearnerProfile />`).
  2. **Quản trị viên (Admin):** `AdminHeader` điều hướng đến `/admin/adminprofile` (tương ứng với `<AdminProfile />`).
  3. **Giảng viên (Course Provider) & Quản lý Học thuật (Academic Manager):** `ProviderHeader` và `AcademicManagerHeader` điều hướng đến tuyến chung `/provider/userprofile` hoặc `/academic/userprofile` (tương ứng với `<UserProfile />`).
* **Hiển thị & Chỉnh sửa hồ sơ:**
  * **Chung cho mọi vai trò:** Form chỉnh sửa (`EditProfileModal`) hiển thị trường **Email** ở chế độ chỉ đọc (`disabled`, read-only) phục vụ mục đích xác thực, không cho phép chỉnh sửa.
  * **Learner (Học viên):** Trang cá nhân hiển thị mục tiêu học tập (Learning Goal), trình độ (Level), giới thiệu bản thân (Bio), các lộ trình (Learning Paths) và lịch sử học tập. Modal chỉnh sửa hỗ trợ cập nhật trực tiếp Goal, Level và Bio.
  * **Academic Users (Provider / Manager):** Trang cá nhân hiển thị Expertise và Experience Years. Phần thống kê (Stats Card) và bảng danh sách khóa học bên dưới tự động thích ứng:
    * *Course Provider:* Hiển thị các thông số giảng dạy (Khóa học đã đăng, tổng học viên, rating) và bảng danh sách các khóa học đã xuất bản (Published Courses).
    * *Academic Manager:* Hiển thị thông số quản trị (Số khóa quản lý, giảng viên hoạt động, yêu cầu duyệt) và bảng giám sát chương trình khung (Curriculum Courses Overview).


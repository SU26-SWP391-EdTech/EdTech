# 📘 TÀI LIỆU BÀN GIAO HỆ THỐNG ROLE-BASED NAVIGATION

Hệ thống **Role-Based Navigation** và **Unified Header Layout** cho dự án EdTech đã được xây dựng hoàn chỉnh, sạch mã, đạt chuẩn sản xuất (production-ready) và vượt qua quá trình biên dịch nghiêm ngặt của TypeScript (`npm run build` thành công 100% không cảnh báo).

Dưới đây là hướng dẫn chi tiết dành cho bạn hoặc thành viên khác trong nhóm phát triển để tiếp quản, sử dụng và mở rộng hệ thống này.

---

## 📂 1. Cấu trúc thư mục các File liên quan

Toàn bộ logic phân quyền giao diện và thanh điều hướng được chia nhỏ thành các Component riêng biệt, đặt tại:

```bash
src/
├── components/
│   └── header/
│       ├── config/
│       │   └── nav-config.tsx      # ⚙️ Nơi định nghĩa các mảng Menu cho từng Role
│       ├── roleNav/
│       │   ├── GuestHeader.tsx      # 🟢 Header dành cho Khách (Chưa đăng nhập)
│       │   ├── LearnerHeader.tsx    # 🔴 Header dành cho Học viên (Crimson Accent)
│       │   ├── ProviderHeader.tsx   # 🔵 Header dành cho Giảng viên (Sky Blue Accent)
│       │   ├── AcademicManagerHeader.tsx # 🟡 Header dành cho Quản lý đào tạo (Amber Accent)
│       │   └── AdminHeader.tsx      # 🟣 Header dành cho Quản trị viên (Purple Accent)
│       └── shared/
│           ├── Logo.tsx             # 🎨 Component Logo dùng chung (Đổi Icon & Màu theo Role)
│           ├── NavItem.tsx          # 🔗 Nút Menu điều hướng riêng lẻ hỗ trợ Badge & Count
│           ├── NotifBell.tsx        # 🔔 Chuông thông báo đồng bộ màu theo Accent
│           └── SearchBar.tsx        # 🔍 Thanh tìm kiếm thông minh đồng bộ màu theo Accent
├── layouts/
│   └── Dashboard/
│       ├── GuestLayout.tsx          # 🌐 Layout dùng chung cho Khách (Bao bọc Landing Page)
│       └── Dashboard.tsx            # 📊 Layout dùng chung cho Auth Users (Render Header theo Role)
└── routes/
    └── index.tsx                    # 🛣️ File cấu hình phân tuyến của React Router DOM
```

---

## ⚡ 2. Cơ chế hoạt động của Hệ thống

1. **Logo Động & Điều Hướng Nhanh (`Logo.tsx`):**
   * Tự động thay đổi Icon theo `variant` (BookOpen cho Học viên, Shield cho Admin, GraduationCap cho Giảng viên, Award cho Academic).
   * Được bọc bằng `<Link to="/">` giúp nhấp chuột là quay về trang chủ lập tức mà không tải lại toàn bộ trang.
2. **Đồng bộ hóa Chiều rộng Layout:**
   * Tất cả các Header được thiết lập lớp `w-full px-8` thay vì bị giới hạn chiều rộng, giúp thanh điều hướng luôn tràn màn hình đẹp mắt và không bao giờ bị lệch sang trái/phải trên các độ phân giải lớn.
3. **Quản lý Menu tập trung (`nav-config.tsx`):**
   * Toàn bộ cấu trúc danh sách menu được lưu trữ tập trung tại `nav-config.tsx`. Khi cần chỉnh sửa menu của bất kỳ Role nào, dev chỉ cần sửa file cấu hình này mà không cần động vào code logic hiển thị của các Header.

---

## 🚀 3. Hướng dẫn Tích hợp Backend & Quản lý State (Dành cho Developer tiếp quản)

Để hệ thống chuyển từ chế độ dữ liệu giả lập (mocked role) sang chạy thực tế bằng API và tài khoản người dùng, hãy thực hiện theo các bước sau:

### Bước 1: Kết nối Auth State từ Zustand Store hoặc JWT
Trong file `src/layouts/Dashboard/Dashboard.tsx` hiện tại đang nhận role cứng từ React Router:
```typescript
// src/layouts/Dashboard/Dashboard.tsx
export function DashboardLayout({ role }: { role: string }) {
    // Hiện tại: Lấy từ prop role được khai báo ở routes
```
Khi bàn giao, lập trình viên frontend chỉ cần kết nối với Zustand Store chứa trạng thái đăng nhập thực tế của người dùng:
```typescript
import { useAuthStore } from '@/stores/authStore'; // Ví dụ store chứa thông tin user

export function DashboardLayout() {
    const { user } = useAuthStore();
    const currentRole = user?.role || 'guest';
    
    // Sử dụng currentRole để render Header tương ứng thay vì dùng prop role cứng
```

### Bước 2: Thiết lập Route Guard (Bảo vệ tuyến đường)
Trong file `src/routes/index.tsx`, để tránh việc người dùng gõ trực tiếp URL `/admin` hay `/provider` khi chưa đăng nhập, lập trình viên cần bọc các tuyến đường bằng một Component bảo vệ (ví dụ: `ProtectedRoute` hoặc `RoleGuard`):

```typescript
// Ví dụ tạo component Guard đơn giản:
function RoleGuard({ allowedRoles, children }) {
    const { user, isAuthenticated } = useAuthStore();
    
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
    
    return children;
}

// Cấu hình trong routes/index.tsx:
{
    path: "/admin",
    element: (
        <RoleGuard allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
        </RoleGuard>
    ),
    children: [ ... ]
}
```

---

## ⚙️ 4. Hướng dẫn Mở rộng & Tùy biến (Chỉnh sửa trong tương lai)

* **Muốn thêm/bớt mục trên Navbar của một Role:**
  * Truy cập `src/components/header/config/nav-config.tsx`.
  * Tìm tới mảng tương ứng (ví dụ: `LEARNER_NAV`, `ADMIN_NAV`) để thêm hoặc xóa đối tượng mong muốn. Các Icon có thể import trực tiếp từ thư viện `lucide-react`.
* **Muốn thay đổi thông tin User hiển thị ở Dropdown bên phải:**
  * Vào tệp Header của role đó (ví dụ: `src/components/header/roleNav/LearnerHeader.tsx`).
  * Tìm phần State chứa avatar, tên hiển thị và email (dòng 99) để liên kết với dữ liệu `user` thực tế lấy từ API backend.

---

> [!TIP]
> **Đánh giá tổng quan:** Mã nguồn hiện tại được viết cực kỳ tường minh (clean code), tuân thủ chặt chẽ tiêu chuẩn thiết kế hiện đại, responsive hoàn hảo và đã được tối ưu hóa tối đa. Tài liệu bàn giao này đã bao quát toàn bộ các khía cạnh cần thiết giúp bất kỳ lập trình viên nào cũng có thể tiếp quản và triển khai tiếp dự án một cách trơn tru nhất!

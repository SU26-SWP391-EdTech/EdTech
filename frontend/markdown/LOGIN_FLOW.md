# Luồng Frontend Trang Login

Tài liệu này mô tả luồng frontend của trang login trong app React/Vite để team có thể hiểu và áp dụng khi code các phần auth hoặc các trang cần bảo vệ đăng nhập.

## 1. Các file chính

- `src/pages/public/LoginPage.tsx`: UI và xử lý submit form login.
- `src/layouts/auth/AuthLayout.tsx`: layout dùng cho màn hình auth.
- `src/routes/index.tsx`: khai báo route `/login`, protected route và guest route.
- `src/stores/auth.store.ts`: quản lý auth state bằng Zustand.
- `src/services/auth.service.ts`: gọi API auth qua axios.
- `src/libs/axios.ts`: cấu hình axios instance, token header và xử lý lỗi 401.
- `src/components/auth/AuthInitializer.tsx`: hydrate auth state khi app khởi động.
- `src/components/auth/GuestRoute.tsx`: chặn user đã login quay lại trang login.
- `src/components/auth/ProtectedRoute.tsx`: chặn user chưa login vào trang cần auth.
- `src/types/auth.types.ts`: type cho payload/response auth.
- `src/utils/auth.errors.ts`: chuẩn hóa message lỗi login.

## 2. Luồng tổng quan

```text
User mở /login
    │
    ▼
GuestRoute kiểm tra trạng thái đăng nhập
    │
    ├── Nếu đã login -> redirect theo role
    └── Nếu chưa login -> render LoginPage
            │
            ▼
        User nhập email/password
            │
            ▼
        LoginPage validate input
            │
            ▼
        Gọi useAuthStore.login(...)
            │
            ▼
        authService.login(...)
            │
            ▼
        POST /auth/login
            │
            ▼
        Backend trả token + user
            │
            ▼
        auth.store lưu token/user vào storage + state
            │
            ▼
        LoginPage redirect sang trang sau login
```

## 3. Route login

Route được khai báo trong `src/routes/index.tsx`:

```tsx
{
  element: <GuestRoute />,
  children: [
    {
      path: '/login',
      element: <LoginPage />,
    },
  ],
}
```

Ý nghĩa:

- `/login` được bọc bởi `GuestRoute`.
- User chưa đăng nhập được xem trang login.
- User đã đăng nhập sẽ bị redirect khỏi trang login.

`GuestRoute` hiện xử lý:

```text
isAuthenticated && user
    │
    ├── true  -> Navigate tới getPostLoginPath(user.roleName)
    └── false -> Outlet, cho render LoginPage
```

## 4. UI và state trong LoginPage

File: `src/pages/public/LoginPage.tsx`

State local của page:

- `email`: email người dùng nhập.
- `password`: mật khẩu người dùng nhập.
- `rememberMe`: chọn lưu đăng nhập lâu hơn.
- `showPassword`: bật/tắt hiển thị mật khẩu.

State lấy từ auth store:

- `login`: action gọi API login.
- `isLoading`: dùng để disable button và hiển thị loading spinner.

Khi user submit form:

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!email.trim() || !password) {
    toast.error('Please enter email and password');
    return;
  }

  try {
    const user = await login({ email: email.trim(), password }, rememberMe);
    toast.success('Logged in successfully');
    navigate(from ?? getPostLoginPath(user.roleName), { replace: true });
  } catch (error) {
    toast.error(getAuthErrorMessage(error));
  }
};
```

Luồng xử lý:

```text
Submit form
    │
    ▼
e.preventDefault()
    │
    ▼
Kiểm tra email/password rỗng
    │
    ├── Rỗng -> toast error, dừng
    └── Hợp lệ -> gọi login(...)
                    │
                    ├── Thành công -> toast success + navigate
                    └── Thất bại -> toast error theo response backend
```

## 5. Auth store

File: `src/stores/auth.store.ts`

Store dùng Zustand để lưu trạng thái auth toàn app.

State chính:

- `user`: thông tin user hiện tại.
- `token`: access token dùng cho API.
- `isAuthenticated`: user đã đăng nhập hay chưa.
- `isLoading`: đang xử lý login hay không.
- `rememberMe`: có lưu vào `localStorage` hay chỉ `sessionStorage`.

Action chính:

- `login(payload, rememberMe)`: gọi API login, lưu token/user.
- `logout()`: gọi API logout, sau đó clear auth.
- `hydrate()`: đọc storage khi app reload, sau đó gọi `/auth/me`.
- `clearAuth()`: xóa storage và reset state.

## 6. Lưu token và remember me

Store dùng key:

```ts
const AUTH_KEY = 'auth';
```

Khi login thành công:

```text
rememberMe = true
    │
    └── Lưu auth vào localStorage

rememberMe = false
    │
    └── Lưu auth vào sessionStorage
```

Dữ liệu lưu:

```ts
{
  user: data.user,
  token: data.token,
  rememberMe,
}
```

Trước khi ghi storage mới, app xóa cả `localStorage.auth` và `sessionStorage.auth` để tránh lệch trạng thái.

## 7. Gọi API login

File: `src/services/auth.service.ts`

```ts
login: async (payload: LoginPayload) => {
  const { data } = await instance.post<LoginResponse>('/auth/login', payload);
  return data;
}
```

Request gửi lên backend:

```http
POST /auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response frontend đang kỳ vọng:

```ts
interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}
```

`AuthUser` gồm:

```ts
interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  avatarUrl: string | null;
}
```

## 8. Axios instance và token header

File: `src/libs/axios.ts`

Base URL:

```ts
const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:5002');
```

Ý nghĩa:

- Nếu có `VITE_API_URL`, axios dùng URL đó.
- Nếu đang dev và không có `VITE_API_URL`, base URL là chuỗi rỗng.
- Nếu production không có `VITE_API_URL`, fallback về `http://localhost:5002`.

Axios được cấu hình:

```ts
export const instance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});
```

`withCredentials: true` cho phép browser gửi/nhận cookie auth nếu backend dùng cookie.

Request interceptor:

```text
Trước mỗi request
    │
    ▼
Đọc token từ useAuthStore
    │
    ├── Có token -> gắn Authorization: Bearer <token>
    └── Không có token -> gửi request bình thường
```

Nhờ đó các service khác chỉ cần dùng chung `instance`, không phải tự gắn token.

## 9. Xử lý lỗi auth

File: `src/utils/auth.errors.ts`

Khi login thất bại, `LoginPage` gọi:

```ts
toast.error(getAuthErrorMessage(error));
```

Logic message:

```text
Nếu backend trả response.data.message dạng array
    -> join bằng dấu phẩy

Nếu backend trả response.data.message dạng string
    -> dùng message đó

Nếu status = 401
    -> "Email or password is incorrect"

Trường hợp khác
    -> "Something went wrong. Please try again."
```

Axios response interceptor cũng xử lý lỗi 401:

```text
Response status = 401
    │
    ├── Nếu là /auth/login hoặc /auth/register
    │       └── Không clear auth
    │
    └── Nếu là API khác
            └── clearAuth()
```

Mục đích: nếu token hết hạn hoặc không hợp lệ ở các API sau login, app tự xóa trạng thái đăng nhập.

## 10. Redirect sau login

Trong `LoginPage`:

```ts
const from =
  (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname ?? null;
```

`from` đến từ `ProtectedRoute`.

Ví dụ:

```text
User chưa login vào /admin/users
    │
    ▼
ProtectedRoute redirect user tới /login
    │
    ▼
state.from = /admin/users
    │
    ▼
Login thành công
    │
    ▼
navigate về /admin/users
```

Nếu không có `from`, app dùng:

```ts
getPostLoginPath(user.roleName)
```

Hiện tại:

```ts
export const getPostLoginPath = (roleName: string) => {
  if (roleName === 'admin') return '/admin';
  return '/admin';
};
```

Tức là mọi role hiện đều được redirect về `/admin`. Khi có trang riêng cho learner/course provider, cần cập nhật hàm này.

## 11. Hydrate khi reload app

File: `src/components/auth/AuthInitializer.tsx`

`App.tsx` bọc toàn bộ router bằng:

```tsx
<AuthInitializer>
  <RouterProvider router={router} />
  <Toaster />
</AuthInitializer>
```

Khi app mount:

```text
AuthInitializer gọi hydrate()
    │
    ▼
auth.store đọc localStorage/sessionStorage
    │
    ├── Không có token -> không làm gì
    └── Có token
            │
            ├── Set user/token/isAuthenticated từ storage
            ├── Gọi GET /auth/me để kiểm tra token
            ├── Thành công -> cập nhật user mới nhất
            └── Thất bại -> clearAuth()
```

Mục đích:

- User reload trang vẫn giữ trạng thái đăng nhập.
- Nếu token trong storage đã hết hạn, app tự logout.

## 12. ProtectedRoute cho trang cần đăng nhập

File: `src/components/auth/ProtectedRoute.tsx`

Luồng:

```text
User vào route cần auth
    │
    ▼
ProtectedRoute kiểm tra isAuthenticated
    │
    ├── false -> Navigate tới /login, kèm state.from = route hiện tại
    └── true  -> render Outlet
```

Ví dụ route `/admin`:

```tsx
{
  element: <ProtectedRoute />,
  children: [
    {
      path: '/admin',
      element: <AdminLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'users', element: <UserPage /> },
      ],
    },
  ],
}
```

Khi team code trang mới cần đăng nhập, hãy đặt route đó bên trong `ProtectedRoute`.

## 13. Cách team áp dụng cho các phần khác

### Thêm page chỉ dành cho user đã login

1. Tạo page trong `src/pages/...`.
2. Khai báo route bên trong nhóm `ProtectedRoute`.
3. Trong service của page đó, dùng `instance` từ `src/libs/axios.ts`.
4. Không cần tự gắn `Authorization` header vì interceptor đã làm.

Ví dụ:

```tsx
{
  element: <ProtectedRoute />,
  children: [
    {
      path: '/learner',
      element: <LearnerLayout />,
      children: [
        { index: true, element: <LearnerDashboardPage /> },
      ],
    },
  ],
}
```

### Thêm redirect theo role

Cập nhật `getPostLoginPath`:

```ts
export const getPostLoginPath = (roleName: string) => {
  if (roleName === 'admin') return '/admin';
  if (roleName === 'learner') return '/learner';
  if (roleName === 'course provider') return '/course-provider';
  return '/';
};
```

### Thêm API service mới

Dùng chung axios instance:

```ts
import { instance } from '../libs/axios';

export const learnerService = {
  getProfile: async () => {
    const { data } = await instance.get('/learners/me');
    return data;
  },
};
```

## 14. Các điểm cần lưu ý hiện tại

1. Link `Create one` đang trỏ tới `/register`, nhưng route `/register` chưa được khai báo trong `src/routes/index.tsx`.

2. `getPostLoginPath` hiện trả `/admin` cho mọi role. Khi có dashboard riêng cho learner/course provider, cần sửa lại.

3. Base URL dev đang là chuỗi rỗng nếu không có `VITE_API_URL`. Nếu Vite không proxy API, request `/auth/login` sẽ gọi vào frontend dev server thay vì backend.

4. `hydrate()` set `isAuthenticated = true` ngay sau khi đọc storage, rồi mới gọi `/auth/me`. Trong khoảng thời gian ngắn đó UI có thể xem user là đã login trước khi token được verify.

5. Frontend hỗ trợ cả Bearer token và cookie:
   - Bearer token qua `Authorization` header.
   - Cookie qua `withCredentials: true`.
   Backend cần cấu hình CORS/cookie tương ứng nếu dùng cookie.

## 15. Checklist khi code flow auth mới

- Dùng `instance` thay vì tạo axios mới.
- Type request/response trong `src/types`.
- Lưu auth state qua `useAuthStore`, không tự ghi storage ở component.
- Route cần login đặt trong `ProtectedRoute`.
- Route chỉ dành cho guest đặt trong `GuestRoute`.
- Khi redirect sau login, ưu tiên `from`, sau đó mới dùng role path.
- Khi backend đổi format response login, cập nhật `LoginResponse` và `auth.store.ts`.

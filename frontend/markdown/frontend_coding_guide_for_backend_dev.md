# Frontend Coding Guide Cho Backend Developer

Tài liệu này hướng dẫn cách code frontend trong project EdTech hiện tại. Mục tiêu là giúp bạn hiểu đúng luồng, đúng format, và biết nên bắt đầu từ đâu khi làm một màn hình hoặc một feature mới.

## 1. Tech Stack Hiện Tại

Project frontend đang dùng:

- React + TypeScript: viết UI bằng component.
- Vite: chạy dev server và build frontend.
- Tailwind CSS: style bằng className.
- react-router-dom: quản lý route/page.
- Zustand: quản lý state dùng chung, ví dụ auth.
- Axios: gọi API backend qua `frontend/src/lib/axios.ts`.
- lucide-react: icon.
- react-hot-toast: hiển thị toast.

Các lệnh thường dùng:

```bash
cd frontend
npm run dev
npm run lint
npm run build
```

## 2. Tư Duy Chuyển Từ Backend Sang Frontend

Backend thường đi theo flow:

```text
Route -> Controller -> Service -> Repository -> Database
```

Frontend trong repo này nên nghĩ theo flow:

```text
Route -> Layout -> Page -> Component -> Store/Service -> API
```

Ví dụ trang đăng ký:

```text
/register
-> SignUp page
-> SplitAuthLayout
-> AuthLeftPanel, FormInput, CustomCheckbox, PrimaryButton
-> useAuthStore.register()
-> auth.service.register()
-> axios.post('/auth/register')
```

Điểm khác biệt quan trọng:

- Backend xử lý dữ liệu và business logic chính.
- Frontend xử lý trải nghiệm người dùng: form, loading, error, disable button, điều hướng, responsive UI.
- Frontend không nên nhồi toàn bộ logic vào JSX. Hãy tách state, handler, component, service rõ ràng.

## 3. Cấu Trúc Thư Mục Nên Nhớ

```text
frontend/src
├── App.tsx                    # Gắn router và global providers/toaster
├── routes/index.tsx           # Khai báo route
├── pages/                     # Mỗi file là một màn hình/page lớn
├── layouts/                   # Khung giao diện dùng chung
├── components/                # Component nhỏ/tái sử dụng
├── services/                  # Hàm gọi API
├── stores/                    # State dùng chung bằng Zustand
├── types/                     # TypeScript type/interface
├── lib/axios.ts               # Axios instance, token, interceptor
└── utils/                     # Hàm helper thuần logic
```

Quy tắc nhanh:

- UI nguyên trang đặt trong `pages`.
- UI dùng lại nhiều nơi đặt trong `components`.
- Khung chung có header/sidebar/auth layout đặt trong `layouts`.
- Gọi backend đặt trong `services`.
- State cần chia sẻ nhiều page đặt trong `stores`.
- Type dùng nhiều nơi đặt trong `types`.
- Hàm tính toán không phụ thuộc UI đặt trong `utils`.

## 4. Luồng Làm Một Page Mới

Khi cần làm một page mới, đi theo thứ tự này:

### Bước 1: Xác định route

Mở:

```text
frontend/src/routes/index.tsx
```

Thêm route vào đúng nhóm:

- Public page: trong `GuestLayout`.
- Auth page: trong `GuestGuard`.
- Learner page: trong `LearnerGuard` + `DashboardLayout role="learner"`.
- Provider page: trong `ProviderGuard` + `DashboardLayout role="provider"`.
- Admin page: trong `AdminGuard` + `DashboardLayout role="admin"`.

Ví dụ:

```tsx
{
  path: "/provider/courses",
  element: (
    <ProviderGuard>
      <DashboardLayout role="provider" />
    </ProviderGuard>
  ),
  children: [
    {
      index: true,
      element: <CourseManagement />
    }
  ]
}
```

### Bước 2: Tạo page trong `pages`

Page là nơi điều phối dữ liệu và layout chính của màn hình.

Ví dụ:

```tsx
export function CourseManagement() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
    </div>
  );
}
```

Page nên làm:

- Lấy state từ store hoặc local state.
- Gọi handler chính.
- Render các component con.
- Điều hướng bằng `useNavigate`.

Page không nên làm:

- Viết quá nhiều block UI lặp lại.
- Gọi axios trực tiếp nếu API có thể đưa vào service.
- Nhét logic validate phức tạp trong JSX.

### Bước 3: Tách component nhỏ nếu UI bắt đầu dài

Nếu một page dài quá nhiều JSX, hãy tách ra component.

Ví dụ auth đang có:

```text
components/auth/FormInput.tsx
components/auth/PrimaryButton.tsx
components/auth/CustomCheckbox.tsx
components/auth/AuthLeftPanel.tsx
```

Một component tốt nên:

- Nhận dữ liệu qua props.
- Không tự gọi API nếu không cần.
- Có tên rõ nghĩa.
- Dễ dùng lại.

Ví dụ format component:

```tsx
type CourseCardProps = {
  title: string;
  description: string;
  onOpen: () => void;
};

export function CourseCard({ title, description, onOpen }: CourseCardProps) {
  return (
    <button onClick={onOpen} className="rounded-lg border border-gray-200 p-4 text-left">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </button>
  );
}
```

## 5. Format Chuẩn Của Một Page Có Form

Một page form nên đi theo format:

```text
1. import
2. khai báo component
3. lấy navigate/store
4. khai báo useState
5. tính derived state, ví dụ canSubmit
6. viết handler
7. return JSX
```

Ví dụ rút gọn từ `SignUp.tsx`:

```tsx
export function SignUp() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const canSubmit = !!name && !!email && password.length >= 8;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await register({
        fullName: name.trim(),
        email: email.trim(),
        password: password.trim(),
        roleName: 'learner',
      });

      navigate('/verify-email');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    }
  };

  return (
    <SplitAuthLayout screen="signup">
      {/* UI ở đây */}
    </SplitAuthLayout>
  );
}
```

## 6. Khi Nào Dùng Local State, Store, Service?

Dùng `useState` khi state chỉ phục vụ một component/page:

- Giá trị input.
- Bật/tắt password.
- Tab đang chọn.
- Modal đang mở.
- Error local của form.

Dùng Zustand store khi state cần dùng nhiều nơi:

- User đang đăng nhập.
- Token.
- Role.
- Giỏ hàng.
- Thông tin course đang được share giữa nhiều page.

Dùng service khi cần gọi backend:

```tsx
export async function getCourses() {
  const response = await api.get('/courses');
  return response.data;
}
```

Không nên gọi như sau trực tiếp trong page nếu API đó sẽ dùng lại:

```tsx
await axios.get('/courses');
```

## 7. Luồng Gọi API Đúng Trong Repo

Repo đang có axios instance tại:

```text
frontend/src/lib/axios.ts
```

File này đã xử lý:

- `baseURL` từ `VITE_API_URL`.
- Gắn `Authorization: Bearer token`.
- Bắt lỗi `401` để logout và chuyển về login.

Vì vậy khi tạo API mới, hãy dùng `api`:

```tsx
import api from '../../lib/axios';

export async function getCourseDetail(courseId: number) {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
}
```

Format service nên là:

```text
services/[domain]/[domain].service.ts
```

Ví dụ:

```text
services/auth/auth.service.ts
services/course/course.service.ts
services/user/user.service.ts
```

## 8. TypeScript Type Nên Đặt Ở Đâu?

Nếu type chỉ dùng trong một file, đặt ngay trong file đó:

```tsx
type CourseCardProps = {
  title: string;
  onOpen: () => void;
};
```

Nếu type dùng nhiều file, đặt trong `types` hoặc export từ service:

```tsx
export interface Course {
  courseId: number;
  title: string;
  description: string;
}
```

Không nên dùng `any` trừ khi thật sự chưa biết response backend. Nếu đang chờ backend, có thể viết type tạm và sửa sau.

## 9. Quy Tắc Style UI Trong Project

Project đang style chủ yếu bằng Tailwind className, đôi khi dùng inline style cho màu hoặc font cụ thể.

Nên viết:

```tsx
<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
</div>
```

Hạn chế:

- Tự tạo CSS file mới nếu Tailwind xử lý được.
- Inline style quá nhiều cho layout phổ biến như margin, padding, flex.
- Dùng màu ngẫu nhiên mỗi page một kiểu.
- Làm component quá tròn, quá nhiều gradient nếu đó là dashboard/tool.

Với form:

- Input phải có label.
- Button submit nên có `disabled` khi form chưa hợp lệ.
- Có loading state.
- Có error state.
- Không cho submit nhiều lần khi đang loading.

## 10. Checklist Khi Làm Một Feature

Trước khi code:

- Feature này thuộc role nào: guest, learner, provider, admin, academic?
- Cần route mới không?
- Cần layout nào?
- API backend endpoint là gì?
- Response shape là gì?
- Có cần store hay chỉ local state?

Khi code:

- Tạo page trong `pages`.
- Tách component nếu JSX dài.
- Tạo service nếu gọi API.
- Tạo/update type nếu dữ liệu dùng nhiều nơi.
- Thêm route trong `routes/index.tsx`.
- Xử lý loading, error, empty state.
- Kiểm tra responsive cơ bản.

Sau khi code:

```bash
npm run lint
npm run build
```

Nếu có lỗi TypeScript, sửa từ type trước, đừng xóa type bằng `any` vội.

## 11. Mẫu Luồng Tạo Feature CRUD

Ví dụ tạo Course Management:

```text
1. Tạo types/course/course.ts
2. Tạo services/course/course.service.ts
3. Tạo pages/course/CourseManagement.tsx
4. Tạo components/course/CourseTable.tsx nếu cần
5. Tạo components/course/CourseFormModal.tsx nếu cần
6. Thêm route vào routes/index.tsx
7. Test loading/error/empty/data
```

Service:

```tsx
import api from '../../lib/axios';

export type Course = {
  courseId: number;
  title: string;
  description: string;
};

export async function getCourses() {
  const response = await api.get<Course[]>('/courses');
  return response.data;
}

export async function createCourse(data: { title: string; description: string }) {
  const response = await api.post('/courses', data);
  return response.data;
}
```

Page:

```tsx
import { useEffect, useState } from 'react';
import { getCourses, type Course } from '../../services/course/course.service';

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch {
        setError('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
      <div className="mt-4 space-y-3">
        {courses.map((course) => (
          <div key={course.courseId} className="rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">{course.title}</h2>
            <p className="text-sm text-gray-500">{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 12. Các Lỗi Frontend Hay Gặp

Lỗi 1: Component render lại liên tục.

- Nguyên nhân thường là gọi `setState` trực tiếp trong body component.
- Cách đúng: gọi API hoặc setState theo side effect trong `useEffect`.

Lỗi 2: Button submit gọi API dù form chưa hợp lệ.

- Luôn có `canSubmit`.
- Trong handler cũng check lại `if (!canSubmit) return;`.

Lỗi 3: Quên `key` khi `.map`.

```tsx
items.map((item) => (
  <div key={item.id}>{item.name}</div>
))
```

Lỗi 4: Gọi API trực tiếp trong JSX.

- JSX chỉ nên render UI.
- API nên nằm trong handler hoặc `useEffect`.

Lỗi 5: Dùng role name frontend/backend không khớp.

Ví dụ hiện tại SignUp đang map:

```tsx
const backendRoleName = role === 'provider' ? 'course provider' : 'learner';
```

Đây là việc quan trọng vì frontend có thể dùng label ngắn, còn backend cần enum/string khác.

## 13. Format Code Nên Theo

Import:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FormInput } from '../../components/auth/FormInput';
```

Component:

```tsx
export function ExamplePage() {
  const navigate = useNavigate();

  const [value, setValue] = useState('');

  const handleSubmit = async () => {
    // logic
  };

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

Tên biến:

- Boolean: `isLoading`, `isOpen`, `isAuthenticated`, `canSubmit`, `showPassword`.
- Handler: `handleSubmit`, `handleClose`, `handleDelete`.
- API function: `getCourses`, `createCourse`, `updateCourse`, `deleteCourse`.
- Component: PascalCase, ví dụ `CourseCard`.
- File component/page: PascalCase, ví dụ `CourseManagement.tsx`.

## 14. Cách Đọc Một Màn Hình Có Sẵn

Khi mở một page frontend lạ, đọc theo thứ tự:

```text
1. Page này nằm route nào?
2. Page dùng layout nào?
3. Page có local state gì?
4. Page lấy store nào?
5. Handler submit/click làm gì?
6. Component con nhận props gì?
7. API/service nào được gọi?
8. Sau khi thành công thì navigate/toast/update state ra sao?
```

Áp dụng với `SignUp.tsx`:

```text
Route: /register
Layout: SplitAuthLayout screen="signup"
Local state: name, email, password, role, showPwd, terms, error
Store: useAuthStore.register, useAuthStore.isLoading
Submit: validate -> register -> sessionStorage -> navigate('/verify-email')
Component con: FormInput, CustomCheckbox, PrimaryButton
Service cuối cùng: auth.service.register -> POST /auth/register
```

## 15. Nguyên Tắc Vàng

- Page điều phối, component hiển thị, service gọi API, store giữ state chung.
- Không viết API call lẫn sâu trong component nhỏ nếu không cần.
- Không để JSX quá dài rồi mới tách, thấy lặp là tách.
- Luôn xử lý đủ loading, error, empty state.
- Luôn dùng type để biết backend trả gì.
- Luôn kiểm tra route thuộc role nào trước khi thêm page.
- Code frontend không chỉ là "hiển thị data"; nó là quản lý trạng thái người dùng nhìn thấy trong từng khoảnh khắc.


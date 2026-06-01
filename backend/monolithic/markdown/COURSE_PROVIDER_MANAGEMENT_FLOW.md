# Luồng Backend Course Provider Management

Tài liệu này mô tả luồng xử lý backend cho module `course-providers` trong NestJS.

## 1. Phạm vi module

Module chịu trách nhiệm quản lý thông tin profile của user có role `course provider`.

Các file chính:

- `src/modules/course-providers/course-providers.controller.ts`
- `src/modules/course-providers/course-providers.service.ts`
- `src/modules/course-providers/course-providers.module.ts`
- `src/modules/course-providers/entities/course-provider-profile.entity.ts`
- `src/modules/course-providers/dto/update-course-provider-info.dto.ts`
- `src/modules/course-providers/dto/update-course-provider-profile.dto.ts`
- `src/modules/course-providers/dto/get-course-provider-profile.dto.ts`

## 2. Cấu trúc dữ liệu

### Bảng `users`

Lưu thông tin tài khoản chung:

- `user_id`
- `full_name`
- `email`
- `password`
- `avatar_url`
- `role_id`
- `created_at`

Entity: `User`

### Bảng `course_provider_profiles`

Lưu thông tin nghiệp vụ riêng của course provider:

- `user_id`: khóa chính, đồng thời liên kết 1-1 tới `users.user_id`
- `expertise`: chuyên môn, ví dụ `NestJS, React, System Design`
- `experience_years`: số năm kinh nghiệm
- `created_at`
- `updated_at`

Entity: `CourseProvider`

Quan hệ hiện tại:

```text
users.user_id
    │
    └── course_provider_profiles.user_id
```

## 3. Guards và phân quyền

Các API cập nhật profile dùng:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('course provider')
```

Luồng kiểm tra:

```text
Client gửi request
    │
    ├── Authorization: Bearer <token>
    │
    ▼
JwtAuthGuard xác thực JWT
    │
    ▼
request.user = thông tin user từ token
    │
    ▼
RolesGuard kiểm tra request.user.roleName
    │
    ├── roleName = 'course provider' -> cho phép
    └── role khác -> Forbidden
```

## 4. Danh sách endpoint

Base path:

```http
/course-providers
```

### 4.1. Cập nhật thông tin nghiệp vụ

```http
PATCH /course-providers/update-profile/:id
```

Yêu cầu:

- Có JWT hợp lệ.
- User trong JWT có role `course provider`.

Body:

```json
{
  "expertise": "NestJS, React, System Design",
  "experienceYears": 3
}
```

DTO:

```typescript
UpdateCourseProviderInfoDto
```

Service:

```typescript
CourseProviderService.updateProfile(id, dto)
```

Luồng xử lý:

```text
Controller nhận :id và body
    │
    ▼
Service tìm CourseProvider theo userId = :id
    │
    ├── Nếu chưa có profile
    │       └── Tạo profile mới với userId = :id
    │
    └── Nếu đã có profile
            └── Cập nhật expertise, experienceYears
    │
    ▼
Lưu vào course_provider_profiles
    │
    ▼
Trả về CourseProvider đã lưu
```

Lưu ý hiện tại: khi tạo mới profile, service chỉ set `userId`, chưa gán `expertise` và `experienceYears` từ DTO trong nhánh create.

### 4.2. Đổi mật khẩu

```http
PATCH /course-providers/change-password
```

Yêu cầu:

- Có JWT hợp lệ.
- User trong JWT có role `course provider`.

DTO mong đợi:

```typescript
ChangePasswordDto
```

Service:

```typescript
UsersService.changePassword(req.user.id, dto)
```

Luồng xử lý:

```text
Controller lấy user từ request
    │
    ▼
Gọi UsersService.changePassword(...)
    │
    ▼
UsersService kiểm tra mật khẩu hiện tại và cập nhật mật khẩu mới
```

Lưu ý hiện tại:

- Controller đang khai báo `dto: ChangePasswordDto` nhưng chưa có decorator `@Body()`.
- Cần kiểm tra payload JWT dùng field `id` hay `userId`. Các tài liệu auth trong project đang dùng `userId`.

### 4.3. Chỉnh sửa thông tin user profile

```http
PATCH /course-providers/edit-profile/:id
```

Yêu cầu:

- Có JWT hợp lệ.
- User trong JWT có role `course provider`.

Body:

```json
{
  "fullName": "Nguyen Van A",
  "avatarUrl": "https://example.com/avatar.png"
}
```

DTO:

```typescript
UpdateCourseProviderProfileDto
```

Service:

```typescript
CourseProviderService.editCourseProviderProfile(id, dto, file?)
```

Luồng xử lý:

```text
Controller nhận :id, body và optional file
    │
    ▼
Service tìm User theo userId = :id
    │
    ├── Không tìm thấy -> NotFoundException('User not found')
    │
    └── Tìm thấy user
            │
            ├── Nếu có file
            │       ├── Upload file lên Cloudinary
            │       └── Gán dto.avatarUrl = uploaded.secure_url
            │
            └── Object.assign(user, dto)
    │
    ▼
Lưu vào bảng users
    │
    ▼
Trả về User đã cập nhật
```

Lưu ý hiện tại:

- Controller có `@UploadedFile()` nhưng chưa thấy `@UseInterceptors(FileInterceptor(...))`, nên upload file có thể chưa hoạt động.
- DTO dùng field `avatarUrl`, trong entity `User` field TypeScript là `avatar`, map tới cột `avatar_url`. `Object.assign(user, dto)` sẽ gán `avatarUrl` vào object nhưng không chắc được TypeORM persist vì entity không khai báo property `avatarUrl`.

### 4.4. Xem profile course provider

```http
GET /course-providers/:id
```

Yêu cầu:

- Endpoint hiện tại không gắn guard trong controller.
- Nếu global `JwtAuthGuard` đang bật thì vẫn cần JWT, trừ khi route được đánh dấu public ở nơi khác.

Service:

```typescript
CourseProviderService.viewCourseProviderProfile(id, dto)
```

Luồng xử lý:

```text
Controller nhận :id
    │
    ▼
Service tìm CourseProvider theo userId = :id
    │
    ├── Load thêm relation user
    │
    ├── Không tìm thấy profile hoặc user
    │       └── NotFoundException('Learner not exist')
    │
    └── Tìm thấy
            └── Map dữ liệu trả về
    │
    ▼
Response gồm:
    - fullName
    - email
    - avatarUrl
    - expertise
    - experienceYears
    - createdAt
```

Response ví dụ:

```json
{
  "fullName": "Nguyen Van A",
  "email": "provider@example.com",
  "avatarUrl": "https://example.com/avatar.png",
  "expertise": "NestJS, React",
  "experienceYears": 3,
  "createdAt": "2026-05-28T10:00:00.000Z"
}
```

Lưu ý hiện tại: message lỗi đang là `Learner not exist`, nên đổi thành `Course provider not exist` để đúng ngữ cảnh.

## 5. Luồng tổng quát

```text
Course provider đăng nhập
    │
    ▼
Client lưu token
    │
    ▼
Client gọi API quản lý profile
    │
    ▼
JwtAuthGuard xác thực token
    │
    ▼
RolesGuard xác nhận role = 'course provider'
    │
    ▼
Controller nhận params/body/file
    │
    ▼
CourseProviderService xử lý nghiệp vụ
    │
    ├── Repository<CourseProvider> thao tác bảng course_provider_profiles
    ├── Repository<User> thao tác bảng users
    └── CloudinaryService upload avatar nếu có file
    │
    ▼
Database lưu dữ liệu
    │
    ▼
Controller trả response cho client
```

## 6. Dependency trong module

`CourseProvidersModule` hiện đăng ký:

```typescript
TypeOrmModule.forFeature([CourseProvider, User, Role])
```

Providers:

- `CourseProviderService`
- `CloudinaryService`
- `UsersService`

Controller:

- `CourseProviderController`

## 7. Các điểm nên cải thiện

1. Không nên tin `:id` từ client khi cập nhật profile của chính user đang đăng nhập.
   - Nên lấy `userId` từ JWT bằng `@CurrentUser()` hoặc `req.user.userId`.
   - Tránh trường hợp course provider A gửi request sửa profile của course provider B.

2. Sửa `changePassword`.
   - Thêm `@Body() dto: ChangePasswordDto`.
   - Kiểm tra đúng field user id trong JWT: `req.user.userId` hoặc `req.user.id`.

3. Sửa luồng upload avatar.
   - Thêm `FileInterceptor`.
   - Map `avatarUrl` từ DTO/file sang field entity `avatar`.

4. Sửa nhánh tạo mới trong `updateProfile`.
   - Khi profile chưa tồn tại, nên tạo kèm `expertise` và `experienceYears`.

5. Sửa message lỗi.
   - `Learner not exist` nên đổi thành `Course provider not exist`.

6. Tách rõ 2 loại profile.
   - `users`: thông tin tài khoản chung như tên, email, avatar.
   - `course_provider_profiles`: thông tin nghiệp vụ như chuyên môn và kinh nghiệm.

## 8. Gợi ý contract API sau khi hoàn thiện

Nên chuẩn hóa thành các endpoint theo người đang đăng nhập:

```http
GET /course-providers/me
PATCH /course-providers/me/profile
PATCH /course-providers/me/info
PATCH /course-providers/me/password
GET /course-providers/:id
```

Trong đó:

- Các route `/me/*` lấy `userId` từ JWT.
- `GET /course-providers/:id` dùng cho xem public profile của course provider.
- Không để client truyền `userId` trong body khi thao tác dữ liệu cá nhân.

# Luồng Backend Learner Management

Tài liệu này mô tả luồng xử lý backend cho module `learners` trong NestJS.

## 1. Phạm vi module

Module chịu trách nhiệm quản lý thông tin profile của user có role `learner`.

Các file chính:

- `src/modules/learners/learners.controller.ts`
- `src/modules/learners/learners.service.ts`
- `src/modules/learners/learners.module.ts`
- `src/modules/learners/entities/learner.entity.ts`
- `src/modules/learners/dto/update-learner-info.dto.ts`
- `src/modules/learners/dto/update-learner-profile.dto.ts`
- `src/modules/learners/dto/get-learner-profile.dto.ts`

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

### Bảng `learner_profiles`

Lưu thông tin nghiệp vụ riêng của learner:

- `user_id`: khóa chính, đồng thời liên kết 1-1 tới `users.user_id`
- `learning_goal`: mục tiêu học tập
- `level`: trình độ hiện tại
- `bio`: mô tả ngắn về learner

Entity: `Learner`

Quan hệ hiện tại:

```text
users.user_id
    │
    └── learner_profiles.user_id
```

## 3. Guards và phân quyền

Các API cập nhật profile dùng:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('learner')
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
    ├── roleName = 'learner' -> cho phép
    └── role khác -> Forbidden
```

## 4. Danh sách endpoint

Base path:

```http
/learners
```

### 4.1. Cập nhật thông tin học tập

```http
PATCH /learners/update-profile/:id
```

Yêu cầu:

- Có JWT hợp lệ.
- User trong JWT có role `learner`.

Body:

```json
{
  "learningGoal": "Become a backend developer",
  "level": "Beginner",
  "bio": "I am learning NestJS and database design"
}
```

DTO:

```typescript
UpdateLearnerInfoDto
```

Service:

```typescript
LearnersService.updateProfile(id, dto)
```

Luồng xử lý:

```text
Controller nhận :id và body
    │
    ▼
Service tìm Learner theo userId = :id
    │
    ├── Nếu chưa có profile
    │       └── Tạo profile mới với userId, learningGoal, level, bio
    │
    └── Nếu đã có profile
            └── Cập nhật learningGoal, level, bio
    │
    ▼
Lưu vào learner_profiles
    │
    ▼
Trả về Learner đã lưu
```

### 4.2. Đổi mật khẩu

```http
PATCH /learners/change-password
```

Yêu cầu:

- Có JWT hợp lệ.
- User trong JWT có role `learner`.

Body phụ thuộc vào `ChangePasswordDto`, ví dụ:

```json
{
  "oldPassword": "old-password",
  "newPassword": "new-password"
}
```

Service:

```typescript
UsersService.changePassword(req.user.id, dto)
```

Luồng xử lý:

```text
Controller lấy user từ request và body
    │
    ▼
Gọi UsersService.changePassword(...)
    │
    ▼
UsersService kiểm tra mật khẩu hiện tại
    │
    ▼
Cập nhật mật khẩu mới cho user
```

Lưu ý hiện tại: cần kiểm tra payload JWT dùng field `id` hay `userId`. Tài liệu auth trong project đang dùng `userId`, trong khi controller hiện gọi `req.user.id`.

### 4.3. Chỉnh sửa thông tin user profile

```http
PATCH /learners/edit-profile/:id
```

Yêu cầu:

- Có JWT hợp lệ.
- User trong JWT có role `learner`.
- Nếu upload avatar, gửi file qua field multipart tên `file`.

Body dạng JSON:

```json
{
  "fullName": "Nguyen Van A",
  "avatarUrl": "https://example.com/avatar.png"
}
```

Hoặc multipart:

```text
file=<avatar image>
fullName=Nguyen Van A
```

DTO:

```typescript
UpdateLearnerProfileDto
```

Controller đang dùng:

```typescript
@UseInterceptors(FileInterceptor('file'))
@UploadedFile() file?: Express.Multer.File
```

Service:

```typescript
LearnersService.editLearnerProfile(id, dto, file?)
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

- DTO dùng field `avatarUrl`, trong entity `User` field TypeScript là `avatar`, map tới cột `avatar_url`.
- `Object.assign(user, dto)` sẽ gán `avatarUrl` vào object nhưng không chắc được TypeORM persist vì entity không khai báo property `avatarUrl`.
- Nên map thủ công `learnerProfile.avatar = dto.avatarUrl` hoặc đổi DTO/entity cho thống nhất.

### 4.4. Xem profile learner

```http
GET /learners/:id
```

Service:

```typescript
LearnersService.viewLearnerProfile(id)
```

Luồng xử lý:

```text
Controller nhận :id
    │
    ▼
Service tìm Learner theo userId = :id
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
    - learningGoal
    - level
    - bio
    - createdAt
```

Response ví dụ:

```json
{
  "fullName": "Nguyen Van A",
  "email": "learner@example.com",
  "avatarUrl": "https://example.com/avatar.png",
  "learningGoal": "Become a backend developer",
  "level": "Beginner",
  "bio": "I am learning NestJS and database design",
  "createdAt": "2026-05-28T10:00:00.000Z"
}
```

Yêu cầu auth hiện tại:

- Controller không gắn `@UseGuards` cho `GET /learners/:id`.
- Nếu project bật `JwtAuthGuard` global thì route vẫn cần JWT, trừ khi được đánh dấu `@Public()` ở nơi khác.

## 5. Luồng tổng quát

```text
Learner đăng nhập
    │
    ▼
Client lưu token
    │
    ▼
Client gọi API quản lý learner profile
    │
    ▼
JwtAuthGuard xác thực token
    │
    ▼
RolesGuard xác nhận role = 'learner'
    │
    ▼
Controller nhận params/body/file
    │
    ▼
LearnersService xử lý nghiệp vụ
    │
    ├── Repository<Learner> thao tác bảng learner_profiles
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

`LearnersModule` hiện đăng ký:

```typescript
TypeOrmModule.forFeature([User, Role, Learner])
```

Providers:

- `LearnersService`
- `CloudinaryService`
- `UsersService`

Controller:

- `LearnersController`

## 7. Phân biệt 2 loại profile

### User profile

Thông tin chung của tài khoản, nằm trong bảng `users`:

- `fullName`
- `email`
- `avatar`
- `password`

API liên quan:

```http
PATCH /learners/edit-profile/:id
PATCH /learners/change-password
```

### Learner profile

Thông tin học tập riêng của learner, nằm trong bảng `learner_profiles`:

- `learningGoal`
- `level`
- `bio`

API liên quan:

```http
PATCH /learners/update-profile/:id
GET /learners/:id
```

## 8. Các điểm nên cải thiện

1. Không nên tin `:id` từ client khi cập nhật profile của chính user đang đăng nhập.
   - Nên lấy `userId` từ JWT bằng `@CurrentUser()` hoặc `req.user.userId`.
   - Tránh trường hợp learner A gửi request sửa profile của learner B.

2. Kiểm tra field user id trong JWT.
   - Controller đang dùng `req.user.id`.
   - Tài liệu auth trong project đang mô tả payload là `request.user = { userId, email, roleId, roleName }`.

3. Chuẩn hóa field avatar.
   - DTO dùng `avatarUrl`.
   - Entity `User` dùng property `avatar`.
   - Nên map rõ ràng trước khi save.

4. Chuẩn hóa public/private route.
   - Nếu `GET /learners/:id` là public profile, nên đánh dấu rõ bằng `@Public()`.
   - Nếu chỉ user đã đăng nhập được xem, nên gắn guard/role rõ ràng hoặc dựa vào global guard.

5. Validate `:id`.
   - `edit-profile/:id` đã dùng `ParseIntPipe`.
   - `update-profile/:id` và `GET /:id` hiện chưa dùng `ParseIntPipe`.

## 9. Gợi ý contract API sau khi hoàn thiện

Nên chuẩn hóa thành các endpoint theo người đang đăng nhập:

```http
GET /learners/me
PATCH /learners/me/profile
PATCH /learners/me/info
PATCH /learners/me/password
GET /learners/:id
```

Trong đó:

- Các route `/me/*` lấy `userId` từ JWT.
- `GET /learners/:id` dùng cho xem public profile của learner nếu sản phẩm cần.
- Không để client truyền `userId` trong body khi thao tác dữ liệu cá nhân.

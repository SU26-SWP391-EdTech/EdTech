# Learning Path Follow - Architecture and API Guide

## Mục đích
Tài liệu này mô tả toàn bộ luồng `learning path follow` trong module `learning-paths`.
Nó giúp:
- backend dev review logic và cấu trúc implementation
- frontend dev hiểu API để gọi fetch và render dữ liệu
- người đọc không chuyên code vẫn hình dung được thiết kế và cách hoạt động chung

---

## 1. Tổng quan module

`learning-paths` là module quản lý lộ trình học (learning path) và chức năng follow/unfollow của người dùng.
Module bao gồm:
- `LearningPathsController` - xử lý API HTTP
- `LearningPathsService` - chứa logic nghiệp vụ
- `LearningPathFollowRepository` - thao tác database với bảng `learning_path_follows`
- các entity: `LearningPath`, `LearningPathCourse`, `LearningPathFollow`
- các DTO chứa metadata Swagger và validation

Đặc biệt phần follow/unfollow dùng DB join giữa `learning_path_follows`, `users`, và `learning_paths`.

---

## 2. Luồng follow/unfollow

### 2.1 Theo dõi lộ trình học (Follow Learning Path)

Endpoint:
- `POST /learning-paths/:learningPathId`

Behavior:
- yêu cầu user đã authenticated
- được bảo vệ bởi `JwtAuthGuard` và `RolesGuard`
- cho phép role: `LEARNER`, `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- có throttling: tối đa 5 requests / 60 giây

Request:
- không có body

Response:
- status 200 nếu follow thành công
- nội dung trả về là object lưu record follow từ repository

Các lỗi có thể trả về:
- 401 Unauthorized: token không hợp lệ hoặc không login
- 403 Forbidden: role không được phép
- 404 Not Found: learning path không tồn tại
- 429 Too many requests: bị throttle do gọi quá nhanh
- 500 Internal server error

Flow backend:
1. Controller nhận request và xác nhận `learningPathId` là số nguyên
2. `LearningPathsService.followLearningPathService` gọi `LearningPathFollowRepository.followLearningPath`
3. Repository tạo entity `LearningPathFollow` tương ứng và lưu vào DB

DB:
- entity `LearningPathFollow` dùng `learningPathId` và `userId` là `PrimaryColumn`, nên mỗi user chỉ follow 1 learning path 1 lần
- trường `followedAt` tự động ghi thời gian khi record được tạo

### 2.2 Bỏ theo dõi lộ trình học (Unfollow Learning Path)

Endpoint:
- `DELETE /learning-paths/learning-paths/:learningPathId/unfollow`

Behavior:
- yêu cầu user authenticated
- chỉ cho role `LEARNER`
- không có throttling đặc biệt trong controller

Request:
- không có body

Response:
- status 200 khi unfollow thành công
- body là `void` (không trả dữ liệu cụ thể)

Các lỗi có thể trả về:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found: nếu record follow không tồn tại
- 500 Internal server error

Flow backend:
1. Controller lấy `learningPathId` và `userId` từ yêu cầu
2. Service gọi `LearningPathFollowRepository.findFollow`
3. Nếu tìm không thấy thì ném `NotFoundException`
4. Nếu tìm thấy thì gọi `deleteFollow`

---

## 3. API đọc dữ liệu follow

### 3.1 Xem danh sách người follow cho một learning path

Endpoint:
- `GET /learning-paths/:learningPathId/follower`

Behavior:
- yêu cầu authenticated
- role cần có: `ADMIN`, `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- trả về danh sách người follow một learning path

Response:
- status 200 và mảng object
- mỗi object gồm:
  - `learningPathId`
  - `title`
  - `userId`
  - `username`
  - `followedAt`

SQL/Repo:
- `LearningPathFollowRepository.viewLearningPathFollower` dùng query builder
- join `follow.user` và `follow.learningPath`
- select raw fields theo alias để trả về mảng JSON

### 3.2 Lấy danh sách learning path đang follow của user hiện tại

Endpoint:
- `GET /learning-paths/me/following-learning-paths`

Behavior:
- yêu cầu authenticated
- role: `LEARNER`
- trả về danh sách lộ trình đang follow của user đó

Response:
- status 200 và mảng DTO `LearningPathFollowingResponseDto`
- mỗi phần tử có:
  - `learningPathId`
  - `title`
  - `description`
  - `thumbnailUrl`
  - `followedAt`

Repo:
- `LearningPathFollowRepository.findFollowingLearningPaths`
- join `follow.learningPath`
- filter theo `follow.userId`
- order theo `follow.followedAt DESC`

---

## 4. Entity và dữ liệu quan trọng

### 4.1 Entity `LearningPathFollow`

Trường chính:
- `learningPathId` (PK, int)
- `userId` (PK, int)
- `followedAt` (timestamp tự động)

Quan hệ:
- `ManyToOne` tới `LearningPath`
- `ManyToOne` tới `User`

Nghĩa là một record tượng trưng cho một người dùng theo dõi một lộ trình.

### 4.2 Quan hệ DB chính

`learning_path_follows` liên kết:
- `learning_path_id` -> `learning_paths.learning_path_id`
- `user_id` -> `users.user_id`

Mỗi cặp `(learning_path_id, user_id)` chỉ xuất hiện một lần.

---

## 5. Frontend cần biết gì

### 5.1 Endpoint chính để gọi

- `POST /learning-paths/:learningPathId` => follow
- `DELETE /learning-paths/learning-paths/:learningPathId/unfollow` => unfollow
- `GET /learning-paths/:learningPathId/follower` => danh sách người follow
- `GET /learning-paths/me/following-learning-paths` => learning path của user hiện tại

### 5.2 Header cần set

- `Authorization: Bearer <token>`

### 5.3 Dữ liệu trả về mẫu

#### GET /learning-paths/me/following-learning-paths
```json
[
  {
    "learningPathId": 12,
    "title": "Frontend Developer Roadmap",
    "description": "A comprehensive roadmap for modern frontend learning.",
    "thumbnailUrl": "https://example.com/banner.jpg",
    "followedAt": "2026-06-29T08:15:00.000Z"
  }
]
```

#### GET /learning-paths/:learningPathId/follower
```json
[
  {
    "learningPathId": 12,
    "title": "Frontend Developer Roadmap",
    "userId": 45,
    "username": "nguyenvana",
    "followedAt": "2026-06-29T08:15:00.000Z"
  }
]
```

### 5.4 Gợi ý frontend render

- Trang học viên:
  - hiển thị danh sách learning path đang follow
  - dùng `followedAt` để sắp xếp recent nhất lên đầu
- Trang chi tiết learning path:
  - có thể show nút `Follow` hoặc `Unfollow`
  - kiểm tra user đã follow hay chưa bằng trạng thái riêng hoặc gọi API `me/following-learning-paths`
- Trang admin/manager:
  - show danh sách người follow cho learning path cụ thể

### 5.5 Lưu ý với response

- `followedAt` là timestamp UTC string
- nếu frontend cần hiển thị ngày giờ, convert sang local timezone
- dư liệu trả về không bao gồm thông tin nhạy cảm của user ngoài `userId` và `username`

---

## 6. Quy tắc và hành vi cần nhớ

- `POST /learning-paths/:learningPathId` sẽ tạo mới luôn record follow nếu chưa có
- `DELETE /learning-paths/learning-paths/:learningPathId/unfollow` xóa theo cặp `learningPathId + userId`
- bảng `learning_path_follows` không có ID tự tăng, dùng composite key để tránh duplicate
- controller dùng `RolesGuard` nên mỗi endpoint có thể bắt lỗi `Forbidden` nếu role không hợp lệ
- throttle áp dụng cho các POST nhạy cảm nhằm hạn chế spam/attack

---

## 7. Checklist review backend

- [ ] Controller có `@UseGuards(JwtAuthGuard, RolesGuard)` với role đúng
- [ ] POST follow có `@Throttle` 5/60s
- [ ] DTO/response rõ trường, có Swagger metadata
- [ ] Service và repository tách rõ nhiệm vụ: service xử logic, repository truy vấn DB
- [ ] `viewLearningPathFollower` dùng `getRawMany()` để trả về chính xác field
- [ ] `unfollow` kiểm tra tồn tại trước khi xóa

---

## 8. Từ A đến Z cho team noncode

1. User muốn theo dõi học trình, frontend gửi `POST /learning-paths/:id`.
2. Backend xác thực token, kiểm tra quyền, rồi lưu `learning_path_id` + `user_id` vào bảng follow.
3. Khi user muốn xem lộ trình đang follow, frontend gọi `GET /learning-paths/me/following-learning-paths`.
4. Backend trả mảng learning path đã follow kèm thời điểm follow.
5. Khi user muốn hủy theo dõi, frontend gửi `DELETE /learning-paths/learning-paths/:id/unfollow`.
6. Backend kiểm tra record tồn tại, rồi xóa.
7. Administrator/manager có thể xem ai đang follow bằng `GET /learning-paths/:id/follower`.

---

## 9. Vị trí file này
- File docs: `backend/monolithic/src/modules/learning-paths/learning-path-follow.md`
- Đây là tài liệu kỹ thuật nội bộ cho module `learning-paths`.

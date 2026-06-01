# Hướng dẫn Auth cho Backend (NestJS)

Tài liệu này dành cho thành viên nhóm khi implement API cần đăng nhập, lấy `userId` từ JWT, và query dữ liệu theo user trong TypeORM.

---

## 1. Cách auth hoạt động trong project

```text
Client gửi request
    │
    ├─ Header: Authorization: Bearer <token>
    └─ Hoặc Cookie: access_token=<token>
            │
            ▼
    JwtAuthGuard (global – bật trong app.module.ts)
            │
            ├─ Route có @Public() → bỏ qua, không cần token
            └─ Route không @Public() → JwtStrategy verify token
                        │
                        ▼
                request.user = { userId, email, roleId, roleName }
                        │
                        ▼
                Controller dùng @CurrentUser() để lấy thông tin user
```

**Đăng nhập / đăng ký thành công** trả về:

- Field `token` trong JSON body (client lưu localStorage / memory).
- Cookie `access_token` (httpOnly, browser tự gửi nếu `credentials: 'include'`).

---

## 2. Quy tắc mặc định: mọi route đều cần đăng nhập

Trong `app.module.ts`, `JwtAuthGuard` được đăng ký global:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

→ **Không cần** thêm `@UseGuards(JwtAuthGuard)` trên từng controller.

Chỉ cần làm thêm khi route **không** yêu cầu đăng nhập.

---

## 3. Route công khai (không cần token)

Dùng decorator `@Public()`:

```typescript
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login() { /* ... */ }

  @Public()
  @Post('register')
  register() { /* ... */ }
}
```

**Ví dụ cần `@Public()`:** login, register, logout, health check, webhook, `GET /roles` (nếu cho xem danh sách role).

**Không** gắn `@Public()` cho: tạo khóa học, enrollment, profile, API “của tôi”, v.v.

---

## 4. Lấy `userId` và thông tin user trong Controller

### Decorator `@CurrentUser()`

File: `src/common/decorators/current-user.decorator.ts`

```typescript
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';

@Get('me')
getMe(@CurrentUser() user: JwtPayloadUser) {
  // user.userId   → ID trong bảng users (dùng cho hầu hết query)
  // user.email
  // user.roleId
  // user.roleName → 'learner' | 'course provider' | 'admin' | 'organization'
  return this.authService.getMe(user.userId);
}
```

### Ví dụ: chỉ cần `userId`

```typescript
@Get('my-courses')
findMyCourses(@CurrentUser('userId') userId: number) {
  return this.coursesService.findByUserId(userId);
}
```

> `@CurrentUser('userId')` chỉ hoạt động nếu decorator được mở rộng nhận `data` key. Hiện tại decorator trả cả object — dùng `user.userId` hoặc cập nhật decorator sau. **Khuyến nghị:** dùng `@CurrentUser() user` rồi `user.userId`.

---

## 5. Client gửi token như thế nào

### Cách 1: Bearer token (SPA, mobile)

```http
GET /courses/my HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

```typescript
// Frontend (fetch)
fetch('http://localhost:5001/courses/my', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Cách 2: Cookie (cùng domain / CORS có credentials)

```typescript
fetch('http://localhost:5001/auth/me', {
  credentials: 'include',
});
```

Server đọc token từ:

1. `Authorization: Bearer ...`
2. Cookie `access_token`

(cấu hình trong `src/common/strategies/jwt.strategy.ts`)

---

## 6. Entity: thiết kế khi dữ liệu thuộc về user

Auth **không** lưu trong entity riêng — JWT chỉ xác định “ai đang gọi API”. Dữ liệu nghiệp vụ gắn user qua **foreign key `user_id`**.

### Mẫu đúng (đã có trong project)

**`Learner`** – profile gắn 1 user:

```typescript
@Entity('learner_profiles')
export class Learner {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @OneToOne(() => User, (user) => user.learner, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // ... các field nghiệp vụ
}
```

**`CourseProvider`** – tương tự:

```typescript
@PrimaryColumn({ name: 'user_id' })
userId!: number;

@OneToOne(() => User, (user) => user.courseProvider, { nullable: false })
@JoinColumn({ name: 'user_id' })
user!: User;
```

**`Enrollment`** (ví dụ khóa học user đã đăng ký):

```typescript
@ManyToOne(() => User, (user) => user.enrollments)
@JoinColumn({ name: 'user_id' })
user!: User;
```

### Nguyên tắc

| Việc nên làm | Việc không nên |
|--------------|----------------|
| Cột `user_id` / quan hệ tới `User` | Lưu JWT hoặc password trong entity nghiệp vụ |
| Query `where: { userId }` từ `@CurrentUser()` | Tin `userId` client gửi trong body/query (có thể giả mạo) |
| `userId` từ token = người đang đăng nhập | Dùng `:id` trên URL để xem/sửa data user khác mà không check quyền |

---

## 7. Service: query theo user đã đăng nhập

Luôn truyền `userId` từ controller (lấy từ JWT), **không** lấy từ DTO.

### Ví dụ: danh sách enrollment của tôi

**Controller**

```typescript
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('me')
  findMine(@CurrentUser() user: JwtPayloadUser) {
    return this.enrollmentsService.findByUserId(user.userId);
  }
}
```

**Service**

```typescript
@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  findByUserId(userId: number) {
    return this.enrollmentRepo.find({
      where: { user: { userId } }, // hoặc where: { userId } nếu entity có cột userId
      relations: ['course'],
    });
  }

  async findOneForUser(enrollmentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { enrollmentId, user: { userId } },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    return enrollment;
  }
}
```

**Controller – chi tiết 1 bản ghi (chỉ của mình)**

```typescript
@Get('me/:id')
findOneMine(
  @Param('id') id: string,
  @CurrentUser() user: JwtPayloadUser,
) {
  return this.enrollmentsService.findOneForUser(+id, user.userId);
}
```

### Tạo bản ghi mới gắn user hiện tại

```typescript
@Post()
create(
  @Body() dto: CreateEnrollmentDto,
  @CurrentUser() user: JwtPayloadUser,
) {
  return this.enrollmentsService.create(dto, user.userId);
}

// Service
async create(dto: CreateEnrollmentDto, userId: number) {
  const enrollment = this.enrollmentRepo.create({
    ...dto,
    user: { userId } as User, // hoặc userId nếu có cột trực tiếp
  });
  return this.enrollmentRepo.save(enrollment);
}
```

---

## 8. Giới hạn theo role (tùy chọn)

Constant role: `src/common/constants/role.constants.ts`

```typescript
import { RoleName } from 'src/common/constants/role.constants';
import { ForbiddenException } from '@nestjs/common';

if (user.roleName !== RoleName.COURSE_PROVIDER) {
  throw new ForbiddenException('Chỉ course provider mới được tạo khóa học');
}
```

Có thể tách guard riêng sau (ví dụ `RolesGuard`) — hiện tại check trong service/controller là đủ cho nhóm nhỏ.

---

## 9. Checklist khi thêm API mới

- [ ] Route có cần đăng nhập không? → Nếu không: `@Public()`.
- [ ] Controller nhận `@CurrentUser() user` và truyền `user.userId` xuống service.
- [ ] Service filter `where` theo `userId` từ JWT, không từ body.
- [ ] Entity có quan hệ / cột `user_id` nếu data thuộc về user.
- [ ] `GET/PATCH/DELETE :id` — verify bản ghi thuộc `user.userId` (tránh IDOR).
- [ ] Test với Postman: không token → `401`; token hết hạn → `401`; token đúng → `200`.

---

## 10. Test nhanh với curl

```bash
# Login
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'

# Dùng token trả về
export TOKEN="<token_từ_response>"

# API cần auth
curl http://localhost:5001/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 11. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| `401 Unauthorized` trên mọi API | Thiếu / sai token | Gửi `Authorization: Bearer ...` hoặc cookie `access_token` |
| `401` trên login/register | Quên `@Public()` | Thêm `@Public()` cho route auth |
| `user` là `undefined` trong controller | Guard không chạy / route public | Bỏ `@Public()` hoặc kiểm tra import guard |
| Query trả data user khác | Dùng `userId` từ body thay vì JWT | Chỉ dùng `user.userId` từ `@CurrentUser()` |
| Entity lỗi relation | Sai tên property `User` | Khớp với `user.entity.ts` (`learner`, `courseProvider`, …) |

---

## 12. File tham chiếu trong repo

| File | Mục đích |
|------|----------|
| `src/common/guards/jwt-auth.guard.ts` | Guard global |
| `src/common/strategies/jwt.strategy.ts` | Đọc token, gán `request.user` |
| `src/common/decorators/public.decorator.ts` | `@Public()` |
| `src/common/decorators/current-user.decorator.ts` | `@CurrentUser()` |
| `src/common/helpers/jwt.helper.ts` | Tạo token, set/xóa cookie |
| `src/modules/auth/auth.controller.ts` | Ví dụ login + `GET /auth/me` |
| `src/app.module.ts` | Đăng ký `APP_GUARD` |

---

## 13. Tóm tắt một dòng

> **API cần đăng nhập:** không gắn `@Public()` → trong controller dùng `@CurrentUser()` lấy `user.userId` → trong service query `where` theo `userId` đó; entity nghiệp vụ luôn liên kết `users` qua `user_id`.

Nếu cần làm rõ thêm (guard theo role, refresh token), nhắn lead backend để bổ sung vào tài liệu này.

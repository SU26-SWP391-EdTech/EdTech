# Default Admin Seeding

Đoạn code này dùng để tự động tạo tài khoản admin mặc định khi ứng dụng NestJS khởi động.

## Luồng xử lý

Khi ứng dụng bootstrap hoàn tất, phương thức `onApplicationBootstrap()` sẽ được gọi. Bên trong phương thức này, hệ thống tiếp tục gọi `createDefaultAdmin()` để kiểm tra và tạo tài khoản admin mặc định nếu cần.

Đầu tiên, hệ thống đếm số lượng user hiện có trong database thông qua `this.userRepo.count()`. Nếu đã có ít nhất một user, quá trình seed admin sẽ được bỏ qua và ghi log:

```ts
Users already exist, skip admin seeding
```

Điều này giúp tránh việc tạo trùng tài khoản admin mỗi khi ứng dụng khởi động lại.

Nếu database chưa có user nào, hệ thống sẽ tìm role `ADMIN` trong bảng roles:

```ts
where: { roleName: RoleEnum.ADMIN }
```

Nếu không tìm thấy role `ADMIN`, chương trình sẽ throw lỗi `ADMIN role not found`, vì tài khoản admin không thể được tạo nếu chưa có role tương ứng.

Sau khi tìm được role admin, mật khẩu mặc định `Admin@123` sẽ được mã hóa bằng `bcrypt` với salt rounds là `10`. Mật khẩu đã hash sau đó được lưu vào database thay vì lưu mật khẩu dạng plain text.

Tiếp theo, hệ thống tạo một user admin mặc định với các thông tin:

- `fullName`: `Admin`
- `email`: `admin@system.com`
- `password`: mật khẩu đã được hash
- `role`: role `ADMIN`
- `isEmailVerified`: `true`

Cuối cùng, user admin được lưu vào database bằng `this.userRepo.save(admin)`, sau đó hệ thống ghi log:

```ts
Default admin account created
```

## Mục đích

Logic này giúp hệ thống luôn có một tài khoản admin ban đầu để quản trị sau lần khởi chạy đầu tiên, đặc biệt hữu ích trong môi trường development hoặc khi deploy database mới.

## Lưu ý bảo mật

Tài khoản và mật khẩu mặc định nên được thay đổi sau khi đăng nhập lần đầu. Trong môi trường production, nên đưa email và mật khẩu admin mặc định vào biến môi trường thay vì hard-code trực tiếp trong source code.

# Mo ta commit: `fix: restrict register vie api`

Tai lieu nay tom tat nhung thay doi trong cac commit co message `fix: restrict register vie api`, gom:

- `c159f64` - Sat Jun 6 21:54:11 2026 +0700
- `593d207` - Sat Jun 6 22:19:18 2026 +0700

## Muc tieu chinh

Commit nay tap trung vao viec gioi han quyen tao tai khoan thong qua API dang ky va API quan ly user. Truc tiep nhat la ngan nguoi dung tu dang ky tai khoan voi role nhay cam nhu `admin` hoac `academic manager`.

Ben canh do, commit cung cap nhat mot so API course va them giao dien/frontend service lien quan den quan ly khoa hoc.

## Thay doi backend ve dang ky tai khoan

Trong `backend/monolithic/src/modules/auth/auth.service.ts`, phan xu ly `register` duoc bo sung validate role:

- Import `RoleEnum` tu `src/common/enums/role.enum`.
- Sau khi tim thay role theo `roleName`, he thong kiem tra role duoc yeu cau.
- Neu role la `ADMIN` hoac `ACADEMIC_MANAGER`, API se tra ve `BadRequestException`.
- Message loi: `You do not have permission to set admin and academic manager role`.

Ket qua la API register khong con cho phep nguoi dung tu gan cac role co quyen cao. Nguoi dung chi co the dang ky cac role duoc phep, con viec tao admin hoac academic manager phai di qua luong co quyen phu hop.

## Thay doi backend ve Users API

Trong `backend/monolithic/src/modules/users/users.controller.ts`, cac endpoint quan ly user duoc si chat quyen truy cap:

- Them import `RoleEnum`.
- Endpoint `POST /user` duoc gan `@Roles(RoleEnum.ADMIN)`, chi admin moi duoc tao user truc tiep.
- Endpoint `PATCH /user/:id` duoc gan `@Roles(RoleEnum.ADMIN)`, chi admin moi duoc cap nhat user theo id.
- Endpoint `DELETE /user/:id` duoc gan `@Roles(RoleEnum.ADMIN)`, chi admin moi duoc xoa user.
- Cac role dang hard-code bang string duoc thay bang `RoleEnum`, giup giam sai chinh ta va dong bo voi enum chung cua he thong.
- Endpoint doi mat khau dung `RoleEnum.ACADEMIC_MANAGER`, `RoleEnum.COURSE_PROVIDER`, `RoleEnum.LEARNER`.
- Endpoint cap nhat/chinh sua profile academic user dung `RoleEnum.COURSE_PROVIDER` va `RoleEnum.ACADEMIC_MANAGER`.

Tac dong cua phan nay la cac API quan tri user ro rang hon ve mat phan quyen, tranh viec user thuong goi API tao/sua/xoa tai khoan khac.

## Thay doi backend ve Courses API

Trong `backend/monolithic/src/modules/courses/courses.controller.ts`:

- `GET /courses` duoc doi thanh API lay tat ca khoa hoc, goi `coursesService.findAll()`.
- API search khoa hoc duoc tach sang `GET /courses/search`.
- Swagger response cho API lay tat ca khoa hoc duoc cap nhat mo ta.

Trong `backend/monolithic/src/modules/courses/courses.repository.ts`:

- `findAllCourses()` khong load relation `organization` nua.
- API lay danh sach khoa hoc chi load relation `user`.

Tac dong cua phan nay la route course ro hon: `/courses` de lay tat ca, `/courses/search` de tim kiem/loc.

## Thay doi frontend lien quan course

Commit them cac file frontend moi:

- `frontend/src/pages/course/CourseManagement.tsx`
- `frontend/src/pages/course/CourseDetail.tsx`
- `frontend/src/services/course/course.service.ts`

Trong `CourseManagement.tsx`:

- Tao man hinh quan ly khoa hoc co loading state, error state, empty state va bang hien thi danh sach course.
- Co nut `Create Course`.
- Hien tai phan goi API that van duoc ghi chu TODO; component dang set danh sach course rong.

Trong `course.service.ts`:

- Dinh nghia type `CourseStatus`.
- Dinh nghia interface `Course`.
- Them ham `getCourses()` goi `GET /courses`.

Trong `frontend/src/routes/index.tsx`:

- Import `CourseManagement`.
- Them route `/provider/courses`.
- Route nay duoc bao boi `ProviderGuard` va su dung `DashboardLayout role="provider"`.

## Tai lieu frontend duoc them

Commit `c159f64` them file:

- `frontend/markdown/frontend_coding_guide_for_backend_dev.md`

Day la tai lieu huong dan coding frontend cho lap trinh vien backend, giup thong nhat cach viet UI/frontend trong project.

## Tong ket tac dong

Sau commit nay:

- API register khong cho phep tu dang ky role `admin` va `academic manager`.
- Cac API tao, sua, xoa user duoc gioi han cho admin.
- Cac decorator role trong Users API duoc chuyen sang dung `RoleEnum`.
- API course duoc tach ro giua lay tat ca khoa hoc va search khoa hoc.
- Frontend co them khung ban dau cho man hinh quan ly khoa hoc cua provider.

## Luu y

Ten commit co chu `vie api`, kha nang cao la viet tat/loi go cua `via api`. Noi dung thuc te cua commit la restrict viec dang ky va thao tac user thong qua API.

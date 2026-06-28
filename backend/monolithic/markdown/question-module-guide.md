# Question Module Guide

## 1. Mục đích module

Module `question` chịu trách nhiệm quản lý câu hỏi và các lựa chọn trả lời cho một assessment trong hệ thống học tập.

Nó phục vụ các hoạt động chính:
- Tạo, sửa, xóa câu hỏi
- Lấy câu hỏi theo ID hoặc danh sách câu hỏi của một lesson
- Quản lý các option (phương án trả lời) của câu hỏi
- Hỗ trợ frontend render giao diện làm bài, chỉnh sửa assessment và review nội dung

Module này thường được dùng trong các luồng:
- Provider tạo bài kiểm tra/assessment
- Learner xem và làm bài
- Admin/Academic Manager kiểm tra và quản lý nội dung

---

## 2. Vai trò của module trong hệ thống

`question` không hoạt động độc lập. Nó phụ thuộc vào các module khác:
- `assessment`: mỗi câu hỏi thuộc về một assessment
- `lessons`: câu hỏi được gắn theo lesson thông qua assessment
- `courses`: câu hỏi thuộc về một course thông qua lesson → assessment
- `enrollments`: learner cần có enrollment active mới có thể truy cập câu hỏi
- `users`/`roles`: kiểm soát quyền truy cập

Tóm lại: một câu hỏi luôn nằm trong chuỗi:

course -> lesson -> assessment -> question

---

## 3. Cấu trúc thư mục

Thư mục module gồm:

- `question.controller.ts`: định nghĩa API endpoints
- `question.service.ts`: xử lý nghiệp vụ
- `question.repository.ts`: thao tác với database cho entity `Question`
- `question-option.repository.ts`: thao tác với database cho entity `QuestionOption`
- `dto/`: các DTO dùng cho request/response
- `entities/`: entity ORM cho question và option
- `question.module.ts`: đăng ký module và dependencies

---

## 4. Các entity chính

### 4.1 Question

Entity `Question` đại diện cho một câu hỏi trong hệ thống.

Các trường chính:
- `questionId`: ID duy nhất của câu hỏi
- `assessmentId`: ID của assessment mà câu hỏi thuộc về
- `content`: nội dung câu hỏi
- `type`: loại câu hỏi (`MULTIPLE_CHOICE_SINGLE`, `MULTIPLE_CHOICE_MULTI`, `TRUE_FALSE`)
- `points`: số điểm của câu hỏi
- `position`: thứ tự hiển thị trong assessment
- `createdAt`: thời gian tạo

Quan hệ:
- Nhiều `Question` thuộc về một `Assessment`
- Một `Question` có nhiều `QuestionOption`

### 4.2 QuestionOption

Entity `QuestionOption` đại diện cho một phương án trả lời của câu hỏi.

Các trường chính:
- `optionId`: ID duy nhất của option
- `questionId`: ID câu hỏi cha
- `content`: nội dung phương án
- `isCorrect`: có phải đáp án đúng không
- `position`: thứ tự hiển thị

---

## 5. Enum quan trọng

### 5.1 QuestionType

File:
- `src/common/enums/question-type.enum.ts`

Các giá trị:
- `MULTIPLE_CHOICE_SINGLE`: câu hỏi một đáp án đúng
- `MULTIPLE_CHOICE_MULTI`: câu hỏi nhiều đáp án đúng
- `TRUE_FALSE`: câu hỏi đúng/sai

Frontend nên dùng enum này để render đúng UI theo từng loại câu hỏi.

---

## 6. DTOs và ý nghĩa

### 6.1 CreateQuestionDto

Dùng khi tạo câu hỏi.

Các trường:
- `content`: nội dung câu hỏi
- `type`: loại câu hỏi
- `points`: số điểm
- `position`: vị trí hiển thị

Validation:
- `content` không được rỗng
- `type` phải thuộc enum `QuestionType`
- `points` và `position` phải là số dương

### 6.2 UpdateQuestionDto

Dùng khi chỉnh sửa câu hỏi. Đây là `PartialType` của `CreateQuestionDto`, nên các trường có thể optional.

### 6.3 QuestionResponseDto

Dùng để trả dữ liệu câu hỏi cho client.

Các trường trả về:
- `questionId`
- `assessmentId`
- `content`
- `type`
- `points`
- `position`
- `createdAt`

### 6.4 CreateQuestionOptionDto

Dùng khi tạo option cho câu hỏi.

Các trường:
- `content`: nội dung option
- `isCorrect`: có phải đáp án đúng
- `position`: thứ tự option

### 6.5 QuestionOptionResponseDto

Dùng để trả về dữ liệu option cho client.

---

## 7. API endpoints

Tất cả endpoint trong module đều có bảo vệ bằng JWT và role-based access control.

### 7.1 Tạo câu hỏi

- Method: `POST`
- Route: `/question/courses/:courseId/lesson/:lessonId/assessment/:assessmentId`
- Vai trò: `COURSE_PROVIDER`
- Mục đích: tạo câu hỏi cho một assessment cụ thể

Request body:
- `content`
- `type`
- `points`
- `position`

### 7.2 Cập nhật câu hỏi

- Method: `PATCH`
- Route: `/question/courses/:courseId/lesson/:lessonId/assessment/:assessmentId/question/:questionId`
- Vai trò: `COURSE_PROVIDER`
- Mục đích: sửa nội dung hoặc cấu hình câu hỏi

### 7.3 Xóa câu hỏi

- Method: `DELETE`
- Route: `/question/courses/:courseId/lesson/:lessonId/assessment/:assessmentId/question/:questionId`
- Vai trò: `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- Mục đích: xóa câu hỏi khỏi assessment

### 7.4 Lấy câu hỏi theo ID

- Method: `GET`
- Route: `/question/:id`
- Vai trò: `LEARNER`, `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- Mục đích: lấy chi tiết một câu hỏi

### 7.5 Lấy tất cả câu hỏi của một lesson

- Method: `GET`
- Route: `/question/courses/:courseId/lesson/:lessonId/questions`
- Vai trò: `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- Mục đích: lấy toàn bộ câu hỏi trong lesson/assessment liên quan

### 7.6 Tạo option cho câu hỏi

- Method: `POST`
- Route: `/question/:questionId/option`
- Vai trò: `COURSE_PROVIDER`
- Mục đích: thêm một phương án trả lời cho một câu hỏi

### 7.7 Reorder options

- Method: `PATCH`
- Route: `/question/:questionId/options/reorder`
- Vai trò: `COURSE_PROVIDER`
- Mục đích: sắp xếp lại thứ tự các option

### 7.8 Cập nhật option

- Method: `PATCH`
- Route: `/question/option/:optionId`
- Vai trò: `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- Mục đích: sửa option

### 7.9 Xóa option

- Method: `DELETE`
- Route: `/question/option/:optionId`
- Vai trò: `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- Mục đích: xóa option

### 7.10 Lấy option theo ID

- Method: `GET`
- Route: `/question/option/:optionId`
- Vai trò: `LEARNER`, `COURSE_PROVIDER`, `ACADEMIC_MANAGER`
- Mục đích: lấy thông tin một option cụ thể

---

## 8. Luồng xử lý nghiệp vụ (end-to-end)

### 8.1 Khi tạo câu hỏi

1. Controller nhận request từ client
2. Controller gọi `questionService.createQuestion(...)`
3. Service kiểm tra assessment và lesson có tồn tại không
4. Service tạo entity `Question`
5. Repository lưu vào DB
6. Service trả về `QuestionResponseDto`

### 8.2 Khi lấy câu hỏi

1. Controller nhận request
2. Service gọi repository tìm `Question` theo ID
3. Service kiểm tra quyền truy cập
   - Nếu user là course provider sở hữu course -> được phép
   - Nếu không thì phải có enrollment active trong course
4. Service trả về `QuestionResponseDto`

### 8.3 Khi tạo option cho câu hỏi

1. Controller nhận request
2. Service xác thực người dùng có quyền truy cập câu hỏi
3. Repository tạo `QuestionOption`
4. Service trả về `QuestionOptionResponseDto`

---

## 9. Quyền truy cập và bảo mật

Module này dùng:
- `JwtAuthGuard`: bắt buộc login
- `RolesGuard`: kiểm soát role
- `Throttle`: giới hạn request trong một khoảng thời gian

Điểm cần lưu ý:
- Learner chỉ được xem câu hỏi nếu đã enroll course đó
- Provider có thể quản lý câu hỏi của course mình
- Academic Manager có thể xem và quản lý nội dung

---

## 10. Dữ liệu trả về cho frontend

Frontend nên dựa vào `QuestionResponseDto` và `QuestionOptionResponseDto` khi render UI.

### 10.1 Ví dụ dữ liệu question

```json
{
  "questionId": 1,
  "assessmentId": 10,
  "content": "What is the capital of France?",
  "type": "MULTIPLE_CHOICE_SINGLE",
  "points": 5,
  "position": 1,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### 10.2 Ví dụ dữ liệu option

```json
{
  "optionId": 1,
  "questionId": 10,
  "content": "Paris",
  "isCorrect": true,
  "position": 1,
  "questionContent": "What is the capital of France?"
}
```

### 10.3 Gợi ý frontend mapping

- `type = MULTIPLE_CHOICE_SINGLE` → render radio button
- `type = MULTIPLE_CHOICE_MULTI` → render checkbox
- `type = TRUE_FALSE` → render true/false selector

---

## 11. Gợi ý cách gọi API từ frontend

### 11.1 Tạo câu hỏi

```ts
POST /question/courses/:courseId/lesson/:lessonId/assessment/:assessmentId
```

Body:
```json
{
  "content": "What is 2 + 2?",
  "type": "MULTIPLE_CHOICE_SINGLE",
  "points": 5,
  "position": 1
}
```

### 11.2 Lấy danh sách câu hỏi

```ts
GET /question/courses/:courseId/lesson/:lessonId/questions
```

### 11.3 Lấy câu hỏi theo ID

```ts
GET /question/:id
```

### 11.4 Tạo option

```ts
POST /question/:questionId/option
```

Body:
```json
{
  "content": "4",
  "isCorrect": true,
  "position": 1
}
```

---

## 12. Các lưu ý khi review code

Khi review module này, backend dev nên chú ý các điểm sau:
- Service có kiểm tra lesson/assessment trước khi tạo câu hỏi không?
- Có kiểm tra quyền truy cập phù hợp không?
- Có xử lý lỗi (NotFound/Forbidden/BadRequest) đúng không?
- Có dùng repository đúng đơn nhiệm không?
- Có đảm bảo `position` sắp xếp đúng không?
- Có xử lý `options` khi xóa câu hỏi hay không?

---

## 13. Các điểm cần chú ý khi implement tiếp

Nếu team cần mở rộng module này, các tính năng thường gặp là:
- Hỗ trợ upload ảnh / media cho câu hỏi
- Hỗ trợ câu hỏi tự luận
- Hỗ trợ shuffle options cho learner
- Hỗ trợ randomize câu hỏi theo assessment
- Hỗ trợ đánh dấu câu hỏi bắt buộc
- Hỗ trợ import/export câu hỏi từ file

---

## 14. Tóm tắt ngắn

Module `question` là một module trung tâm cho việc quản lý câu hỏi trong assessment. Nó kết nối dữ liệu từ course → lesson → assessment → question và cung cấp API cho cả provider và learner. Nếu bạn hiểu được cấu trúc này, bạn sẽ dễ dàng:
- review backend logic
- implement UI cho tạo/sửa/xem câu hỏi
- gọi API đúng route và parse response đúng DTO

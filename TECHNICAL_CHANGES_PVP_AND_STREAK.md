# Báo Cáo Kỹ Thuật: Cập Nhật Hệ Thống PvP & Đồng Bộ Learner Streak

Tài liệu này tổng hợp toàn bộ các thay đổi kỹ thuật, sửa lỗi kiến trúc backend và đồng bộ trạng thái giao diện frontend đã được thực hiện trong phiên làm việc hôm nay.

---

## I. Sửa Lỗi Hệ Thống PvP Assessment (Thách Đấu Học Viên)

### 1. Vấn Đề (Problem)
- Khi học viên thách đấu người khác trong phòng PvP, hệ thống bị lỗi không tìm thấy `assessmentId = 3` (hoặc `1`). Nguyên nhân do mã nguồn bị fix cứng ID của bài kiểm tra.
- Trường hợp một khóa học chưa có bài kiểm tra riêng dạng `PVP` hoặc số lượng câu hỏi ít hơn 5 câu, hệ thống bị crash do không thể tải đủ bộ câu hỏi thách đấu.

### 2. Sửa Đổi Kỹ Thuật (Technical Changes)
- **`backend/monolithic/src/modules/assessment/service/assessment.service.ts`**:
  - Loại bỏ hoàn toàn các fallback cố định `assessmentId = 3` hay `1`.
  - Tự động lấy danh sách câu hỏi ưu tiên theo 2 cấp:
    - **Ưu tiên 1**: Tìm và nạp bộ câu hỏi từ bài kiểm tra có `type = PVP` của chính khóa học đó.
    - **Ưu tiên 2 (Fallback)**: Nếu bài PVP không tồn tại hoặc có ít hơn 5 câu hỏi, tự động truy vấn mở rộng các bài kiểm tra dạng khác (`LESSON_QUIZ`, `PRACTICE`) trong cùng khóa học để bù đắp đủ 5 câu.
- **`backend/monolithic/src/modules/pvp/repositories/match.repository.ts`**:
  - Cập nhật phương thức `findQuestionsByCourseId` với điều kiện `type: Not(AssessmentType.PVP)` để lấy tất cả các câu hỏi quiz/practice thuộc khóa học phục vụ cho cơ chế fallback.

---

## II. Sửa Lỗi Đồng Bộ Learner Streak (Chuỗi Ngày Học Tập)

### 1. Vấn Đề (Problem)
- Học viên học xong bài học (video, đọc tài liệu) hoặc hoàn thành bài test nhưng Streak trên Header, Profile và `/learner` Dashboard vẫn giữ nguyên **0 Days**.

### 2. Nguyên Nhân Gốc Rễ (Root Cause Analysis)
1. **Backend**:
   - `LearnerStreakService.updateStreak` trước đó chỉ truy vấn bảng `AssessmentSession` (bài test) và bỏ qua bảng `LearnerLessonProgress` (tiến độ xem bài học video/đọc).
   - Khi hoàn thành bài học, hệ thống ghi nhận tiến độ vào DB trước rồi gọi `updateStreak(userId, new Date())`. Hàm `updateStreak` dùng phép so sánh milisecond `lessonToday.completedAt < completedAt`, dẫn đến bản ghi vừa tạo bị hiểu nhầm là *"đã học một bài trước đó trong ngày"* -> hàm thực hiện `return` sớm **trước khi kịp tăng Streak**.
2. **Frontend**:
   - `useLearnerProfile.ts` sau khi gọi API backend lấy `currentStreak` chính xác thì lại bị dòng code cũ ghi đè bởi giá trị rỗng/rác trong `localStorage`.
   - `LearnerHeader.tsx` và Dashboard không có cơ chế lắng nghe sự kiện để tự làm mới Streak khi người dùng vừa học xong bài học.

### 3. Sửa Đổi Kỹ Thuật (Technical Changes)

#### Backend Monolithic
- **`src/modules/learners/services/learner-streak.service.ts`**:
  - Thay đổi cơ chế phát hiện lượt học trong ngày: Dùng tổng số lượng hoạt động hoàn thành hôm nay (`totalToday = sessionsTodayCount + lessonsTodayCount`).
  - Nếu `totalToday === 1` (lượt học đầu tiên hôm nay) hoặc `currentStreak === 0`, thực hiện cập nhật Streak (tăng 1 ngày nếu học liên tiếp hôm qua, hoặc khởi tạo = 1).
- **`src/modules/learners/services/learners.service.ts`**:
  - Bổ sung cơ chế **Auto-Recovery**: Trong hàm `viewLearnerProfile`, nếu phát hiện học viên có lịch sử ngày hoạt động (`activeDates`) nhưng `currentStreak === 0`, backend tự động gọi `updateStreak` để phục hồi lại đúng số ngày Streak cho học viên ngay trong lần load trang.

#### Frontend React
- **`src/hooks/user/useLearnerProfile.ts`**:
  - Loại bỏ hoàn toàn việc đọc và ghi đè Streak từ `localStorage`. Sử dụng trực tiếp `currentStreak` và `longestStreak` trả về từ API backend.
- **Phát Sự Kiện Thời Gian Thực (Event-Driven Sync)**:
  - **`src/hooks/lesson/useLessonPage.ts`**: Khi bấm hoàn thành bài học (`persistLessonCompletion`), phát sự kiện `window.dispatchEvent(new CustomEvent('streak-updated'))`.
  - **`src/services/assessment/assessment.service.ts`**: Khi nộp bài test (`submitAnswers`), phát sự kiện `window.dispatchEvent(new CustomEvent('streak-updated'))`.
  - **`src/components/header/roleNav/LearnerHeader.tsx`**: Lắng nghe sự kiện `streak-updated` để lập tức gọi lại API và cập nhật icon ngọn lửa Streak trên Thanh Header.
  - **`src/hooks/user/useLearnerDashboard.tsx`**: Lắng nghe sự kiện `streak-updated` để làm mới các chỉ số trên trang Dashboard `/learner`.

---

## III. Danh Sách Các File Đã Thay Đổi (Modified Files)

### Backend (`backend/monolithic`)
1. `src/modules/assessment/service/assessment.service.ts`
2. `src/modules/pvp/repositories/match.repository.ts`
3. `src/modules/learners/services/learner-streak.service.ts`
4. `src/modules/learners/services/learners.service.ts`
5. `src/modules/learners/learners.module.ts`

### Frontend (`frontend`)
1. `src/hooks/user/useLearnerProfile.ts`
2. `src/components/header/roleNav/LearnerHeader.tsx`
3. `src/hooks/user/useLearnerDashboard.tsx`
4. `src/hooks/lesson/useLessonPage.ts`
5. `src/services/assessment/assessment.service.ts`

---

## IV. Kiểm Thử & Xác Nhận (Verification)
- Cả Backend và Frontend đã được kiểm tra biên dịch bằng TypeScript (`npx tsc --noEmit`) thành công 100%, không phát sinh lỗi.
- Streak khôi phục và nhảy số thời gian thực ngay khi học viên hoàn thành bài học hoặc bài test.

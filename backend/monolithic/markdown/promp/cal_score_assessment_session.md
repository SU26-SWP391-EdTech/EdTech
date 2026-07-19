# Tổng quan
Đây là một website Learning Path được xây dựng bằng NestJS.
# Yêu cầu
- Phân tích cấu trúc dự án hiện có trước khi triển khai.
- Tuân thủ kiến trúc của NestJS.
- Phân chia đúng các tầng:
  - Module
  - Controller
  - Service
  - Repository
  - DTO
  - Entity
- Không viết toàn bộ logic trong Controller hoặc Service nếu có thể tách nhỏ.
- Không cần viết Unit Test hoặc E2E Test.
- Tận dụng các module, service và repository đang tồn tại nếu phù hợp, không tạo code trùng lặp
# Nhiệm vụ 
## Triển khai chức năng tự động chấm điểm khi Learner hoàn thành Assessment
### Mô tả 
- hãy thêm earned_points -> default 0 trong entity assessment_sessions
- API: PATCH /api/assessment/:id/session/submit 
- Trong đó id là assessmentId
user sẽ nhập body
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [5]
    },
    {
      "questionId": 2,
      "selectedOptionIds": [9, 10]
    },
    {
      "questionId": 3,
      "selectedOptionIds": [15]
    }
  ]
}

### logic 
1. Xác thực & Tìm kiếm phiên làm bài 
- Xác thực learner
- Tìm AssessmentSession tương ứng với `userId` và `assessmentId`.
- Nếu không tìm thấy hoặc phiên đã hoàn thành (completedAt != null) thì trả về lỗi phù hợp.

2. Lấy dữ liệu Assessment
- Từ assessmentId, truy vấn đầy đủ:
    - Assessment
    - Questions
    - QuestionOptions
- Để phục vụ quá trình chấm điểm.

3. Chấm Điểm 
- Duyệt từng câu hỏi trong Assessment.
    - Với câu hỏi dạng MULTIPLE_CHOICE_SINGLE. Đúng khi:
        + Learner chỉ chọn đúng một đáp án.
        + Đáp án được chọn có isCorrect = true.

    - Với TRUE_FALSE: Xử lý tương tự MULTIPLE_CHOICE_SINGLE.

    - Với MULTIPLE_CHOICE_MULTI. Đúng khi:
        + Learner chọn đầy đủ tất cả đáp án đúng.
        + Không chọn bất kỳ đáp án sai nào.

4. Tính điểm 
- Với mỗi câu đúng: earnedPoints += question.points
- Tổng điểm tối đa: totalPoints = SUM(question.points)
- Tổng điểm phần trăm: score = (earnedPoints / totalPoints) * 100

5. Cập nhật AssessmentSession
- Cập nhật: 
    - score
    - completedAt = CURRENT_TIMESTAMP
    - earned_points = earnedPoints

6. Cập nhật Progress

- Sau khi Assessment được chấm thành công:
    - Gọi sang ProgressModule
   - Đánh dấu Lesson tương ứng là COMPLETED

- Không xử lý trực tiếp logic Progress trong AssessmentService.

7. response 
```
{
  "score": 80,
  "earnedPoints": 8,
  "totalPoints": 10,
  "correctQuestions": 8,
  "totalQuestions": 10,
  "questions": [
    {
      "questionId": 1,
      "isCorrect": true,
      "selectedOptionIds": [5],
      "correctOptionIds": [5]
    },
    {
      "questionId": 2,
      "isCorrect": false,
      "selectedOptionIds": [8],
      "correctOptionIds": [9, 10]
    }
  ]
}
```
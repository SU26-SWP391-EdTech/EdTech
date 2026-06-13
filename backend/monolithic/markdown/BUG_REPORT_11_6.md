# BUG

## LEARNER

### B-1: /api/user/{id} PATCH -- DONE

- Đang là account của mình (role: learner) lại có thể cập nhận lại thông tin tài khoản cho người khác -- DM thằng thảo ngu

### B-2: /api/user/{id} DELETE -- DONE

- Đang ở role: learner. khi xóa user dù không xóa đc nhưng lại hiện "delete successfull" -> Tại sao nó không hiện "You do not have access" - DM thẳng Thảo ngu
- nhấn nữa nó lại hiện "User ID 2 not found" nhung trong database co userId = 2 (chắc là có deletedAt)

### B-3: /api/user GET -- DONE

- Nó không trả về users mà lại trả về []  - DM thằng Thảo ngu
- Thắc mắc: learner đc xem các users à - DM

### B-4: /api/user POST  -- DONE

- learner sao lại đc tạo user - DM thằng Thảo ngu này

### B-5: /api/user/change-password PATCH   -- DONE

- Không thay đổi mk được

### B-6: /api/enrollments/progress/{courseId} PATCH  -- DONE

khi nhập courseId toàn bị lỗi "Validation failed (numeric string is expected)" -> Chưa hiểu mục địch của path này

### B-7: /api/courses/search GET -- DONE

- Tìm kiểu course không có trong data lại trả về "Get course list successfully" (đéo hiểu)

### B-8: /api/courses/{id} DELETE -- DONE

- Vcl learner xóa được course của course provider -> dcm

### B-9: /api/lesson/{id} GET -- DONE

- Tại sao lại xem đc chi tiết lesson trong course dù course này thằng learner chưa errollment -> Ngáo vcl

### B-10: /api/enrollments/enroll/{id} POST -- DONE

- Course đang ở status không phải approve mà vẫn enroll đc

### B-11: /api/learning-paths/{id}/courses

- Hiên thị các khóa học đang ở trạng thái không phải approve

### B-12: /api/learning-paths/{id}

- Hiên thị các khóa học đang ở trạng thái không phải approve

## AM

### B-1: /api/enrollments/enroll/{id} POST

- Course đang ở status không phải approve mà vẫn enroll đc

### B-2: /api/learning-path/{id}/courses

- course đang không phải APPROVE nhưng vẫn thêm vào đc learning path

### B-3: /api/learning-paths/{id}/courses

- Khi thêm course vào learning path thì phải check xem position đó có course hay chưa

## Admin

## CP

### B-1: /api/enrollments/enroll/{id} POST

- Course đang ở status không phải approve mà vẫn enroll đc

### B-2: /api/courses/{id} DELETE

- Vcl CP xóa được course của course provider khác -> dcm

# Chưa check bug ở

- update academic user profile imformation
- Edit academic user profile with avatar upload
- view academic user profile
- update learner profile imformation
- change learner password
- edit learner profile with avatar upload
- view learner profile

nghĩ các trường họp nguy hiểm:

- khi learner đã tham gia khóa học đó. mà thằng AM thấy khóa học đó vi phạm chính sách thì xóa mềm course


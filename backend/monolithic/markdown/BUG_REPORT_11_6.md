# BUG

## LEARNER

### B-1: /api/user/{id} PATCH (Thảo) -- DONE

- Đang là account của mình (role: learner) lại có thể cập nhận lại thông tin tài khoản cho người khác -- DM thằng thảo ngu

### B-2: /api/user/{id} DELETE (Thảo) -- DONE

- Đang ở role: learner. khi xóa user dù không xóa đc nhưng lại hiện "delete successfull" -> Tại sao nó không hiện "You do not have access" - DM thẳng Thảo ngu
- nhấn nữa nó lại hiện "User ID 2 not found" nhung trong database co userId = 2 (chắc là có deletedAt)

### B-3: /api/user GET (Thảo) -- DONE (xem lai)

- Nó không trả về users mà lại trả về []  - DM thằng Thảo ngu
- Note: Learner vẫn được xem các user khác

### B-4: /api/user POST (Thảo)  -- DONE

- learner sao lại đc tạo user - DM thằng Thảo ngu này

### B-5: /api/user/change-password PATCH (Thảo)   -- DONE

- Không thay đổi mk được

### B-6: /api/enrollments/progress/{courseId} PATCH (Thảo) -- DONE

khi nhập courseId toàn bị lỗi "Validation failed (numeric string is expected)" -> Chưa hiểu mục địch của path này

### B-7: /api/courses/search (Thảo) GET -- DONE

- Tìm kiểu course không có trong data lại trả về "Get course list successfully" (đéo hiểu)

### B-8: /api/courses/{id} (Thảo) DELETE -- DONE

- Vcl learner xóa được course của course provider -> dcm

### B-9: /api/lesson/{id (Thảo)} GET  -- DONE

- Tại sao lại xem đc chi tiết lesson trong course dù course này thằng learner chưa errollment -> Ngáo vcl

### B-10: /api/enrollments/enroll/{id} (Thảo) POST -- DONE

- Course đang ở status không phải approve mà vẫn enroll đc

### B-11: /api/learning-paths/{id}/courses (Đăng) GET -- DONE

- Hiên thị các khóa học đang ở trạng thái không phải approve

### B-12: /api/learning-paths/{id} GET (Đăng) 

- Hiên thị các khóa học đang ở trạng thái không phải approve
- NOTE: thật ra cái này không cần lắm vì learner -> click vào 1 learning-path -> show đc all courses (B-11)
## AM

### B-1: /api/enrollments/enroll/{id} (Thảo) POST

- Course đang ở status không phải approve mà vẫn enroll đc
- Cấm AM CP Admin enroll course
### B-2: /api/learning-path/{id}/courses (Đăng) POST -- DONE

- course đang không phải APPROVE nhưng vẫn thêm vào đc learning path

### B-3: /api/learning-paths/{id}/courses (Đăng) POST -- DONE

- Khi thêm course vào learning path thì phải check xem position đó có course hay chưa

## Admin

## CP

### B-1: /api/enrollments/enroll/{id} (Thảo) POST

- Course đang ở status không phải approve mà vẫn enroll đc

### B-2: /api/courses/{id} DELETE (Thảo)

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


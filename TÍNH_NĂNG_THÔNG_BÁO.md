### TÍNH NĂNG THÔNG BÁO

**Mục tiêu**: Chỉ liệt kê các trường hợp cần thông báo, thời điểm thông báo, người nhận, nội dung và ví dụ nội dung.  

---

#### 1) Đề tài: tạo mới đề tài
- **Khi nào**: Sau khi tạo `Project` thành công.
- **Thông báo cho ai**:
  - Giảng viên hướng dẫn (`project.supervisorUser`)
  - Từng sinh viên trong danh sách thành viên được thêm vào đề tài
- **Nội dung**:
  - GVHD: `Bạn đã được yêu cầu làm giảng viên hướng dẫn cho đề tài "<title>" (<code>)`
  - Thành viên: `Bạn đã được thêm vào đề tài "<title>" (<code>) với vai trò <roleInTeam>`
- **Ví dụ**:
  > GVHD: Bạn đã được yêu cầu làm giảng viên hướng dẫn cho đề tài "Hệ thống quản lý khóa luận" (PRJ-001)  
  > SV: Bạn đã được thêm vào đề tài "Hệ thống quản lý khóa luận" (PRJ-001) với vai trò Trưởng nhóm

---

#### 2) Đề tài: cập nhật thay đổi giảng viên hướng dẫn
- **Khi nào**: Khi `supervisorId` thay đổi trong cập nhật `Project`.
- **Thông báo cho ai**:
  - Giảng viên cũ
  - Giảng viên mới
  - Tất cả thành viên đề tài
- **Nội dung**:
  - GV cũ: `Bạn không còn là giảng viên hướng dẫn cho đề tài "<title>" (<code>)`
  - GV mới: `Bạn đã được giao làm giảng viên hướng dẫn cho đề tài "<title>" (<code>)`
  - Thành viên: `Giảng viên hướng dẫn đề tài "<title>" (<code>) đã thay đổi`
- **Ví dụ**:
  > Bạn không còn là giảng viên hướng dẫn cho đề tài "Hệ thống quản lý khóa luận" (PRJ-001)

---

#### 3) Đề tài: thay đổi trạng thái
- **Khi nào**: Khi trường `status` thay đổi  
  (ví dụ: `pending → approved_by_lecturer → approved_by_faculty_dean → approved_by_rector → in_progress → completed → cancelled`)
- **Thông báo cho ai**: Giảng viên hướng dẫn, tất cả thành viên đề tài, người tạo đề tài (nếu khác GVHD).
- **Nội dung**:  
  `Đề tài "<title>" (<code>) đã thay đổi từ "<oldStatusLabel>" sang "<newStatusLabel>"`
- **Ví dụ**:  
  > Đề tài "Hệ thống quản lý khóa luận" (PRJ-001) đã thay đổi từ "Chờ duyệt" sang "Giảng viên đã duyệt"

---

#### 4) Đề tài: thay đổi cấp độ (level)
- **Khi nào**: Khi `level` thay đổi.
- **Thông báo cho ai**: Giảng viên hướng dẫn, tất cả thành viên đề tài, người tạo đề tài (nếu khác GVHD).
- **Nội dung**:  
  `Đề tài "<title>" (<code>) đã thay đổi từ "<oldLevelLabel>" sang "<newLevelLabel>"`
- **Ví dụ**:  
  > Đề tài "Hệ thống quản lý" (PRJ-001) đã thay đổi từ "Đại học" sang "Sau đại học"

---

#### 5) Đề tài: thay đổi thành viên
- **Khi nào**: Khi cập nhật `members` dẫn tới: thêm mới, loại bỏ, hoặc đổi `roleInTeam`.
- **Thông báo cho ai**:
  - Thành viên bị loại
  - Thành viên mới được thêm
  - Thành viên giữ nguyên nhưng thay đổi vai trò
- **Nội dung**:
  - Bị loại: `Bạn đã bị loại khỏi đề tài "<title>" (<code>)`
  - Được thêm: `Bạn đã được thêm vào đề tài "<title>" (<code>) với vai trò <roleInTeam>`
  - Đổi vai: `Vai trò của bạn trong đề tài "<title>" (<code>) đã thay đổi từ "<oldRole>" thành "<newRole>"`
- **Ví dụ**:  
  > Vai trò của bạn trong đề tài "Hệ thống quản lý" (PRJ-001) đã thay đổi từ "Thành viên" thành "Thư ký"

---

#### 6) Đề tài: xóa đề tài
- **Khi nào**: Trước khi xóa `Project` (soft/hard remove).
- **Thông báo cho ai**: Giảng viên hướng dẫn, tất cả thành viên đề tài.
- **Nội dung**:  
  `Đề tài "<title>" (<code>) đã bị xóa`
- **Ví dụ**:  
  > Đề tài "Hệ thống quản lý" (PRJ-001) mà bạn đang tham gia đã bị xóa

---

#### 7) Nộp tài liệu mốc (Milestone Submission): tạo mới
- **Khi nào**: Sau khi sinh viên nộp thành công bản nộp cho `ProjectMilestone`.
- **Thông báo cho ai**: Giảng viên hướng dẫn, các thành viên khác trong đề tài (trừ người nộp).
- **Nội dung**:  
  `Sinh viên <submitterName> đã nộp tài liệu cho mốc "<milestoneTitle>" của đề tài "<projectTitle>" (<code>). Phiên bản: v<version>`
- **Ví dụ**:  
  > Sinh viên Nguyễn Văn A đã nộp tài liệu cho mốc "Báo cáo đề cương" của đề tài "Hệ thống quản lý" (PRJ-001). Phiên bản: v3

---

#### 8) Đặt lịch bảo vệ (Booking): tạo mới
- **Khi nào**: Sau khi tạo `Booking` ở trạng thái `PENDING`.
- **Thông báo cho ai**: Giảng viên hướng dẫn, tất cả thành viên đề tài (trừ người tạo booking).
- **Nội dung**:  
  `Có yêu cầu đặt lịch bảo vệ mới cho đề tài "<title>" (<code>) vào lúc <time>`
- **Ví dụ**:  
  > Có yêu cầu đặt lịch bảo vệ mới cho đề tài "Hệ thống quản lý" (PRJ-001) vào lúc 14:30 20/09/2025

---

#### 9) Đặt lịch bảo vệ (Booking): cập nhật
- **Khi nào**: Khi thông tin `Booking` (ví dụ thời gian) được cập nhật.
- **Thông báo cho ai**: Giảng viên hướng dẫn, tất cả thành viên đề tài (trừ người cập nhật).
- **Nội dung**:  
  `Lịch bảo vệ đề tài "<title>" (<code>) đã được cập nhật vào lúc <time>`
- **Ví dụ**:  
  > Lịch bảo vệ đề tài "Hệ thống quản lý" (PRJ-001) đã được cập nhật vào lúc 16:00 21/09/2025

---

#### 10) Đặt lịch bảo vệ (Booking): hủy/xóa
- **Khi nào**: Trước khi xóa `Booking`.
- **Thông báo cho ai**: Giảng viên hướng dẫn, tất cả thành viên đề tài (trừ người xóa nếu là SV tạo).
- **Nội dung**:  
  `Lịch bảo vệ đề tài "<title>" (<code>) đã bị hủy`
- **Ví dụ**:  
  > Lịch bảo vệ đề tài "Hệ thống quản lý" (PRJ-001) đã bị hủy

---

#### 11) Đặt lịch bảo vệ (Booking): duyệt/từ chối theo cấp
- **Khi nào**:
  - Giảng viên duyệt/từ chối: `APPROVED_BY_LECTURER` hoặc `REJECTED`
  - Trưởng khoa duyệt: `APPROVED_BY_FACULTY_DEAN`
  - Phòng đào tạo duyệt: `APPROVED_BY_RECTOR`
- **Thông báo cho ai**: Người tạo booking (SV) và các thành viên khác trong đề tài.
- **Nội dung**:  
  `Lịch bảo vệ đề tài "<title>" (<code>) <statusLabel> bởi <approverName>`  
  Trong đó:
  - statusLabel: `"đã được giảng viên duyệt" | "đã được trưởng khoa duyệt" | "đã được phòng đào tạo duyệt" | "đã bị từ chối"`
- **Ví dụ**:  
  > Lịch bảo vệ đề tài "Hệ thống quản lý" (PRJ-001) đã được trưởng khoa duyệt bởi TS. B

---

#### 12) Chấm điểm hội đồng: cập nhật điểm trung bình đề tài
- **Khi nào**: Khi giảng viên trong hội đồng chấm điểm đề tài, hệ thống tính lại `averageScore`.
- **Thông báo cho ai**: Tất cả thành viên đề tài.
- **Nội dung**:
  - Nếu chưa có điểm: `Đề tài của bạn hiện chưa có điểm trung bình`
  - Nếu có: `Điểm trung bình mới của đề tài là <avg>`
- **Ví dụ**:  
  > Điểm trung bình mới của đề tài là 8.25

---

#### 13) Nhắc deadline mốc (theo lịch Cron hàng ngày lúc 06:00)
- **Khi nào**: Với các `ProjectMilestone` trạng thái `ACTIVE`, có `dueDate` trong 1-7 ngày tới, thuộc đề tài ở trạng thái:  
  `APPROVED_BY_LECTURER`, `APPROVED_BY_FACULTY_DEAN`, `APPROVED_BY_RECTOR`, `IN_PROGRESS`  
  và chưa có bản nộp (`MilestoneSubmission`).
- **Thông báo cho ai**: Giảng viên hướng dẫn và tất cả thành viên đề tài.
- **Nội dung**:
  - GVHD: `Milestone "<milestoneTitle>" của đề tài "<projectTitle>" (<code>) sẽ đến hạn <daysText> (<dueDate>). Vui lòng nhắc nhở sinh viên hoàn thành.`
  - Thành viên: `Milestone "<milestoneTitle>" của đề tài "<projectTitle>" (<code>) sẽ đến hạn <daysText> (<dueDate>). Vui lòng hoàn thành và nộp bài trước deadline.`
  - Trong đó `<daysText>`: `"hôm nay" | "ngày mai" | "còn <n> ngày nữa"`
- **Ví dụ**:  
  > GVHD: Milestone "Báo cáo giữa kỳ" của đề tài "Hệ thống quản lý" (PRJ-001) sẽ đến hạn ngày mai (21/09/2025). Vui lòng nhắc nhở sinh viên hoàn thành.  
  > SV: Milestone "Báo cáo giữa kỳ" của đề tài "Hệ thống quản lý" (PRJ-001) sẽ đến hạn còn 3 ngày nữa (23/09/2025). Vui lòng hoàn thành và nộp bài trước deadline.

---

### Ghi chú
- Các chuỗi `<title>`, `<code>`, `<time>`, `<oldStatusLabel>`, `<newStatusLabel>`, `<oldRole>`, `<newRole>`, `<submitterName>`, `<version>`, `<avg>`, `<approverName>`, `<milestoneTitle>`, `<projectTitle>`, `<dueDate>`, `<daysText>` là **biến** được thay bằng dữ liệu thực tế khi gửi thông báo.
- Người nhận được suy ra từ quan hệ:  
  `project.supervisorUser`, `project.members.studentId`, người tạo `booking`, người nộp submission.
- Thời gian hiển thị dùng định dạng `vi-VN` theo mã nguồn hiện có nơi cần thiết.

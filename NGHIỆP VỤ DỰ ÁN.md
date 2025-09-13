### NGHIỆP VỤ DỰ ÁN WEB-SCHOOL

**Mục tiêu**: Mô tả toàn diện các nghiệp vụ chính của hệ thống quản lý đề tài học tập và nghiên cứu khoa học, bao gồm các vai trò, quy trình và điều kiện thực hiện.

---

## 1. CÁC VAI TRÒ TRONG HỆ THỐNG

### 1.1 Admin (Quản trị viên)
- **Quyền hạn**: Truy cập toàn bộ hệ thống, quản lý tất cả dữ liệu
- **Nghiệp vụ chính**:
  - Quản lý người dùng (sinh viên, giảng viên, admin)
  - Quản lý kế hoạch NCKH và thiết lập milestone
  - Quản lý đề tài và theo dõi tiến độ
  - Thiết lập hội đồng chấm điểm
  - Quản lý đăng ký bảo vệ đề tài
  - Xem báo cáo và thống kê tổng quan

### 1.2 Student (Sinh viên)
- **Quyền hạn**: Quản lý đề tài của mình, nộp bài theo milestone
- **Nghiệp vụ chính**:
  - Đăng ký đề tài trong kế hoạch NCKH đang mở
  - Quản lý thành viên đề tài và vai trò trong nhóm
  - Nộp tài liệu theo các milestone của đề tài
  - Đăng ký lịch bảo vệ đề tài
  - Xem tiến độ và điểm số đề tài

### 1.3 Lecturer (Giảng viên)
- **Quyền hạn**: Hướng dẫn đề tài, chấm điểm, duyệt lịch bảo vệ
- **Nghiệp vụ chính**:
  - Nhận yêu cầu làm giảng viên hướng dẫn
  - Duyệt đề tài và chuyển trạng thái
  - Duyệt lịch bảo vệ đề tài (cấp đầu tiên)
  - Chấm điểm đề tài trong hội đồng
  - Theo dõi tiến độ sinh viên

### 1.4 DepartmentHead (Chủ nhiệm bộ môn)
- **Quyền hạn**: Quản lý đề tài trong bộ môn, duyệt lịch bảo vệ
- **Nghiệp vụ chính**:
  - Giám sát đề tài trong bộ môn
  - Chấm điểm đề tài trong hội đồng
  - Báo cáo tiến độ bộ môn

### 1.5 FacultyDean (Trưởng khoa)
- **Quyền hạn**: Quản lý đề tài trong khoa, thiết lập hội đồng
- **Nghiệp vụ chính**:
  - Quản lý kế hoạch NCKH của khoa
  - Thiết lập hội đồng chấm điểm
  - Duyệt lịch bảo vệ đề tài (cấp thứ ba)
  - Chấm điểm đề tài trong hội đồng
  - Báo cáo tổng quan khoa

### 1.6 Rector (Phòng nghiên cứu khoa học)
- **Quyền hạn**: Quản lý toàn bộ kế hoạch NCKH, duyệt cuối cùng
- **Nghiệp vụ chính**:
  - Tạo và quản lý kế hoạch NCKH
  - Thiết lập milestone cho kế hoạch NCKH
  - Duyệt lịch bảo vệ đề tài (cấp cuối cùng)
  - Chấm điểm đề tài trong hội đồng
  - Báo cáo tổng thể toàn trường

### 1.7 Council (Hội đồng)
- **Quyền hạn**: Chấm điểm và đánh giá đề tài được gán
- **Nghiệp vụ chính**:
  - Xem danh sách đề tài được gán cho hội đồng
  - Chấm điểm đề tài theo thang điểm 0-10
  - Nhận xét và đánh giá đề tài
  - Tham gia quy trình chấm điểm chuẩn hóa

---

## 2. LUỒNG ĐĂNG KÝ KẾ HOẠCH NCKH

### 2.1 Tạo kế hoạch NCKH
- **Người thực hiện**: Admin, Rector
- **Điều kiện**: 
  - Người dùng có quyền Admin hoặc Rector
  - Kế hoạch NCKH chưa tồn tại cho năm học đó
- **Quy trình**:
  1. Nhập thông tin cơ bản: tên, năm học, ngày bắt đầu, ngày kết thúc
  2. Thiết lập trạng thái: OPEN (mở), CLOSED (đóng)
  3. Lưu kế hoạch NCKH

### 2.2 Thiết lập Milestone cho kế hoạch NCKH
- **Người thực hiện**: Admin, Rector
- **Điều kiện**: 
  - Kế hoạch NCKH đã được tạo
  - Người dùng có quyền Admin hoặc Rector
- **Quy trình**:
  1. Chọn kế hoạch NCKH cần thiết lập milestone
  2. Thêm các milestone với thông tin:
     - Tên milestone (ví dụ: "Chọn đề tài", "Báo cáo đề cương")
     - Ngày hạn chót (dueDate)
     - Mô tả chi tiết
     - Thứ tự (orderIndex)
     - Trạng thái: ACTIVE (hoạt động), INACTIVE (không hoạt động)
     - Bắt buộc (isRequired): true/false
  3. Lưu danh sách milestone

### 2.3 Quản lý trạng thái kế hoạch NCKH
- **Trạng thái**: 
  - OPEN: Cho phép đăng ký đề tài
  - CLOSED: Không cho phép đăng ký đề tài mới
- **Điều kiện chuyển đổi**:
  - OPEN → CLOSED: Khi hết thời gian đăng ký hoặc admin đóng
  - CLOSED → OPEN: Chỉ admin có thể mở lại

---

## 3. LUỒNG ĐĂNG KÝ ĐỀ TÀI

### 3.1 Điều kiện đăng ký đề tài
- **Kế hoạch NCKH**: Phải ở trạng thái OPEN
- **Thời gian**: Phải trong khoảng thời gian của kế hoạch NCKH
- **Người đăng ký**: Sinh viên hoặc người có quyền tạo đề tài
- **Thông tin bắt buộc**:
  - Tiêu đề đề tài
  - Tóm tắt (abstract)
  - Mục tiêu (objectives)
  - Phạm vi (scope)
  - Phương pháp (method)
  - Kết quả mong đợi (expectedOutputs)
  - Ngày bắt đầu và kết thúc
  - Cấp độ: undergraduate (đại học), graduate (sau đại học), research (nghiên cứu)
  - Giảng viên hướng dẫn
  - Thành viên nhóm (nếu có)

### 3.2 Quy trình đăng ký đề tài
1. **Tạo đề tài**: 
   - Nhập thông tin đề tài
   - Chọn giảng viên hướng dẫn
   - Thêm thành viên nhóm với vai trò (Trưởng nhóm, Thành viên, Thư ký)
   - Chọn kế hoạch NCKH

2. **Clone Milestone**: 
   - Hệ thống tự động copy tất cả milestone từ kế hoạch NCKH
   - Tạo ProjectMilestone với cùng thông tin như TermMilestone
   - Trạng thái ban đầu: INACTIVE cho milestone đầu tiên, ACTIVE cho các milestone khác

3. **Thông báo**: 
   - Gửi thông báo cho giảng viên hướng dẫn
   - Gửi thông báo cho tất cả thành viên nhóm

### 3.3 Trạng thái đề tài và quy trình duyệt
- **draft**: Nháp (có thể chỉnh sửa)
- **pending**: Chờ duyệt
- **approved_by_lecturer**: Giảng viên đã duyệt
- **approved_by_faculty_dean**: Trưởng khoa đã duyệt  
- **approved_by_rector**: Phòng nghiên cứu khoa học đã duyệt
- **in_progress**: Đang thực hiện
- **completed**: Hoàn thành
- **cancelled**: Đã hủy

**Quy trình duyệt**:
1. Sinh viên gửi đề tài → pending
2. Giảng viên hướng dẫn duyệt → approved_by_lecturer
3. Trưởng khoa duyệt → approved_by_faculty_dean
4. Phòng nghiên cứu khoa học duyệt → approved_by_rector
5. Đề tài chuyển sang in_progress để sinh viên thực hiện

---

## 4. QUẢN LÝ MILESTONE VÀ NỘP BÀI

### 4.1 Điều kiện nộp bài milestone
- **Trạng thái đề tài**: 
  - APPROVED_BY_LECTURER
  - APPROVED_BY_FACULTY_DEAN  
  - APPROVED_BY_RECTOR
  - IN_PROGRESS
- **Trạng thái milestone**: ACTIVE
- **Thời gian**: Phải nộp trước hoặc đúng ngày hạn chót (dueDate)
- **Thành viên**: Chỉ sinh viên trong nhóm đề tài mới được nộp

### 4.2 Quy trình nộp bài
1. **Chọn milestone**: Sinh viên chọn milestone cần nộp bài
2. **Upload tài liệu**: Tải lên file tài liệu
3. **Versioning**: Hệ thống tự động tạo version mới (v1, v2, v3...)
4. **Thông báo**: 
   - Gửi thông báo cho giảng viên hướng dẫn
   - Gửi thông báo cho các thành viên khác trong nhóm

### 4.3 Nhắc nhở deadline
- **Thời gian**: Hàng ngày lúc 06:00 (Cron job)
- **Điều kiện**: 
  - Milestone có trạng thái ACTIVE
  - DueDate trong vòng 1-7 ngày tới
  - Đề tài ở trạng thái được phép nộp bài
  - Chưa có bản nộp nào
- **Người nhận**: Giảng viên hướng dẫn và tất cả thành viên đề tài

---

## 5. ĐĂNG KÝ LỊCH BẢO VỆ ĐỀ TÀI

### 5.1 Điều kiện đăng ký lịch bảo vệ
- **Trạng thái đề tài**: 
  - APPROVED_BY_LECTURER
  - APPROVED_BY_FACULTY_DEAN
  - APPROVED_BY_RECTOR
  - IN_PROGRESS
  - COMPLETED
- **Thành viên**: Sinh viên phải là thành viên của đề tài
- **Thời gian**: Phải nằm trong khoảng thời gian của kế hoạch NCKH
- **Trùng lặp**: Không được trùng thời gian với booking khác của cùng đề tài

### 5.2 Quy trình đăng ký lịch bảo vệ
1. **Tạo booking**: 
   - Chọn đề tài
   - Chọn sinh viên đại diện
   - Chọn thời gian bảo vệ
   - Trạng thái ban đầu: PENDING

2. **Thông báo**: 
   - Gửi thông báo cho giảng viên hướng dẫn
   - Gửi thông báo cho tất cả thành viên đề tài (trừ người tạo)

### 5.3 Quy trình duyệt lịch bảo vệ (3 cấp)

#### Cấp 1: Giảng viên hướng dẫn
- **Điều kiện**: 
  - Booking ở trạng thái PENDING
  - Người duyệt phải là giảng viên hướng dẫn của đề tài
- **Kết quả**: APPROVED_BY_LECTURER hoặc REJECTED

#### Cấp 2: Trưởng khoa
- **Điều kiện**: 
  - Booking đã được giảng viên duyệt (APPROVED_BY_LECTURER)
  - Người duyệt phải là trưởng khoa của khoa chứa đề tài
- **Kết quả**: APPROVED_BY_FACULTY_DEAN hoặc REJECTED

#### Cấp 3: Phòng nghiên cứu khoa học
- **Điều kiện**: 
  - Booking đã được trưởng khoa duyệt (APPROVED_BY_FACULTY_DEAN)
  - Người duyệt phải có quyền Rector
- **Kết quả**: APPROVED_BY_RECTOR hoặc REJECTED

### 5.4 Thông báo duyệt lịch bảo vệ
- **Người nhận**: Sinh viên tạo booking và các thành viên khác trong đề tài
- **Nội dung**: Thông báo trạng thái duyệt và người duyệt

---

## 6. HỆ THỐNG HỘI ĐỒNG VÀ CHẤM ĐIỂM

### 6.1 Thiết lập hội đồng
- **Người thực hiện**: Admin, Rector, FacultyDean
- **Thông tin hội đồng**:
  - Tên hội đồng
  - Khoa (faculty)
  - Mô tả
  - Trạng thái: ACTIVE, INACTIVE

### 6.2 Thành viên hội đồng
- **Thêm thành viên**: 
  - Chọn giảng viên từ khoa tương ứng
  - Phân quyền: có thể chấm điểm hoặc chỉ tham gia
- **Vai trò**: 
  - Chủ tịch hội đồng
  - Thành viên hội đồng
  - Thư ký hội đồng

### 6.3 Gán đề tài cho hội đồng
- **Điều kiện**: 
  - Đề tài phải ở trạng thái được phép chấm điểm
  - Hội đồng phải ở trạng thái ACTIVE
- **Quy trình**: 
  1. Chọn hội đồng
  2. Chọn đề tài từ danh sách đề tài trong khoa
  3. Gán đề tài cho hội đồng

### 6.4 Chấm điểm đề tài
- **Điều kiện**: 
  - Giảng viên phải là thành viên của hội đồng
  - Đề tài đã được gán cho hội đồng
  - Đề tài ở trạng thái được phép chấm điểm
- **Quy trình**:
  1. Giảng viên chọn đề tài trong hội đồng
  2. Nhập điểm (thang 0-10)
  3. Nhập nhận xét (tùy chọn)
  4. Lưu điểm

### 6.5 Tính điểm trung bình
- **Tự động**: Hệ thống tự động tính điểm trung bình khi có điểm từ các giảng viên
- **Thông báo**: Gửi thông báo điểm trung bình cho tất cả thành viên đề tài

---

## 7. CÁC ĐIỀU KIỆN ĐẶC BIỆT

### 7.1 Điều kiện chỉnh sửa đề tài
- **Trạng thái**: Chỉ được chỉnh sửa khi ở trạng thái draft hoặc pending
- **Quyền**: Người tạo đề tài hoặc admin
- **Thông báo**: Thông báo thay đổi cho tất cả thành viên liên quan

### 7.2 Điều kiện xóa đề tài
- **Quyền**: Chỉ admin mới có thể xóa đề tài
- **Thông báo**: Thông báo xóa đề tài cho giảng viên hướng dẫn và tất cả thành viên

### 7.3 Điều kiện thay đổi giảng viên hướng dẫn
- **Quyền**: Admin hoặc người có quyền quản lý đề tài
- **Thông báo**: 
  - Giảng viên cũ: thông báo không còn là GVHD
  - Giảng viên mới: thông báo được giao làm GVHD
  - Thành viên đề tài: thông báo thay đổi GVHD

### 7.4 Điều kiện thay đổi thành viên nhóm
- **Quyền**: Người tạo đề tài hoặc admin
- **Thông báo**:
  - Thành viên bị loại: thông báo bị loại khỏi đề tài
  - Thành viên mới: thông báo được thêm vào với vai trò
  - Thay đổi vai trò: thông báo thay đổi vai trò

---

## 8. BÁO CÁO VÀ THỐNG KÊ

### 8.1 Dashboard tổng quan
- Thống kê các dữ liêu liên quan đến người dùng và dự án


### 8.2 Báo cáo chi tiết
- **Tiến độ đề tài**: Theo milestone và deadline
- **Điểm số**: Thống kê điểm trung bình theo khoa/bộ môn
- **Lịch bảo vệ**: Danh sách và trạng thái booking
- **Hội đồng**: Thống kê hoạt động chấm điểm

---

## 9. TÍNH NĂNG BẢO MẬT VÀ PHÂN QUYỀN

### 9.1 Authentication
- **JWT Token**: Xác thực người dùng
- **Session Management**: Quản lý phiên đăng nhập
- **Password Security**: Mã hóa mật khẩu

### 9.2 Authorization
- **Role-based Access Control**: Phân quyền theo vai trò
- **Resource-level Permission**: Quyền truy cập theo tài nguyên
- **API Protection**: Bảo vệ API endpoints

### 9.3 Data Validation
- **Input Validation**: Kiểm tra dữ liệu đầu vào
- **Business Logic Validation**: Kiểm tra logic nghiệp vụ
- **Constraint Enforcement**: Ràng buộc dữ liệu

---

## 10. TÍNH NĂNG THÔNG BÁO

### 10.1 Loại thông báo
- **Real-time**: Thông báo ngay lập tức
- **Scheduled**: Thông báo theo lịch (Cron job)

### 10.2 Nội dung thông báo
- **Thay đổi trạng thái**: Đề tài
- **Deadline**: Nhắc nhở hạn chót
- **Điểm số**: Thông báo điểm mới
- **Thành viên**: Thay đổi thành viên nhóm

### 10.3 Quản lý thông báo
- **Đánh dấu đã đọc**: Người dùng có thể đánh dấu đã đọc
- **Lịch sử**: Lưu trữ lịch sử thông báo

---

**Ghi chú**: Tài liệu này mô tả các nghiệp vụ chính của hệ thống Web-School. Các quy trình có thể được điều chỉnh tùy theo yêu cầu cụ thể của từng trường đại học.

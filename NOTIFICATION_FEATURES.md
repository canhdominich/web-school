# Tính năng Thông báo cho Project Management

## Tổng quan

Hệ thống đã được tích hợp tính năng thông báo tự động cho các hoạt động liên quan đến đề tài. Khi có thay đổi về đề tài, các thành viên liên quan sẽ nhận được thông báo ngay lập tức.

## Các loại thông báo

### 1. Khi tạo đề tài mới

- **Giảng viên hướng dẫn**: Nhận thông báo "Đề tài mới được giao"
- **Thành viên đề tài**: Nhận thông báo "Bạn đã được thêm vào đề tài mới" với thông tin vai trò

### 2. Khi cập nhật đề tài

- **Thay đổi giảng viên hướng dẫn**:

  - Giảng viên cũ: "Bạn không còn là giảng viên hướng dẫn"
  - Giảng viên mới: "Bạn đã được giao làm giảng viên hướng dẫn"
  - Tất cả thành viên: "Giảng viên hướng dẫn đề tài đã thay đổi"

- **Thay đổi thành viên đề tài**:
  - Thành viên bị loại: "Bạn đã bị loại khỏi đề tài"
  - Thành viên mới: "Bạn đã được thêm vào đề tài"
  - Thay đổi vai trò: "Vai trò của bạn trong đề tài đã thay đổi"

### 3. Khi xóa đề tài

- **Giảng viên hướng dẫn**: "Đề tài đã bị xóa"
- **Tất cả thành viên**: "Đề tài đã bị xóa"

## Cấu trúc thông báo

Mỗi thông báo bao gồm:

- **title**: Tiêu đề ngắn gọn
- **body**: Nội dung chi tiết
- **userId**: ID của người nhận thông báo
- **link**: Link đến trang đề tài (nếu có)

## Cách hoạt động

### Tự động và thông minh

- Thông báo được tạo tự động khi có thay đổi
- **Chỉ thông báo khi thực sự có thay đổi**: Không thông báo trùng lặp
- Hệ thống so sánh trạng thái cũ và mới để xác định thay đổi thực sự
- **Kiểm tra kép**: Sử dụng method `hasMemberChanges()` để đảm bảo chính xác
- Không cần can thiệp thủ công
- Xử lý song song để tối ưu hiệu suất

### Logic thông minh cho cập nhật đề tài

- **Members**: Chỉ thông báo khi thêm/xóa/thay đổi vai trò thực sự
- **Supervisor**: Chỉ thông báo khi thay đổi giảng viên hướng dẫn thực sự
- **Không thông báo trùng lặp**: Nếu cập nhật nhưng không có thay đổi gì
- **Tối ưu database**: Chỉ update những record thực sự thay đổi
- **Debug logging**: Hệ thống log chi tiết để dễ dàng debug

#### Ví dụ cụ thể:

```
Trước khi update: Members = [User1(Leader), User2(Member)]
Sau khi update: Members = [User1(Leader), User2(Member)]

→ Không có thay đổi → Không thông báo gì

Trước khi update: Members = [User1(Leader), User2(Member)]
Sau khi update: Members = [User1(Leader), User2(Leader), User3(Member)]

→ Thay đổi: User2(Leader), User3(Member) → Chỉ thông báo cho User2 và User3
```

### Sửa lỗi thông báo sai

**Vấn đề đã được giải quyết:**

- Trước đây: Hệ thống có thể tạo thông báo "Bạn đã bị loại khỏi đề tài" và "Bạn đã được thêm vào đề tài" cho cùng một người dùng
- Bây giờ: Sử dụng logic so sánh chính xác để tránh thông báo sai

**Cách hoạt động:**

1. **Kiểm tra sơ bộ**: `hasMemberChanges()` so sánh nhanh trước khi xử lý
2. **So sánh chi tiết**: Phân tích từng thay đổi cụ thể
3. **Kiểm tra kép**: Xác nhận có thay đổi thực sự trước khi tạo thông báo
4. **Debug logging**: Ghi log chi tiết để dễ dàng theo dõi

### Xử lý lỗi

- Nếu tạo thông báo thất bại, đề tài vẫn được tạo/cập nhật/xóa
- Lỗi được log để debug
- Không ảnh hưởng đến luồng chính

## API Endpoints

### Tạo đề tài

```http
POST /projects
```

- Tự động tạo thông báo cho supervisor và members

### Cập nhật đề tài

```http
PATCH /projects/:id
```

- Tự động tạo thông báo cho các thay đổi

### Xóa đề tài

```http
DELETE /projects/:id
```

- Tự động tạo thông báo cho supervisor và members

## Cấu hình

### NotificationService

- Được inject vào ProjectService
- Xử lý tạo thông báo
- Hỗ trợ phân trang và lọc

### Database

- Sử dụng transaction để đảm bảo tính nhất quán
- Thông báo được lưu vào bảng `notifications`
- Liên kết với bảng `users` qua `userId`

## Lợi ích

1. **Thông tin kịp thời**: Người dùng nhận được thông báo ngay lập tức
2. **Tự động hóa**: Không cần can thiệp thủ công
3. **Tính nhất quán**: Tất cả thay đổi đều được thông báo
4. **Dễ theo dõi**: Có link trực tiếp đến đề tài
5. **Hiệu suất cao**: Xử lý song song và không block luồng chính

## Tương lai

Có thể mở rộng thêm:

- Thông báo qua email
- Push notification
- Thông báo cho milestones
- Thông báo cho deadlines
- Tùy chỉnh loại thông báo theo role

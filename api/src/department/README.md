# Department Module - Thêm schoolId

## Tổng quan
Đã cập nhật Department module để thêm trực tiếp cột `schoolId`, cho phép department biết được thuộc về school nào. Khi thêm/cập nhật department, hệ thống sẽ kiểm tra xem faculty có thuộc về school đó hay không.

## Cấu trúc mối quan hệ

```
School (Trường)
  ↓ (1:N)
Faculty (Khoa)
  ↓ (1:N)  
Department (Bộ môn) - có cả facultyId và schoolId
```

## Các thay đổi chính

### 1. Entity (department.entity.ts)
- Thêm `schoolId` column với kiểu `bigint`
- Thêm mối quan hệ `ManyToOne` với School entity
- Sử dụng `@JoinColumn` để map với `schoolId`
- Thêm `onDelete: 'CASCADE'` để xóa department khi school bị xóa

### 2. DTOs
- **CreateDepartmentDto**: Thêm `schoolId` field bắt buộc
- **SearchDepartmentDto**: Thêm `schoolId` field để tìm kiếm và lọc

### 3. Service (department.service.ts)
- Thêm validation để kiểm tra school tồn tại
- Thêm validation để kiểm tra faculty có thuộc về school đó hay không
- Cập nhật tất cả methods để include school trong relations
- Thêm `schoolId` vào search và sort options

### 4. Module (department.module.ts)
- Thêm School entity vào TypeORM imports

### 5. Migration
- Tạo migration để thêm `schoolId` column vào bảng `departments`
- Thêm foreign key constraint với bảng `schools`

## API Endpoints

### Tạo Department mới
```http
POST /departments
Content-Type: application/json

{
  "code": "HUST-IT-CS-1",
  "name": "Bộ môn Khoa học máy tính",
  "description": "Bộ môn CS",
  "facultyId": 1,
  "schoolId": 1
}
```

### Lấy danh sách Department
```http
GET /departments?schoolId=1&facultyId=1
```

Response sẽ bao gồm thông tin school:
```json
{
  "id": 1,
  "code": "HUST-IT-CS-1",
  "name": "Bộ môn Khoa học máy tính",
  "description": "Bộ môn CS",
  "facultyId": 1,
  "schoolId": 1,
  "faculty": {
    "id": 1,
    "code": "HUST-IT-1",
    "name": "Khoa Công nghệ thông tin và truyền thông"
  },
  "school": {
    "id": 1,
    "code": "HUST",
    "name": "Đại học Bách khoa Hà Nội",
    "description": "Trường đại học công lập",
    "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Validation Rules

### Khi tạo Department:
1. ✅ Kiểm tra `schoolId` phải tồn tại trong bảng `schools`
2. ✅ Kiểm tra `facultyId` phải tồn tại trong bảng `faculties`
3. ✅ Kiểm tra faculty có thuộc về school đó hay không (`faculty.schoolId === schoolId`)
4. ✅ Kiểm tra `code` của department phải unique

### Khi cập nhật Department:
1. ✅ Nếu cập nhật cả `facultyId` và `schoolId`: kiểm tra faculty có thuộc về school mới không
2. ✅ Nếu chỉ cập nhật `facultyId`: kiểm tra faculty có thuộc về school hiện tại không
3. ✅ Kiểm tra `code` của department phải unique (nếu thay đổi)

## Database Schema
```sql
-- Department table
CREATE TABLE departments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  facultyId BIGINT NOT NULL,
  schoolId BIGINT NOT NULL,
  code VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (facultyId) REFERENCES faculties(id) ON DELETE CASCADE,
  FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE
);
```

## Lợi ích
- ✅ Department có thể biết được thuộc về School nào trực tiếp
- ✅ Validation đảm bảo tính nhất quán: faculty phải thuộc về school được chỉ định
- ✅ Dễ dàng query và filter theo School hoặc Faculty
- ✅ Cascade delete: khi School/Faculty bị xóa, Department cũng bị xóa
- ✅ API trả về thông tin đầy đủ về School và Faculty

## Error Messages
- `Không tìm thấy trường có ID {schoolId}` - School không tồn tại
- `Không tìm thấy khoa có ID {facultyId}` - Faculty không tồn tại  
- `Khoa có ID {facultyId} không thuộc về trường có ID {schoolId}` - Faculty không thuộc về School
- `Mã bộ môn đã tồn tại` - Code đã tồn tại

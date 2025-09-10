import { ApiProperty } from '@nestjs/swagger';
import { Booking, BookingStatus } from '../booking.entity';

export class BookingResponseDto {
  @ApiProperty({ example: 1, description: 'ID của booking' })
  id: number;

  @ApiProperty({
    example: '2024-01-15T09:00:00.000Z',
    description: 'Thời gian đặt lịch',
  })
  time: Date;

  @ApiProperty({ example: 1, description: 'ID của dự án' })
  projectId: number;

  @ApiProperty({ example: 1, description: 'ID của sinh viên' })
  studentId: number;

  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    description: 'Trạng thái booking',
  })
  status: BookingStatus;

  @ApiProperty({ example: 1, description: 'ID giảng viên đã duyệt', nullable: true })
  approvedByLecturerId: number | null;

  @ApiProperty({ example: 1, description: 'ID trưởng khoa đã duyệt', nullable: true })
  approvedByFacultyDeanId: number | null;

  @ApiProperty({ example: 1, description: 'ID phòng nghiên cứu khoa học đã duyệt', nullable: true })
  approvedByRectorId: number | null;

  @ApiProperty({
    example: '2024-01-15T09:00:00.000Z',
    description: 'Thời gian tạo',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T09:00:00.000Z',
    description: 'Thời gian cập nhật',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2024-01-15T09:00:00.000Z',
    description: 'Thời gian xóa',
    nullable: true,
  })
  deletedAt: Date | null;

  // Relations
  @ApiProperty({ description: 'Thông tin dự án' })
  project?: any;

  @ApiProperty({ description: 'Thông tin sinh viên' })
  student?: any;

  @ApiProperty({ description: 'Thông tin giảng viên đã duyệt', nullable: true })
  approvedByLecturer?: any;

  @ApiProperty({ description: 'Thông tin trưởng khoa đã duyệt', nullable: true })
  approvedByFacultyDean?: any;

  @ApiProperty({ description: 'Thông tin phòng nghiên cứu khoa học đã duyệt', nullable: true })
  approvedByRector?: any;
}

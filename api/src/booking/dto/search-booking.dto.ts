import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class SearchBookingDto {
  @ApiProperty({ example: 1, description: 'ID của dự án', required: false })
  @IsNumber()
  @IsOptional()
  projectId?: number;

  @ApiProperty({ example: 1, description: 'ID của sinh viên', required: false })
  @IsNumber()
  @IsOptional()
  studentId?: number;

  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    description: 'Trạng thái booking',
    required: false,
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Ngày bắt đầu tìm kiếm',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Ngày kết thúc tìm kiếm',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 1, description: 'Số trang', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10, description: 'Số lượng mỗi trang', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @ApiProperty({
    example: 'createdAt',
    description: 'Trường sắp xếp',
    required: false,
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    example: 'DESC',
    description: 'Thứ tự sắp xếp',
    required: false,
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

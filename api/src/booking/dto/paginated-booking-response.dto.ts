import { ApiProperty } from '@nestjs/swagger';
import { BookingResponseDto } from './booking-response.dto';

export class PaginatedBookingResponseDto {
  @ApiProperty({ type: [BookingResponseDto], description: 'Danh sách booking' })
  data: BookingResponseDto[];

  @ApiProperty({ example: 100, description: 'Tổng số lượng' })
  total: number;

  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ example: 10, description: 'Số lượng mỗi trang' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Tổng số trang' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Có trang tiếp theo' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: 'Có trang trước' })
  hasPrev: boolean;
}

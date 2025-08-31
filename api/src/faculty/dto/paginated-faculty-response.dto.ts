import { ApiProperty } from '@nestjs/swagger';
import { Faculty } from '../faculty.entity';

export class PaginatedFacultyResponseDto {
  @ApiProperty({
    description: 'Danh sách khoa',
    type: [Faculty],
  })
  data: Faculty[];

  @ApiProperty({
    description: 'Tổng số khoa',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Số lượng item trên mỗi trang',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo không',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước không',
    example: false,
  })
  hasPrev: boolean;
}

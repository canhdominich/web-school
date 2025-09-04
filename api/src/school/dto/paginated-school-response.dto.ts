import { ApiProperty } from '@nestjs/swagger';
import { School } from '../school.entity';

export class PaginatedSchoolResponseDto {
  @ApiProperty({ type: [School] })
  data: School[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

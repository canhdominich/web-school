import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../department.entity';

export class PaginatedDepartmentResponseDto {
  @ApiProperty({ type: [Department] })
  data: Department[];

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

import { ApiProperty } from '@nestjs/swagger';
import { Major } from '../major.entity';

export class PaginatedMajorResponseDto {
  @ApiProperty({ type: [Major] })
  data: Major[];

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

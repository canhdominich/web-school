import { ApiProperty } from '@nestjs/swagger';
import { Council } from '../council.entity';

export class PaginatedCouncilResponseDto {
  @ApiProperty({ type: [Council] })
  data: Council[];

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

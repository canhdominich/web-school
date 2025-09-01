import { ApiProperty } from '@nestjs/swagger';
import { TermResponseDto } from './term-response.dto';

export class PaginatedTermResponseDto {
  @ApiProperty({ type: [TermResponseDto] })
  data: TermResponseDto[];

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

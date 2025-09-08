import { ApiProperty } from '@nestjs/swagger';

export class AcademicYearResponseDto {
  @ApiProperty({ example: 1, description: 'Academic year ID' })
  id: number;

  @ApiProperty({ example: 'AY-2024-2025', description: 'Academic year code' })
  code: string;

  @ApiProperty({ example: 'Năm học 2024 - 2025', description: 'Academic year name' })
  name: string;

  @ApiProperty({ example: 'Mô tả năm học', required: false })
  description?: string;

  @ApiProperty({ example: '2024-09-01', description: 'Start date' })
  startDate: Date;

  @ApiProperty({ example: '2025-08-31', description: 'End date' })
  endDate: Date;

  @ApiProperty({ example: '2024-09-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-09-01T00:00:00.000Z' })
  updatedAt: Date;
}

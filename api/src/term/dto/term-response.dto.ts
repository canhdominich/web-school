import { ApiProperty } from '@nestjs/swagger';
import { TermStatus } from '../term.entity';
import { TermMilestoneStatus } from '../../term-milestone/term-milestone.entity';
import { AcademicYearResponseDto } from '../../academic-years/dto';

export class TermMilestoneResponseDto {
  @ApiProperty({ example: 1, description: 'Term milestone ID' })
  id: number;

  @ApiProperty({ example: 'Nộp báo cáo', description: 'Milestone name' })
  title: string;

  @ApiProperty({ example: '2025-03-15', description: 'Due date' })
  dueDate: Date;

  @ApiProperty({ example: 'Mô tả milestone', required: false })
  description?: string | null;

  @ApiProperty({ example: 1, description: 'Order index' })
  orderIndex: number;

  @ApiProperty({
    enum: TermMilestoneStatus,
    example: TermMilestoneStatus.ACTIVE,
  })
  status: TermMilestoneStatus;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class TermResponseDto {
  @ApiProperty({ example: 1, description: 'Term ID' })
  id: number;

  @ApiProperty({ example: '2025A', description: 'Term code' })
  code: string;

  @ApiProperty({ example: 'Đợt bảo vệ HK1 năm 2025', description: 'Term name' })
  name: string;

  @ApiProperty({ example: '2025-01-15', description: 'Start date' })
  startDate: Date;

  @ApiProperty({ example: '2025-06-30', description: 'End date' })
  endDate: Date;

  @ApiProperty({ example: 'Mô tả thêm cho đợt', required: false })
  description?: string | null;

  @ApiProperty({ enum: TermStatus, example: TermStatus.OPEN })
  status: TermStatus;

  @ApiProperty({ example: 1 })
  academicYearId: number;

  @ApiProperty({ type: AcademicYearResponseDto, required: false })
  academicYear?: AcademicYearResponseDto;

  @ApiProperty({
    type: [TermMilestoneResponseDto],
    description: 'Term milestones',
  })
  termMilestones: TermMilestoneResponseDto[];

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

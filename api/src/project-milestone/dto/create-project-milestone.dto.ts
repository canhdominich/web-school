import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ProjectMilestoneStatus } from '../project-milestone.entity';

export class CreateProjectMilestoneDto {
  @ApiProperty({ example: 1, description: 'Project ID' })
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty({ example: 'Đề cương', description: 'Milestone name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: '2025-02-15',
    description: 'Default due date (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: 'Mô tả mốc', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, required: false, default: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @ApiProperty({
    enum: ProjectMilestoneStatus,
    example: ProjectMilestoneStatus.ACTIVE,
    required: false,
  })
  @IsEnum(ProjectMilestoneStatus)
  @IsOptional()
  status?: ProjectMilestoneStatus;
}

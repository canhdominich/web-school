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
import { TermMilestoneStatus } from '../term-milestone.entity';

export class CreateTermMilestoneDto {
  @ApiProperty({ example: 1, description: 'Term ID' })
  @IsNumber()
  @IsNotEmpty()
  termId: number;

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

  @ApiProperty({
    example: 1,
    description: 'Order index',
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @ApiProperty({
    enum: TermMilestoneStatus,
    example: TermMilestoneStatus.ACTIVE,
    required: false,
  })
  @IsEnum(TermMilestoneStatus)
  @IsOptional()
  status?: TermMilestoneStatus;
}

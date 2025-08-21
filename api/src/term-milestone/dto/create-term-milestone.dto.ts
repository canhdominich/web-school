import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
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

  @ApiProperty({ example: 'Đề cương', description: 'Tên mốc' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: '2025-02-15',
    description: 'Hạn chót (YYYY-MM-DD)',
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
    description: 'Thứ tự',
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
    description: 'Trạng thái',
  })
  @IsEnum(TermMilestoneStatus)
  @IsOptional()
  status?: TermMilestoneStatus;

  @ApiProperty({
    example: true,
    description: 'Bắt buộc',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

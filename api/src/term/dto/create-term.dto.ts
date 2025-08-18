import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TermStatus } from '../term.entity';

export class CreateTermDto {
  @ApiProperty({ example: '2025A', description: 'Term code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Đợt bảo vệ HK1 năm 2025', description: 'Term name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-06-30', description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'Mô tả thêm cho đợt', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TermStatus, example: TermStatus.OPEN, required: false })
  @IsEnum(TermStatus)
  @IsOptional()
  status?: TermStatus;
}

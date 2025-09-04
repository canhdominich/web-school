import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: 'AY-2024-2025' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Năm học 2024 - 2025' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Năm học 2024-2025 với nhiều cải tiến trong chương trình đào tạo' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: '2024-09-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-06-30' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchAcademicYearDto {
  @ApiPropertyOptional({ example: '2024' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'AY-2024' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'cải tiến' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2024-09-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    example: 'name',
    enum: ['id', 'name', 'code', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
  })
  @IsString()
  @IsIn(['id', 'name', 'code', 'startDate', 'endDate', 'createdAt', 'updatedAt'])
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

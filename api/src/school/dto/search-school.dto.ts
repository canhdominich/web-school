import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchSchoolDto {
  @ApiPropertyOptional({ example: 'Bách khoa' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'SCH' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'công lập' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  @IsString()
  @IsOptional()
  address?: string;

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
    enum: ['id', 'name', 'code', 'createdAt', 'updatedAt'],
  })
  @IsString()
  @IsIn(['id', 'name', 'code', 'createdAt', 'updatedAt'])
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

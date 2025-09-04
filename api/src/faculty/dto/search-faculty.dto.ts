import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFacultyDto {
  @ApiPropertyOptional({
    description: 'Tên khoa để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Mã khoa để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'ID trường để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsNumber()
  schoolId?: number;

  @ApiPropertyOptional({
    description: 'Mô tả để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trang hiện tại (bắt đầu từ 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng item trên mỗi trang',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo trường',
    example: 'id',
    enum: ['id', 'name', 'code', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

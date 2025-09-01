import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, ProjectLevel } from '../project.entity';

export class SearchProjectDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề dự án để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mã dự án để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'ID khoa để lọc',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'ID bộ môn để lọc',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'ID ngành để lọc',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  majorId?: number;

  @ApiPropertyOptional({
    description: 'ID học kỳ để lọc',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  termId?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái dự án',
    enum: ProjectStatus,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Cấp độ dự án',
    enum: ProjectLevel,
  })
  @IsOptional()
  @IsEnum(ProjectLevel)
  level?: ProjectLevel;

  @ApiPropertyOptional({
    description: 'ID người tạo dự án',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  createdBy?: number;

  @ApiPropertyOptional({
    description: 'ID người giám sát',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supervisorId?: number;

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
    enum: ['id', 'title', 'code', 'facultyId', 'departmentId', 'majorId', 'termId', 'status', 'level', 'createdAt', 'updatedAt'],
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

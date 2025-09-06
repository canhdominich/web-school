import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/constants/user.constant';

export class SearchUserDto {
  @ApiPropertyOptional({
    description: 'Tên người dùng để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Mã người dùng để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Email để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại để tìm kiếm',
    example: '',
  })
  @IsOptional()
  @IsString()
  phone?: string;

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
    description: 'Vai trò người dùng',
    enum: UserRole,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

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
    enum: [
      'id',
      'name',
      'code',
      'email',
      'phone',
      'facultyId',
      'departmentId',
      'majorId',
      'createdAt',
      'updatedAt',
    ],
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

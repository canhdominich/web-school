import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/constants/user.constant';

export class FacultyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'CNTT' })
  code: string;

  @ApiProperty({ example: 'Công nghệ thông tin' })
  name: string;

  @ApiPropertyOptional({ example: 'Khoa công nghệ thông tin' })
  description?: string;
}

export class DepartmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'HTTT' })
  code: string;

  @ApiProperty({ example: 'Hệ thống thông tin' })
  name: string;

  @ApiPropertyOptional({ example: 'Bộ môn hệ thống thông tin' })
  description?: string;

  @ApiProperty({ example: 1 })
  facultyId: number;

  @ApiPropertyOptional({ type: FacultyResponseDto })
  faculty?: FacultyResponseDto;
}

export class MajorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'HTTT' })
  code: string;

  @ApiProperty({ example: 'Hệ thống thông tin' })
  name: string;

  @ApiPropertyOptional({ example: 'Ngành hệ thống thông tin' })
  description?: string;

  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiPropertyOptional({ type: DepartmentResponseDto })
  department?: DepartmentResponseDto;
}

export class UserRoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Lecturer' })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '00000001' })
  code: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  avatar?: string;

  @ApiProperty({ example: '0123456789' })
  phone: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 1 })
  facultyId?: number;

  @ApiPropertyOptional({ type: FacultyResponseDto })
  faculty?: FacultyResponseDto;

  @ApiPropertyOptional({ example: 1 })
  departmentId?: number;

  @ApiPropertyOptional({ type: DepartmentResponseDto })
  department?: DepartmentResponseDto;

  @ApiPropertyOptional({ example: 1 })
  majorId?: number;

  @ApiPropertyOptional({ type: MajorResponseDto })
  major?: MajorResponseDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [UserRoleResponseDto] })
  userRoles: UserRoleResponseDto[];
}

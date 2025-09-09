import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartOfFacultyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'CNTT' })
  code: string;

  @ApiProperty({ example: 'Công nghệ thông tin' })
  name: string;

  @ApiPropertyOptional({ example: 'Khoa công nghệ thông tin' })
  description?: string;
}

export class PartOfDepartmentResponseDto {
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

  @ApiPropertyOptional({ type: PartOfFacultyResponseDto })
  faculty?: PartOfFacultyResponseDto;
}

export class PartOfMajorResponseDto {
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

  @ApiPropertyOptional({ type: PartOfDepartmentResponseDto })
  department?: PartOfDepartmentResponseDto;
}

export class UserRoleDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Lecturer' })
  name: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class UserRoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 2 })
  roleId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserRoleDetailResponseDto })
  role: UserRoleDetailResponseDto;
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

  @ApiPropertyOptional({ type: PartOfFacultyResponseDto })
  faculty?: PartOfFacultyResponseDto;

  @ApiPropertyOptional({ example: 1 })
  departmentId?: number;

  @ApiPropertyOptional({ type: PartOfDepartmentResponseDto })
  department?: PartOfDepartmentResponseDto;

  @ApiPropertyOptional({ example: 1 })
  majorId?: number;

  @ApiPropertyOptional({ type: PartOfMajorResponseDto })
  major?: PartOfMajorResponseDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [UserRoleResponseDto] })
  userRoles: UserRoleResponseDto[];
}

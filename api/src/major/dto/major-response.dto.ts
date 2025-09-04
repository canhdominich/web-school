import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SchoolResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'HUST' })
  code: string;

  @ApiProperty({ example: 'Đại học Bách khoa Hà Nội' })
  name: string;

  @ApiPropertyOptional({ example: 'Trường đại học công lập' })
  description: string;

  @ApiPropertyOptional({ example: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội' })
  address: string;
}

export class FacultyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'HUST-IT-1' })
  code: string;

  @ApiProperty({ example: 'Khoa Công nghệ thông tin và truyền thông' })
  name: string;

  @ApiPropertyOptional({ example: 'Khoa Công nghệ thông tin và truyền thông' })
  description: string;

  @ApiProperty({ example: 1 })
  schoolId: number;
}

export class DepartmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'HUST-IT-CS-1' })
  code: string;

  @ApiProperty({ example: 'Bộ môn Khoa học máy tính' })
  name: string;

  @ApiPropertyOptional({ example: 'Bộ môn Khoa học máy tính' })
  description: string;

  @ApiProperty({ example: 1 })
  facultyId: number;

  @ApiProperty({ example: 1 })
  schoolId: number;
}

export class MajorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'M001' })
  code: string;

  @ApiProperty({ example: 'Computer Science' })
  name: string;

  @ApiPropertyOptional({ example: 'Computer science is the study of computers...' })
  description: string;

  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiProperty({ example: 1 })
  facultyId: number;

  @ApiProperty({ example: 1 })
  schoolId: number;

  @ApiPropertyOptional({ type: DepartmentResponseDto })
  department: DepartmentResponseDto | null;

  @ApiPropertyOptional({ type: FacultyResponseDto })
  faculty: FacultyResponseDto | null;

  @ApiPropertyOptional({ type: SchoolResponseDto })
  school: SchoolResponseDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
} from 'class-validator';
import { UserRole } from 'src/constants/user.constant';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsString()
  @IsOptional()
  avatar: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: UserRole,
    isArray: true,
    example: [UserRole.Lecturer, UserRole.FacultyDean],
  })
  @IsEnum(UserRole, { each: true })
  @IsNotEmpty()
  roles: UserRole[];

  @ApiPropertyOptional({ 
    description: 'ID của khoa',
    example: 1 
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiPropertyOptional({ 
    description: 'ID của bộ môn',
    example: 1 
  })
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ 
    description: 'ID của ngành',
    example: 1 
  })
  @IsNumber()
  @IsOptional()
  majorId?: number;
}

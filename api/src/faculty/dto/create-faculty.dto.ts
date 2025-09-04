import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({ example: 'HUST-IT-1' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Khoa Công nghệ thông tin và truyền thông' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Khoa Công nghệ thông tin và truyền thông' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 1, description: 'ID của trường mà khoa thuộc về' })
  @IsNumber()
  @IsNotEmpty()
  schoolId: number;
}

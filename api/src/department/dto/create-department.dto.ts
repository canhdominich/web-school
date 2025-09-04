import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  facultyId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  schoolId: number;

  @ApiProperty({ example: 'HUST-IT-1' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Bộ môn Khoa học máy tính' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Bộ môn Khoa học máy tính',
  })
  @IsString()
  @IsOptional()
  description: string;
}

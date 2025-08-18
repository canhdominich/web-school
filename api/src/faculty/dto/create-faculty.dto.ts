import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}

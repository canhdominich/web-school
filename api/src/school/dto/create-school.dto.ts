import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'SCH-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Trường Đại học Bách khoa Hà Nội' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Trường đại học công lập hàng đầu Việt Nam' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội' })
  @IsString()
  @IsOptional()
  address: string;
}

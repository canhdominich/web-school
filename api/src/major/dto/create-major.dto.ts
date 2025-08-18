import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMajorDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty({ example: 'M001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example:
      'Computer science is the study of computers and computational systems, encompassing both theoretical and practical aspects of computing. It involves the design and analysis of algorithms, software, and hardware, as well as the study of information and its processing. Computer science also delves into the theoretical foundations of computation and explores how computers can be used to solve problems in various fields. ',
  })
  @IsString()
  @IsOptional()
  description: string;
}

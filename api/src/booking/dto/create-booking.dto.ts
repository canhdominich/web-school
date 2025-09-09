import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: '2024-01-15T09:00:00.000Z',
    description: 'Thời gian đặt lịch',
  })
  @IsDateString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 1, description: 'ID của dự án' })
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty({ example: 1, description: 'ID của sinh viên' })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;
}

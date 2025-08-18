import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMilestoneSubmissionDto {
  @ApiProperty({ example: 1, description: 'Milestone ID' })
  @IsNumber()
  @IsNotEmpty()
  milestoneId: number;

  @ApiProperty({ example: 'Nộp bản báo cáo giữa kỳ', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  note?: string;

  @ApiProperty({ example: 'https://example.com/file.pdf', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1024)
  fileUrl?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 'System update' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The system will be down for maintenance.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ example: 'https://example.com/details' })
  @IsString()
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'link must be a valid URL' })
  link?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  seen?: boolean;
} 
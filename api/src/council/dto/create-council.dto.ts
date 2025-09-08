import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';

export enum CouncilStatus {
  Active = 'active',
  Inactive = 'inactive',
  Archived = 'archived',
}

export class CreateCouncilDto {
  @ApiProperty({
    example: 'Hội đồng Khoa học và Đào tạo',
    description: 'Tên của hội đồng',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example:
      'Hội đồng chịu trách nhiệm về các vấn đề khoa học và đào tạo của khoa',
    description: 'Mô tả về hội đồng',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Phòng 201, Nhà A1',
    description: 'Địa chỉ/buổi bảo vệ diễn ra',
  })
  @IsString()
  @IsOptional()
  defenseAddress?: string;

  @ApiPropertyOptional({
    enum: CouncilStatus,
    default: CouncilStatus.Active,
    description: 'Trạng thái của hội đồng',
  })
  @IsEnum(CouncilStatus)
  @IsOptional()
  status?: CouncilStatus;

  @ApiPropertyOptional({
    description: 'ID của khoa',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Danh sách ID của các thành viên (chỉ giảng viên)',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  memberIds: number[];
}

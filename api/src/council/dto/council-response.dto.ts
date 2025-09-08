import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouncilStatus } from './create-council.dto';

export class CouncilMemberDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '00000001' })
  code: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 'nguyenvana@example.com' })
  email: string;

  @ApiProperty({ example: '0123456789' })
  phone: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ example: 'Chủ tịch hội đồng' })
  roleInCouncil?: string;
}

export class CouncilFacultyDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Khoa Công nghệ Thông tin' })
  name: string;
}

export class CouncilResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Hội đồng Khoa học và Đào tạo' })
  name: string;

  @ApiPropertyOptional({
    example:
      'Hội đồng chịu trách nhiệm về các vấn đề khoa học và đào tạo của khoa',
  })
  description?: string;

  @ApiPropertyOptional({ example: 'Phòng 201, Nhà A1' })
  defenseAddress?: string;

  @ApiProperty({
    enum: CouncilStatus,
    example: CouncilStatus.Active,
  })
  status: CouncilStatus;

  @ApiPropertyOptional({ example: 1 })
  facultyId?: number;

  @ApiPropertyOptional({ type: CouncilFacultyDto })
  faculty?: CouncilFacultyDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [CouncilMemberDto] })
  members: CouncilMemberDto[];
}

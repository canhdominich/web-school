import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCouncilDto } from './create-council.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCouncilDto extends PartialType(CreateCouncilDto) {
  @ApiPropertyOptional({ description: 'Địa chỉ/buổi bảo vệ diễn ra' })
  @IsString()
  @IsOptional()
  defenseAddress?: string;
}

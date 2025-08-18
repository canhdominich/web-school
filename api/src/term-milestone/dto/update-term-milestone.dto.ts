import { PartialType } from '@nestjs/swagger';
import { CreateTermMilestoneDto } from './create-term-milestone.dto';

export class UpdateTermMilestoneDto extends PartialType(
  CreateTermMilestoneDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { CreateProjectMilestoneDto } from './create-project-milestone.dto';

export class UpdateProjectMilestoneDto extends PartialType(
  CreateProjectMilestoneDto,
) {}

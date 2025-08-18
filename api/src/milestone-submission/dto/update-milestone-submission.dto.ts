import { PartialType } from '@nestjs/swagger';
import { CreateMilestoneSubmissionDto } from './create-milestone-submission.dto';

export class UpdateMilestoneSubmissionDto extends PartialType(
  CreateMilestoneSubmissionDto,
) {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestoneSubmission } from './milestone-submission.entity';
import { MilestoneSubmissionService } from './milestone-submission.service';
import { MilestoneSubmissionController } from './milestone-submission.controller';
import { ProjectMilestone } from '../project-milestone/project-milestone.entity';
import { ProjectMember } from '../project/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MilestoneSubmission,
      ProjectMilestone,
      ProjectMember,
    ]),
  ],
  providers: [MilestoneSubmissionService],
  controllers: [MilestoneSubmissionController],
})
export class MilestoneSubmissionModule {}

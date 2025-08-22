import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestoneSubmission } from './milestone-submission.entity';
import { MilestoneSubmissionService } from './milestone-submission.service';
import { MilestoneSubmissionController } from './milestone-submission.controller';
import { ProjectMilestone } from '../project-milestone/project-milestone.entity';
import { ProjectMember } from '../project/project-member.entity';
import { Project } from '../project/project.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MilestoneSubmission,
      ProjectMilestone,
      ProjectMember,
      Project,
    ]),
    NotificationModule,
  ],
  providers: [MilestoneSubmissionService],
  controllers: [MilestoneSubmissionController],
})
export class MilestoneSubmissionModule {}

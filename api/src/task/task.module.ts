import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project/project.entity';
import { ProjectMilestone } from '../project-milestone/project-milestone.entity';
import { MilestoneSubmission } from '../milestone-submission/milestone-submission.entity';
import { ProjectMember } from '../project/project-member.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectMilestone,
      MilestoneSubmission,
      ProjectMember,
    ]),
    NotificationModule,
  ],
  providers: [TaskService],
})
export class TaskModule {}
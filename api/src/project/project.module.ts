import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectMemberController } from './project-member.controller';
import { ProjectMemberService } from './project-member.service';
import { User } from '../user/user.entity';
import { ProjectMilestoneModule } from '../project-milestone/project-milestone.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, User]),
    ProjectMilestoneModule,
    NotificationModule,
  ],
  controllers: [ProjectController, ProjectMemberController],
  providers: [ProjectService, ProjectMemberService],
  exports: [ProjectService, ProjectMemberService],
})
export class ProjectModule {}

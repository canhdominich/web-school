import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMilestone } from './project-milestone.entity';
import { ProjectMilestoneController } from './project-milestone.controller';
import { ProjectMilestoneService } from './project-milestone.service';
import { TermMilestone } from '../term-milestone/term-milestone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMilestone, TermMilestone])],
  controllers: [ProjectMilestoneController],
  providers: [ProjectMilestoneService],
  exports: [ProjectMilestoneService],
})
export class ProjectMilestoneModule {}

import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  providers: [TaskService],
})
export class TaskModule {}
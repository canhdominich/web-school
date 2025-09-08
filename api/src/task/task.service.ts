
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../project/project.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  @Cron('0 * * * * *')
  async handleCron() {
    this.logger.log('Running task to update projects status to IN_PROGRESS');
    
    const threshold = new Date(Date.now() - 60000);

    // Update all projects that have been approved by rector more than 1 minute ago to IN_PROGRESS
    const result = await this.projectRepository
      .createQueryBuilder()
      .update(Project)
      .set({ status: ProjectStatus.IN_PROGRESS })
      .where('status = :status', { status: ProjectStatus.APPROVED_BY_RECTOR })
      .andWhere('updatedAt < :threshold', { threshold })
      .execute();

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(`Đã cập nhật ${affected} đề tài sang trạng thái IN_PROGRESS`);
    }
  }
}

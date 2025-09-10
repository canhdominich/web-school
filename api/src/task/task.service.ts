import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../project/project.entity';
import {
  ProjectMilestone,
  ProjectMilestoneStatus,
} from '../project-milestone/project-milestone.entity';
import { MilestoneSubmission } from '../milestone-submission/milestone-submission.entity';
import { ProjectMember } from '../project/project-member.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMilestone)
    private readonly projectMilestoneRepository: Repository<ProjectMilestone>,
    @InjectRepository(MilestoneSubmission)
    private readonly milestoneSubmissionRepository: Repository<MilestoneSubmission>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    private readonly notificationService: NotificationService,
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
      this.logger.log(
        `Đã cập nhật ${affected} đề tài sang trạng thái IN_PROGRESS`,
      );
    }
  }

  @Cron('0 6 * * *') // Chạy lúc 6h sáng hàng ngày
  async checkUpcomingDeadlines() {
    this.logger.log('Running task to check upcoming milestone deadlines');

    try {
      // Tính toán khoảng thời gian từ hôm nay đến 7 ngày tới
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);

      // Tìm tất cả milestones có dueDate trong vòng 7 ngày tới (1-7 ngày)
      const upcomingMilestones = await this.projectMilestoneRepository
        .createQueryBuilder('milestone')
        .leftJoinAndSelect('milestone.project', 'project')
        .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
        .where('milestone.dueDate >= :today', { today })
        .andWhere('milestone.dueDate <= :nextWeek', { nextWeek })
        .andWhere('milestone.status = :status', {
          status: ProjectMilestoneStatus.ACTIVE,
        })
        .andWhere('project.status IN (:...statuses)', {
          statuses: [
            ProjectStatus.IN_PROGRESS,
            ProjectStatus.APPROVED_BY_LECTURER,
            ProjectStatus.APPROVED_BY_FACULTY_DEAN,
            ProjectStatus.APPROVED_BY_RECTOR,
          ],
        })
        .getMany();

      this.logger.log(
        `Found ${upcomingMilestones.length} milestones due in the next 7 days`,
      );

      // Kiểm tra từng milestone xem có submission chưa
      for (const milestone of upcomingMilestones) {
        const hasSubmission = await this.milestoneSubmissionRepository
          .createQueryBuilder('submission')
          .where('submission.milestoneId = :milestoneId', {
            milestoneId: milestone.id,
          })
          .getOne();

        if (!hasSubmission) {
          // Gửi thông báo cho tất cả member trong dự án
          await this.sendDeadlineReminderNotifications(milestone);
        }
      }

      this.logger.log('Deadline reminder task completed successfully');
    } catch (error) {
      this.logger.error('Error in deadline reminder task:', error);
    }
  }

  private async sendDeadlineReminderNotifications(
    milestone: ProjectMilestone,
  ): Promise<void> {
    try {
      // Lấy tất cả member trong dự án
      const projectMembers = await this.projectMemberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.student', 'student')
        .where('member.projectId = :projectId', {
          projectId: milestone.projectId,
        })
        .getMany();

      const dueDate = new Date(milestone.dueDate).toLocaleDateString('vi-VN');

      // Tính số ngày còn lại đến deadline
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const milestoneDate = new Date(milestone.dueDate);
      milestoneDate.setHours(0, 0, 0, 0);

      const daysRemaining = Math.ceil(
        (milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let daysText = '';
      if (daysRemaining === 0) {
        daysText = 'hôm nay';
      } else if (daysRemaining === 1) {
        daysText = 'ngày mai';
      } else {
        daysText = `còn ${daysRemaining} ngày nữa`;
      }

      // Thông báo cho giảng viên hướng dẫn
      if (milestone.project.supervisorUser) {
        await this.notificationService.create({
          title: 'Nhắc nhở deadline milestone',
          body: `Milestone "${milestone.title}" của đề tài "${milestone.project.title}" (${milestone.project.code}) sẽ đến hạn ${daysText} (${dueDate}). Vui lòng nhắc nhở sinh viên hoàn thành.`,
          userId: milestone.project.supervisorUser.id,
        });
      }

      // Thông báo cho tất cả member trong dự án
      for (const member of projectMembers) {
        await this.notificationService.create({
          title: 'Nhắc nhở deadline milestone',
          body: `Milestone "${milestone.title}" của đề tài "${milestone.project.title}" (${milestone.project.code}) sẽ đến hạn ${daysText} (${dueDate}). Vui lòng hoàn thành và nộp bài trước deadline.`,
          userId: member.studentId,
        });
      }

      this.logger.log(
        `Sent deadline reminders for milestone ${milestone.id} (${daysRemaining} days remaining) to ${projectMembers.length + (milestone.project.supervisorUser ? 1 : 0)} recipients`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending deadline reminders for milestone ${milestone.id}:`,
        error,
      );
    }
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MilestoneSubmission } from './milestone-submission.entity';
import { CreateMilestoneSubmissionDto } from './dto/create-milestone-submission.dto';
import { UpdateMilestoneSubmissionDto } from './dto/update-milestone-submission.dto';
import { ProjectMilestone } from '../project-milestone/project-milestone.entity';
import { ProjectMember } from '../project/project-member.entity';
import { Project, ProjectStatus } from '../project/project.entity';
import { getProjectStatusLabel } from '../project/project.utils';
import { UserRole } from '../constants/user.constant';
import { NotificationService } from '../notification/notification.service';
import { RequestUser } from '../interfaces';

@Injectable()
export class MilestoneSubmissionService {
  constructor(
    @InjectRepository(MilestoneSubmission)
    private readonly submissionRepo: Repository<MilestoneSubmission>,
    @InjectRepository(ProjectMilestone)
    private readonly pmRepo: Repository<ProjectMilestone>,
    @InjectRepository(ProjectMember)
    private readonly memberRepo: Repository<ProjectMember>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    dto: CreateMilestoneSubmissionDto,
    user: RequestUser,
  ): Promise<MilestoneSubmission> {
    if (!user.roles.includes(UserRole.Student)) {
      throw new ForbiddenException('Chỉ sinh viên mới có thể nộp tài liệu');
    }

    const milestone = await this.pmRepo.findOne({
      where: { id: dto.milestoneId },
      relations: ['project'],
    });
    if (!milestone) throw new NotFoundException('Mốc không tồn tại');

    // Project status check: only allow when APPROVED or IN_PROGRESS
    const projectStatus = milestone.project?.status;
    if (
      projectStatus !== ProjectStatus.APPROVED &&
      projectStatus !== ProjectStatus.IN_PROGRESS
    ) {
      const label = getProjectStatusLabel(projectStatus);
      throw new BadRequestException(
        `Không thể submit tài liệu vì dự án đang ở trạng thái ${label}`,
      );
    }

    // Due date check (allow submission on or before dueDate)
    const today = new Date();
    const due = new Date(milestone.dueDate);
    if (today.getTime() > due.getTime()) {
      throw new BadRequestException('Ngày hết hạn của mốc đã qua');
    }

    // Membership check
    const membership = await this.memberRepo.findOne({
      where: { projectId: milestone.projectId, studentId: user.id },
    });
    if (!membership) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên của dự án này',
      );
    }

    // Versioning: next version = last version + 1 for this milestone & user
    const last = await this.submissionRepo.find({
      where: { milestoneId: dto.milestoneId },
      order: { version: 'DESC' },
      take: 1,
    });
    const nextVersion = last.length ? last[0].version + 1 : 1;

    const entity = this.submissionRepo.create({
      milestoneId: dto.milestoneId,
      submittedBy: user.id,
      submittedAt: new Date(),
      note: dto.note ?? null,
      fileUrl: dto.fileUrl ?? null,
      version: nextVersion,
    });
    const savedSubmission = await this.submissionRepo.save(entity);

    // Send notifications to supervisor and project members
    await this.sendMilestoneSubmissionNotifications(
      milestone,
      user.id,
      savedSubmission,
    );

    return savedSubmission;
  }

  private async sendMilestoneSubmissionNotifications(
    milestone: ProjectMilestone,
    submittedByUserId: number,
    submission: MilestoneSubmission,
  ): Promise<void> {
    try {
      // Get project with relations to access supervisor and members
      const project = await this.projectRepo.findOne({
        where: { id: milestone.projectId },
        relations: ['supervisorUser', 'members', 'members.student'],
      });

      if (!project) return;

      // Get submitter info
      const submitter = await this.memberRepo.findOne({
        where: { projectId: project.id, studentId: submittedByUserId },
        relations: ['student'],
      });

      const submitterName = submitter?.student?.name || 'Sinh viên';

      // Notification for supervisor
      if (project.supervisorUser) {
        await this.notificationService.create({
          title: 'Tài liệu mốc mới được nộp',
          body: `Sinh viên ${submitterName} đã nộp tài liệu cho mốc "${milestone.title}" của dự án "${project.title}" (${project.code}). Phiên bản: v${submission.version}`,
          userId: project.supervisorUser.id,
        });
      }

      // Notifications for project members (excluding the submitter)
      if (project.members && project.members.length > 0) {
        const memberNotifications = project.members
          .filter((member) => member.studentId !== submittedByUserId)
          .map((member) => ({
            title: 'Tài liệu mốc mới được nộp',
            body: `Sinh viên ${submitterName} đã nộp tài liệu cho mốc "${milestone.title}" của dự án "${project.title}" (${project.code}). Phiên bản: v${submission.version}`,
            userId: member.studentId,
          }));

        // Create notifications in parallel
        await Promise.all(
          memberNotifications.map((notification) =>
            this.notificationService.create(notification),
          ),
        );
      }
    } catch (error) {
      // Log error but don't fail the submission creation
      console.error('Error sending milestone submission notifications:', error);
    }
  }

  async findByMilestone(milestoneId: number): Promise<MilestoneSubmission[]> {
    return this.submissionRepo.find({
      where: { milestoneId },
      relations: ['submittedByUser'],
      order: { version: 'DESC' },
    });
  }

  async findMine(user: RequestUser): Promise<MilestoneSubmission[]> {
    return this.submissionRepo.find({ where: { submittedBy: user.id } });
  }

  async update(
    id: number,
    dto: UpdateMilestoneSubmissionDto,
    user: RequestUser,
  ): Promise<MilestoneSubmission> {
    const entity = await this.submissionRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Submission not found');
    if (entity.submittedBy !== user.id) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật bản nộp của mình');
    }
    Object.assign(entity, dto);
    return await this.submissionRepo.save(entity);
  }

  async remove(id: number, user: RequestUser): Promise<MilestoneSubmission> {
    const entity = await this.submissionRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Submission not found');
    if (entity.submittedBy !== user.id) {
      throw new ForbiddenException('Bạn chỉ có thể xóa bản nộp của mình');
    }
    await this.submissionRepo.remove(entity);
    return entity;
  }
}

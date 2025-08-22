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
import { UserRole } from '../constants/user.constant';

interface RequestUser {
  id: number;
  roles: string[];
}

@Injectable()
export class MilestoneSubmissionService {
  constructor(
    @InjectRepository(MilestoneSubmission)
    private readonly submissionRepo: Repository<MilestoneSubmission>,
    @InjectRepository(ProjectMilestone)
    private readonly pmRepo: Repository<ProjectMilestone>,
    @InjectRepository(ProjectMember)
    private readonly memberRepo: Repository<ProjectMember>,
  ) {}

  async create(
    dto: CreateMilestoneSubmissionDto,
    user: RequestUser,
  ): Promise<MilestoneSubmission> {
    if (!user.roles.includes(UserRole.Student)) {
      throw new ForbiddenException('Only Student can submit');
    }

    const milestone = await this.pmRepo.findOne({
      where: { id: dto.milestoneId },
    });
    if (!milestone) throw new NotFoundException('Milestone not found');

    // Due date check (allow submission on or before dueDate)
    const today = new Date();
    const due = new Date(milestone.dueDate);
    if (today.getTime() > due.getTime()) {
      throw new BadRequestException('The milestone due date has passed');
    }

    // Membership check
    const membership = await this.memberRepo.findOne({
      where: { projectId: milestone.projectId, studentId: user.id },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }

    // Versioning: next version = last version + 1 for this milestone & user
    const last = await this.submissionRepo.find({
      where: { milestoneId: dto.milestoneId, submittedBy: user.id },
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
    return await this.submissionRepo.save(entity);
  }

  async findByMilestone(milestoneId: number): Promise<MilestoneSubmission[]> {
    return this.submissionRepo.find({ where: { milestoneId } });
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
      throw new ForbiddenException('You can only update your own submission');
    }
    Object.assign(entity, dto);
    return await this.submissionRepo.save(entity);
  }

  async remove(id: number, user: RequestUser): Promise<MilestoneSubmission> {
    const entity = await this.submissionRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Submission not found');
    if (entity.submittedBy !== user.id) {
      throw new ForbiddenException('You can only delete your own submission');
    }
    await this.submissionRepo.remove(entity);
    return entity;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import {
  ProjectMilestone,
  ProjectMilestoneStatus,
} from './project-milestone.entity';
import { CreateProjectMilestoneDto } from './dto/create-project-milestone.dto';
import { UpdateProjectMilestoneDto } from './dto/update-project-milestone.dto';
import {
  TermMilestone,
  TermMilestoneStatus,
} from '../term-milestone/term-milestone.entity';

@Injectable()
export class ProjectMilestoneService {
  constructor(
    @InjectRepository(ProjectMilestone)
    private readonly pmRepository: Repository<ProjectMilestone>,
    @InjectRepository(TermMilestone)
    private readonly tmRepository: Repository<TermMilestone>,
  ) {}

  async create(dto: CreateProjectMilestoneDto): Promise<ProjectMilestone> {
    const partial: DeepPartial<ProjectMilestone> = {
      projectId: dto.projectId,
      title: dto.title,
      dueDate: dto.dueDate as unknown as Date,
      description: dto.description ?? null,
      orderIndex: dto.orderIndex ?? 0,
      status: dto.status ?? ProjectMilestoneStatus.ACTIVE,
    };
    const entity = this.pmRepository.create(partial);
    return await this.pmRepository.save(entity);
  }

  async findAll(): Promise<ProjectMilestone[]> {
    return this.pmRepository.find({ relations: ['project'] });
  }

  async findOne(id: number): Promise<ProjectMilestone> {
    const entity = await this.pmRepository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Project milestone ${id} not found`);
    return entity;
  }

  async update(
    id: number,
    dto: UpdateProjectMilestoneDto,
  ): Promise<ProjectMilestone> {
    const entity = await this.pmRepository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Project milestone ${id} not found`);
    const partial: DeepPartial<ProjectMilestone> = {
      title: dto.title,
      dueDate: (dto.dueDate as unknown as Date) ?? undefined,
      description: dto.description,
      orderIndex: dto.orderIndex,
      status: dto.status,
    };
    Object.assign(entity, partial);
    return await this.pmRepository.save(entity);
  }

  async remove(id: number): Promise<ProjectMilestone> {
    const entity = await this.pmRepository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Project milestone ${id} not found`);
    await this.pmRepository.remove(entity);
    return entity;
  }

  async findByProject(projectId: number): Promise<ProjectMilestone[]> {
    return this.pmRepository.find({
      where: { projectId },
      order: { orderIndex: 'ASC' },
    });
  }

  // Copy term milestones to project milestones
  async copyFromTerm(
    termId: number,
    projectId: number,
  ): Promise<ProjectMilestone[]> {
    const termMilestones = await this.tmRepository.find({
      where: { termId },
      order: { orderIndex: 'ASC' },
    });

    if (termMilestones.length === 0) return [];

    const records: DeepPartial<ProjectMilestone>[] = termMilestones.map(
      (tm) => ({
        projectId,
        title: tm.title,
        dueDate: tm.dueDate as unknown as Date,
        description: tm.description ?? null,
        orderIndex: tm.orderIndex ?? 0,
        isRequired: tm.isRequired ?? false,
        status:
          tm.status === TermMilestoneStatus.INACTIVE
            ? ProjectMilestoneStatus.INACTIVE
            : ProjectMilestoneStatus.ACTIVE,
      }),
    );

    const entities = this.pmRepository.create(records);
    return await this.pmRepository.save(entities);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermMilestone } from './term-milestone.entity';
import { CreateTermMilestoneDto } from './dto/create-term-milestone.dto';
import { UpdateTermMilestoneDto } from './dto/update-term-milestone.dto';

@Injectable()
export class TermMilestoneService {
  constructor(
    @InjectRepository(TermMilestone)
    private readonly milestoneRepository: Repository<TermMilestone>,
  ) {}

  async create(dto: CreateTermMilestoneDto): Promise<TermMilestone> {
    // Optional uniqueness on (termId, name) + dueDate if needed. Here we skip unique constraint.
    const entity = this.milestoneRepository.create(dto);
    return await this.milestoneRepository.save(entity);
  }

  async findAll(): Promise<TermMilestone[]> {
    return this.milestoneRepository.find({ relations: ['term'] });
  }

  async findOne(id: number): Promise<TermMilestone> {
    const entity = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['term'],
    });
    if (!entity) {
      throw new NotFoundException(`Term milestone with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    id: number,
    dto: UpdateTermMilestoneDto,
  ): Promise<TermMilestone> {
    const entity = await this.milestoneRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Term milestone with ID ${id} not found`);
    }
    Object.assign(entity, dto);
    return await this.milestoneRepository.save(entity);
  }

  async remove(id: number): Promise<TermMilestone> {
    const entity = await this.milestoneRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Term milestone with ID ${id} not found`);
    }
    await this.milestoneRepository.remove(entity);
    return entity;
  }

  async findByTerm(termId: number): Promise<TermMilestone[]> {
    return this.milestoneRepository.find({
      where: { termId },
      order: { orderIndex: 'ASC' },
    });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from './term.entity';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { TermResponseDto } from './dto/term-response.dto';

@Injectable()
export class TermService {
  constructor(
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  async create(createTermDto: CreateTermDto): Promise<TermResponseDto> {
    // Check if term code already exists
    const existingTerm = await this.termRepository.findOne({
      where: { code: createTermDto.code },
    });
    if (existingTerm) {
      throw new ConflictException('Mã sự kiện đã tồn tại');
    }

    const term = this.termRepository.create(createTermDto);
    const savedTerm = await this.termRepository.save(term);

    // Return with empty termMilestones array for newly created term
    return {
      ...savedTerm,
      termMilestones: [],
    };
  }

  async findAll(): Promise<TermResponseDto[]> {
    const terms = await this.termRepository.find({
      relations: ['termMilestones'],
      order: {
        createdAt: 'DESC',
        termMilestones: {
          orderIndex: 'ASC',
        },
      },
    });

    return terms;
  }

  async findOne(id: number): Promise<TermResponseDto> {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['termMilestones'],
      order: {
        termMilestones: {
          orderIndex: 'ASC',
        },
      },
    });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy sự kiện có ID ${id}`);
    }

    return term;
  }

  async update(
    id: number,
    updateTermDto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['termMilestones'],
    });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy sự kiện có ID ${id}`);
    }

    // Check if term code already exists (if code is being updated)
    if (updateTermDto.code && updateTermDto.code !== term.code) {
      const existingTerm = await this.termRepository.findOne({
        where: { code: updateTermDto.code },
      });
      if (existingTerm) {
        throw new ConflictException('Mã sự kiện đã tồn tại');
      }
    }

    Object.assign(term, updateTermDto);
    const updatedTerm = await this.termRepository.save(term);

    // Fetch the updated term with relations
    return this.findOne(id);
  }

  async remove(id: number): Promise<TermResponseDto> {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['termMilestones'],
    });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy sự kiện có ID ${id}`);
    }

    // Store term data before deletion for response
    const termToReturn = { ...term };

    await this.termRepository.remove(term);
    return termToReturn;
  }
}

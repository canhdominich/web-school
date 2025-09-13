import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from './term.entity';
import {
  CreateTermDto,
  UpdateTermDto,
  TermResponseDto,
  SearchTermDto,
  PaginatedTermResponseDto,
} from './dto';

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
      throw new ConflictException('Mã kế hoạch NCKH đã tồn tại');
    }

    const term = this.termRepository.create(createTermDto);
    const savedTerm = await this.termRepository.save(term);

    // Return with empty termMilestones array for newly created term
    return {
      ...savedTerm,
      termMilestones: [],
    };
  }

  async findAll(
    searchDto?: SearchTermDto,
  ): Promise<TermResponseDto[] | PaginatedTermResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      const terms = await this.termRepository.find({
        relations: ['termMilestones', 'academicYear'],
        order: {
          createdAt: 'DESC',
          termMilestones: {
            orderIndex: 'ASC',
          },
        },
      });

      return terms;
    }

    const {
      name,
      description,
      academicYear,
      academicYearId,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder = this.termRepository
      .createQueryBuilder('term')
      .leftJoinAndSelect('term.termMilestones', 'termMilestones')
      .leftJoinAndSelect('term.academicYear', 'academicYear');

    if (name) {
      queryBuilder.andWhere('term.name LIKE :name', { name: `%${name}%` });
    }

    if (description) {
      queryBuilder.andWhere('term.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (academicYear) {
      queryBuilder.andWhere('academicYear.name LIKE :academicYear', {
        academicYear: `%${academicYear}%`,
      });
    }

    if (academicYearId) {
      queryBuilder.andWhere('term.academicYearId = :academicYearId', {
        academicYearId: Number(academicYearId),
      });
    }

    if (status) {
      queryBuilder.andWhere('term.status = :status', { status });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'academicYear',
        'status',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`term.${sortField}`, order);
    } else {
      queryBuilder.orderBy('term.createdAt', 'DESC');
    }

    if (page && limit) {
      const total = await queryBuilder.getCount();

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const data = await queryBuilder.getMany();

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<TermResponseDto> {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['termMilestones', 'academicYear'],
      order: {
        termMilestones: {
          orderIndex: 'ASC',
        },
      },
    });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy kế hoạch NCKH có ID ${id}`);
    }

    return term;
  }

  async update(
    id: number,
    updateTermDto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['termMilestones', 'academicYear'],
    });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy kế hoạch NCKH có ID ${id}`);
    }

    // Check if term code already exists (if code is being updated)
    if (updateTermDto.code && updateTermDto.code !== term.code) {
      const existingTerm = await this.termRepository.findOne({
        where: { code: updateTermDto.code },
      });
      if (existingTerm) {
        throw new ConflictException('Mã kế hoạch NCKH đã tồn tại');
      }
    }

    Object.assign(term, updateTermDto);
    await this.termRepository.save(term);

    // Fetch the updated term with relations
    return this.findOne(id);
  }

  async remove(id: number): Promise<TermResponseDto> {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['termMilestones', 'academicYear'],
    });

    if (!term) {
      throw new NotFoundException(`Không tìm thấy kế hoạch NCKH có ID ${id}`);
    }

    // Store term data before deletion for response
    const termToReturn = { ...term };

    await this.termRepository.remove(term);
    return termToReturn;
  }
}

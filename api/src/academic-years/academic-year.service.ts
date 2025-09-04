import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from './academic-year.entity';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { SearchAcademicYearDto } from './dto/search-academic-year.dto';
import { PaginatedAcademicYearResponseDto } from './dto/paginated-academic-year-response.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(createAcademicYearDto: CreateAcademicYearDto): Promise<AcademicYear> {
    // Check if academic year code already exists
    const existingAcademicYear = await this.academicYearRepository.findOne({
      where: { code: createAcademicYearDto.code },
    });
    if (existingAcademicYear) {
      throw new ConflictException('Mã năm học đã tồn tại');
    }

    // Validate date range
    const startDate = new Date(createAcademicYearDto.startDate);
    const endDate = new Date(createAcademicYearDto.endDate);
    
    if (startDate >= endDate) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }

    // Check for overlapping academic years
    const overlappingYear = await this.academicYearRepository
      .createQueryBuilder('academicYear')
      .where(
        '(academicYear.startDate <= :endDate AND academicYear.endDate >= :startDate)',
        { startDate, endDate }
      )
      .getOne();

    if (overlappingYear) {
      throw new ConflictException('Năm học này trùng lặp với năm học khác');
    }

    const academicYear = this.academicYearRepository.create({
      ...createAcademicYearDto,
      startDate,
      endDate,
    });
    return this.academicYearRepository.save(academicYear);
  }

  async findAll(
    searchDto?: SearchAcademicYearDto,
  ): Promise<AcademicYear[] | PaginatedAcademicYearResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      return this.academicYearRepository.find();
    }

    const { name, code, description, startDate, endDate, page, limit, sortBy, sortOrder } =
      searchDto;

    const queryBuilder = this.academicYearRepository.createQueryBuilder('academicYear');

    if (name) {
      queryBuilder.andWhere('academicYear.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('academicYear.code LIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('academicYear.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('academicYear.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('academicYear.endDate <= :endDate', { endDate });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'code',
        'startDate',
        'endDate',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`academicYear.${sortField}`, order);
    } else {
      queryBuilder.orderBy('academicYear.createdAt', 'DESC');
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

  async findOne(id: number): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepository.findOne({ where: { id } });

    if (!academicYear) {
      throw new NotFoundException(`Không tìm thấy năm học có ID ${id}`);
    }

    return academicYear;
  }

  async update(
    id: number,
    updateAcademicYearDto: UpdateAcademicYearDto,
  ): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepository.findOne({ where: { id } });

    if (!academicYear) {
      throw new NotFoundException(`Không tìm thấy năm học có ID ${id}`);
    }

    // Check if academic year code already exists (if code is being updated)
    if (updateAcademicYearDto.code && updateAcademicYearDto.code !== academicYear.code) {
      const existingAcademicYear = await this.academicYearRepository.findOne({
        where: { code: updateAcademicYearDto.code },
      });
      if (existingAcademicYear) {
        throw new ConflictException('Mã năm học đã tồn tại');
      }
    }

    // Validate date range if dates are being updated
    if (updateAcademicYearDto.startDate || updateAcademicYearDto.endDate) {
      const startDate = updateAcademicYearDto.startDate 
        ? new Date(updateAcademicYearDto.startDate) 
        : new Date(academicYear.startDate);
      const endDate = updateAcademicYearDto.endDate 
        ? new Date(updateAcademicYearDto.endDate) 
        : new Date(academicYear.endDate);
      
      if (startDate >= endDate) {
        throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      }

      // Check for overlapping academic years (excluding current one)
      const overlappingYear = await this.academicYearRepository
        .createQueryBuilder('academicYear')
        .where(
          'academicYear.id != :id AND (academicYear.startDate <= :endDate AND academicYear.endDate >= :startDate)',
          { id, startDate, endDate }
        )
        .getOne();

      if (overlappingYear) {
        throw new ConflictException('Năm học này trùng lặp với năm học khác');
      }
    }

    Object.assign(academicYear, updateAcademicYearDto);
    return this.academicYearRepository.save(academicYear);
  }

  async remove(id: number): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepository.findOne({ where: { id } });

    if (!academicYear) {
      throw new NotFoundException(`Không tìm thấy năm học có ID ${id}`);
    }

    await this.academicYearRepository.remove(academicYear);
    return academicYear;
  }
}

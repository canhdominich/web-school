import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from './major.entity';
import { CreateMajorDto, UpdateMajorDto, SearchMajorDto, PaginatedMajorResponseDto } from './dto';
import { Department } from '../department/department.entity';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createMajorDto: CreateMajorDto): Promise<Major> {
    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id: createMajorDto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(
        `Không tìm thấy phòng ban có ID ${createMajorDto.departmentId}`,
      );
    }

    // Check if major code already exists
    const existingMajor = await this.majorRepository.findOne({
      where: { code: createMajorDto.code },
    });
    if (existingMajor) {
      throw new ConflictException('Mã ngành học đã tồn tại');
    }

    const major = this.majorRepository.create(createMajorDto);
    return this.majorRepository.save(major);
  }

  async findAll(
    searchDto?: SearchMajorDto,
  ): Promise<Major[] | PaginatedMajorResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      return this.majorRepository.find({
        relations: ['department'],
      });
    }

    const { name, code, description, facultyId, departmentId, page, limit, sortBy, sortOrder } =
      searchDto;

    const queryBuilder = this.majorRepository.createQueryBuilder('major')
      .leftJoinAndSelect('major.department', 'department')
      .leftJoinAndSelect('department.faculty', 'faculty');

    if (name) {
      queryBuilder.andWhere('major.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('major.code LIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('major.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (facultyId) {
      queryBuilder.andWhere('department.facultyId = :facultyId', { facultyId });
    }

    if (departmentId) {
      queryBuilder.andWhere('major.departmentId = :departmentId', { departmentId });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'code',
        'facultyId',
        'departmentId',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`major.${sortField}`, order);
    } else {
      queryBuilder.orderBy('major.createdAt', 'DESC');
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

  async findOne(id: number): Promise<Major> {
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: ['department'],
    });

    if (!major) {
      throw new NotFoundException(`Không tìm thấy ngành học có ID ${id}`);
    }

    return major;
  }

  async update(id: number, updateMajorDto: UpdateMajorDto): Promise<Major> {
    const major = await this.majorRepository.findOne({ where: { id } });

    if (!major) {
      throw new NotFoundException(`Không tìm thấy ngành học có ID ${id}`);
    }

    // Check if department exists if departmentId is being updated
    if (updateMajorDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateMajorDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Không tìm thấy phòng ban có ID ${updateMajorDto.departmentId}`,
        );
      }
    }

    // Check if major code already exists (if code is being updated)
    if (updateMajorDto.code && updateMajorDto.code !== major.code) {
      const existingMajor = await this.majorRepository.findOne({
        where: { code: updateMajorDto.code },
      });
      if (existingMajor) {
        throw new ConflictException('Mã ngành học đã tồn tại');
      }
    }

    Object.assign(major, updateMajorDto);
    return this.majorRepository.save(major);
  }

  async remove(id: number): Promise<Major> {
    const major = await this.majorRepository.findOne({ where: { id } });

    if (!major) {
      throw new NotFoundException(`Không tìm thấy ngành học có ID ${id}`);
    }

    await this.majorRepository.remove(major);
    return major;
  }
} 
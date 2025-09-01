import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, SearchDepartmentDto, PaginatedDepartmentResponseDto } from './dto';
import { Faculty } from '../faculty/faculty.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Check if faculty exists
    const faculty = await this.facultyRepository.findOne({
      where: { id: createDepartmentDto.facultyId },
    });
    if (!faculty) {
      throw new NotFoundException(
        `Không tìm thấy khoa có ID ${createDepartmentDto.facultyId}`,
      );
    }

    // Check if department code already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { code: createDepartmentDto.code },
    });
    if (existingDepartment) {
      throw new ConflictException('Mã bộ môn đã tồn tại');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(
    searchDto?: SearchDepartmentDto,
  ): Promise<Department[] | PaginatedDepartmentResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      return this.departmentRepository.find({
        relations: ['faculty'],
      });
    }

    const { name, code, description, facultyId, page, limit, sortBy, sortOrder } =
      searchDto;

    const queryBuilder = this.departmentRepository.createQueryBuilder('department')
      .leftJoinAndSelect('department.faculty', 'faculty');

    if (name) {
      queryBuilder.andWhere('department.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('department.code LIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('department.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (facultyId) {
      queryBuilder.andWhere('department.facultyId = :facultyId', { facultyId });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'code',
        'facultyId',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`department.${sortField}`, order);
    } else {
      queryBuilder.orderBy('department.createdAt', 'DESC');
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

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['faculty'],
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy bộ môn có ID ${id}`);
    }

    return department;
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy bộ môn có ID ${id}`);
    }

    // Check if faculty exists if facultyId is being updated
    if (updateDepartmentDto.facultyId) {
      const faculty = await this.facultyRepository.findOne({
        where: { id: updateDepartmentDto.facultyId },
      });
      if (!faculty) {
        throw new NotFoundException(
          `Không tìm thấy khoa có ID ${updateDepartmentDto.facultyId}`,
        );
      }
    }

    // Check if department code already exists (if code is being updated)
    if (
      updateDepartmentDto.code &&
      updateDepartmentDto.code !== department.code
    ) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { code: updateDepartmentDto.code },
      });
      if (existingDepartment) {
        throw new ConflictException('Mã bộ môn đã tồn tại');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy bộ môn có ID ${id}`);
    }

    await this.departmentRepository.remove(department);
    return department;
  }
}

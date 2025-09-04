import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  SearchDepartmentDto,
  PaginatedDepartmentResponseDto,
  DepartmentResponseDto,
} from './dto';
import { Faculty } from '../faculty/faculty.entity';
import { School } from '../school/school.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    // Check if school exists
    const school = await this.schoolRepository.findOne({
      where: { id: createDepartmentDto.schoolId },
    });
    if (!school) {
      throw new NotFoundException(
        `Không tìm thấy trường có ID ${createDepartmentDto.schoolId}`,
      );
    }

    // Check if faculty exists
    const faculty = await this.facultyRepository.findOne({
      where: { id: createDepartmentDto.facultyId },
    });
    if (!faculty) {
      throw new NotFoundException(
        `Không tìm thấy khoa có ID ${createDepartmentDto.facultyId}`,
      );
    }

    // Check if faculty belongs to the specified school
    if (Number(faculty.schoolId) !== Number(createDepartmentDto.schoolId)) {
      throw new BadRequestException(
        `Khoa có ID ${createDepartmentDto.facultyId} không thuộc về trường có ID ${createDepartmentDto.schoolId}`,
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
    const savedDepartment = await this.departmentRepository.save(department);
    return this.findOneWithRelations(savedDepartment.id);
  }

  async findAll(
    searchDto?: SearchDepartmentDto,
  ): Promise<DepartmentResponseDto[] | PaginatedDepartmentResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      const departments = await this.departmentRepository.find({
        relations: ['faculty', 'school'],
      });
      return departments.map((department) => this.mapToResponseDto(department));
    }

    const {
      name,
      code,
      description,
      facultyId,
      schoolId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.faculty', 'faculty')
      .leftJoinAndSelect('department.school', 'school');

    if (name) {
      queryBuilder.andWhere('department.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (code) {
      queryBuilder.andWhere('department.code LIKE :code', {
        code: `%${code}%`,
      });
    }

    if (description) {
      queryBuilder.andWhere('department.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (facultyId) {
      queryBuilder.andWhere('department.facultyId = :facultyId', { facultyId });
    }

    if (schoolId) {
      queryBuilder.andWhere('department.schoolId = :schoolId', { schoolId });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'code',
        'facultyId',
        'schoolId',
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
        data: data.map((department) => this.mapToResponseDto(department)),
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    }

    const departments = await queryBuilder.getMany();
    return departments.map((department) => this.mapToResponseDto(department));
  }

  async findOne(id: number): Promise<DepartmentResponseDto> {
    return this.findOneWithRelations(id);
  }

  async findOneWithRelations(id: number): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['faculty', 'school'],
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy bộ môn có ID ${id}`);
    }

    return this.mapToResponseDto(department);
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy bộ môn có ID ${id}`);
    }

    // Check if school exists if schoolId is being updated
    if (updateDepartmentDto.schoolId) {
      const school = await this.schoolRepository.findOne({
        where: { id: updateDepartmentDto.schoolId },
      });
      if (!school) {
        throw new NotFoundException(
          `Không tìm thấy trường có ID ${updateDepartmentDto.schoolId}`,
        );
      }
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

    // Check if faculty belongs to the specified school (if both are being updated)
    if (updateDepartmentDto.facultyId && updateDepartmentDto.schoolId) {
      const faculty = await this.facultyRepository.findOne({
        where: { id: updateDepartmentDto.facultyId },
      });
      if (
        faculty &&
        Number(faculty.schoolId) !== Number(updateDepartmentDto.schoolId)
      ) {
        throw new BadRequestException(
          `Khoa có ID ${updateDepartmentDto.facultyId} không thuộc về trường có ID ${updateDepartmentDto.schoolId}`,
        );
      }
    }

    // Check if faculty belongs to the current school (if only facultyId is being updated)
    if (updateDepartmentDto.facultyId && !updateDepartmentDto.schoolId) {
      const faculty = await this.facultyRepository.findOne({
        where: { id: updateDepartmentDto.facultyId },
      });
      if (faculty && faculty.schoolId !== department.schoolId) {
        throw new BadRequestException(
          `Khoa có ID ${updateDepartmentDto.facultyId} không thuộc về trường có ID ${department.schoolId}`,
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
    const updatedDepartment = await this.departmentRepository.save(department);
    return this.findOneWithRelations(updatedDepartment.id);
  }

  async remove(id: number): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['faculty', 'school'],
    });

    if (!department) {
      throw new NotFoundException(`Không tìm thấy bộ môn có ID ${id}`);
    }

    await this.departmentRepository.remove(department);
    return this.mapToResponseDto(department);
  }

  private mapToResponseDto(department: Department): DepartmentResponseDto {
    return {
      id: department.id,
      code: department.code,
      name: department.name,
      description: department.description,
      facultyId: department.facultyId,
      faculty: department.faculty
        ? {
            id: department.faculty.id,
            code: department.faculty.code,
            name: department.faculty.name,
            description: department.faculty.description,
            schoolId: department.faculty.schoolId,
          }
        : null,
      schoolId: department.schoolId,
      school: department.school
        ? {
            id: department.school.id,
            code: department.school.code,
            name: department.school.name,
            description: department.school.description,
            address: department.school.address,
          }
        : null,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }
}

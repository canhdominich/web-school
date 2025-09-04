import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from './major.entity';
import {
  CreateMajorDto,
  UpdateMajorDto,
  SearchMajorDto,
  PaginatedMajorResponseDto,
  MajorResponseDto,
} from './dto';
import { Department } from '../department/department.entity';
import { Faculty } from '../faculty/faculty.entity';
import { School } from '../school/school.entity';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async create(createMajorDto: CreateMajorDto): Promise<MajorResponseDto> {
    // Check if school exists
    const school = await this.schoolRepository.findOne({
      where: { id: createMajorDto.schoolId },
    });
    if (!school) {
      throw new NotFoundException(
        `Không tìm thấy trường có ID ${createMajorDto.schoolId}`,
      );
    }

    // Check if faculty exists
    const faculty = await this.facultyRepository.findOne({
      where: { id: createMajorDto.facultyId },
    });
    if (!faculty) {
      throw new NotFoundException(
        `Không tìm thấy khoa có ID ${createMajorDto.facultyId}`,
      );
    }

    // Check if faculty belongs to the specified school
    if (Number(faculty.schoolId) !== Number(createMajorDto.schoolId)) {
      throw new BadRequestException(
        `Khoa có ID ${createMajorDto.facultyId} không thuộc về trường có ID ${createMajorDto.schoolId}`,
      );
    }

    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id: createMajorDto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(
        `Không tìm thấy bộ môn có ID ${createMajorDto.departmentId}`,
      );
    }

    // Check if department belongs to the specified faculty
    if (Number(department.facultyId) !== Number(createMajorDto.facultyId)) {
      throw new BadRequestException(
        `Bộ môn có ID ${createMajorDto.departmentId} không thuộc về khoa có ID ${createMajorDto.facultyId}`,
      );
    }

    // Check if department belongs to the specified school
    if (Number(department.schoolId) !== Number(createMajorDto.schoolId)) {
      throw new BadRequestException(
        `Bộ môn có ID ${createMajorDto.departmentId} không thuộc về trường có ID ${createMajorDto.schoolId}`,
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
    const savedMajor = await this.majorRepository.save(major);
    return this.findOneWithRelations(savedMajor.id);
  }

  async findAll(
    searchDto?: SearchMajorDto,
  ): Promise<MajorResponseDto[] | PaginatedMajorResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      const majors = await this.majorRepository.find({
        relations: ['department', 'faculty', 'school'],
      });
      return majors.map((major) => this.mapToResponseDto(major));
    }

    const {
      name,
      code,
      description,
      schoolId,
      facultyId,
      departmentId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder = this.majorRepository
      .createQueryBuilder('major')
      .leftJoinAndSelect('major.department', 'department')
      .leftJoinAndSelect('major.faculty', 'faculty')
      .leftJoinAndSelect('major.school', 'school');

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

    if (schoolId) {
      queryBuilder.andWhere('major.schoolId = :schoolId', { schoolId });
    }

    if (facultyId) {
      queryBuilder.andWhere('major.facultyId = :facultyId', { facultyId });
    }

    if (departmentId) {
      queryBuilder.andWhere('major.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'code',
        'schoolId',
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
        data: data.map((major) => this.mapToResponseDto(major)),
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    }

    const majors = await queryBuilder.getMany();
    return majors.map((major) => this.mapToResponseDto(major));
  }

  async findOne(id: number): Promise<MajorResponseDto> {
    return this.findOneWithRelations(id);
  }

  async findOneWithRelations(id: number): Promise<MajorResponseDto> {
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: ['department', 'faculty', 'school'],
    });

    if (!major) {
      throw new NotFoundException(`Không tìm thấy ngành học có ID ${id}`);
    }

    return this.mapToResponseDto(major);
  }

  async update(id: number, updateMajorDto: UpdateMajorDto): Promise<MajorResponseDto> {
    const major = await this.majorRepository.findOne({ where: { id } });

    if (!major) {
      throw new NotFoundException(`Không tìm thấy ngành học có ID ${id}`);
    }

    // Check if school exists if schoolId is being updated
    if (updateMajorDto.schoolId) {
      const school = await this.schoolRepository.findOne({
        where: { id: updateMajorDto.schoolId },
      });
      if (!school) {
        throw new NotFoundException(
          `Không tìm thấy trường có ID ${updateMajorDto.schoolId}`,
        );
      }
    }

    // Check if faculty exists if facultyId is being updated
    if (updateMajorDto.facultyId) {
      const faculty = await this.facultyRepository.findOne({
        where: { id: updateMajorDto.facultyId },
      });
      if (!faculty) {
        throw new NotFoundException(
          `Không tìm thấy khoa có ID ${updateMajorDto.facultyId}`,
        );
      }
    }

    // Check if department exists if departmentId is being updated
    if (updateMajorDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateMajorDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Không tìm thấy bộ môn có ID ${updateMajorDto.departmentId}`,
        );
      }
    }

    // Validation logic for relationships
    const targetSchoolId = updateMajorDto.schoolId || major.schoolId;
    const targetFacultyId = updateMajorDto.facultyId || major.facultyId;
    const targetDepartmentId = updateMajorDto.departmentId || major.departmentId;

    // Check if faculty belongs to school
    if (updateMajorDto.facultyId || updateMajorDto.schoolId) {
      const faculty = await this.facultyRepository.findOne({
        where: { id: targetFacultyId },
      });
      if (faculty && Number(faculty.schoolId) !== Number(targetSchoolId)) {
        throw new BadRequestException(
          `Khoa có ID ${targetFacultyId} không thuộc về trường có ID ${targetSchoolId}`,
        );
      }
    }

    // Check if department belongs to faculty
    if (updateMajorDto.departmentId || updateMajorDto.facultyId) {
      const department = await this.departmentRepository.findOne({
        where: { id: targetDepartmentId },
      });
      if (department && Number(department.facultyId) !== Number(targetFacultyId)) {
        throw new BadRequestException(
          `Bộ môn có ID ${targetDepartmentId} không thuộc về khoa có ID ${targetFacultyId}`,
        );
      }
    }

    // Check if department belongs to school
    if (updateMajorDto.departmentId || updateMajorDto.schoolId) {
      const department = await this.departmentRepository.findOne({
        where: { id: targetDepartmentId },
      });
      if (department && Number(department.schoolId) !== Number(targetSchoolId)) {
        throw new BadRequestException(
          `Bộ môn có ID ${targetDepartmentId} không thuộc về trường có ID ${targetSchoolId}`,
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
    const updatedMajor = await this.majorRepository.save(major);
    return this.findOneWithRelations(updatedMajor.id);
  }

  async remove(id: number): Promise<MajorResponseDto> {
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: ['department', 'faculty', 'school'],
    });

    if (!major) {
      throw new NotFoundException(`Không tìm thấy ngành học có ID ${id}`);
    }

    await this.majorRepository.remove(major);
    return this.mapToResponseDto(major);
  }

  private mapToResponseDto(major: Major): MajorResponseDto {
    return {
      id: major.id,
      code: major.code,
      name: major.name,
      description: major.description,
      departmentId: major.departmentId,
      facultyId: major.facultyId,
      schoolId: major.schoolId,
      department: major.department
        ? {
            id: major.department.id,
            code: major.department.code,
            name: major.department.name,
            description: major.department.description,
            facultyId: major.department.facultyId,
            schoolId: major.department.schoolId,
          }
        : null,
      faculty: major.faculty
        ? {
            id: major.faculty.id,
            code: major.faculty.code,
            name: major.faculty.name,
            description: major.faculty.description,
            schoolId: major.faculty.schoolId,
          }
        : null,
      school: major.school
        ? {
            id: major.school.id,
            code: major.school.code,
            name: major.school.name,
            description: major.school.description,
            address: major.school.address,
          }
        : null,
      createdAt: major.createdAt,
      updatedAt: major.updatedAt,
    };
  }
}

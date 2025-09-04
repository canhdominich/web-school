/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './faculty.entity';
import { School } from '../school/school.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { SearchFacultyDto } from './dto/search-faculty.dto';
import { PaginatedFacultyResponseDto, FacultyResponseDto } from './dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async create(
    createFacultyDto: CreateFacultyDto,
  ): Promise<FacultyResponseDto> {
    // Check if faculty code already exists
    const existingFaculty = await this.facultyRepository.findOne({
      where: { code: createFacultyDto.code },
    });
    if (existingFaculty) {
      throw new ConflictException('Mã khoa đã tồn tại');
    }

    // Check if school exists
    const school = await this.schoolRepository.findOne({
      where: { id: createFacultyDto.schoolId },
    });
    if (!school) {
      throw new BadRequestException('Trường không tồn tại');
    }

    const faculty = this.facultyRepository.create(createFacultyDto);
    const savedFaculty = await this.facultyRepository.save(faculty);
    return this.findOneWithSchool(savedFaculty.id);
  }

  async findAll(
    searchDto?: SearchFacultyDto,
  ): Promise<FacultyResponseDto[] | PaginatedFacultyResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      const faculties = await this.facultyRepository.find({
        relations: ['school'],
      });
      return faculties.map((faculty) => this.mapToResponseDto(faculty));
    }

    const {
      name,
      code,
      description,
      schoolId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder = this.facultyRepository
      .createQueryBuilder('faculty')
      .leftJoinAndSelect('faculty.school', 'school');

    if (name) {
      queryBuilder.andWhere('faculty.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('faculty.code LIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('faculty.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (schoolId) {
      queryBuilder.andWhere('faculty.schoolId = :schoolId', { schoolId });
    }

    if (sortBy) {
      const allowedSortFields = [
        'id',
        'name',
        'code',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`faculty.${sortField}`, order);
    } else {
      queryBuilder.orderBy('faculty.createdAt', 'DESC');
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
        data: data.map((faculty) => this.mapToResponseDto(faculty)),
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    }

    const faculties = await queryBuilder.getMany();
    return faculties.map((faculty) => this.mapToResponseDto(faculty));
  }

  async findOne(id: number): Promise<FacultyResponseDto> {
    return this.findOneWithSchool(id);
  }

  async findOneWithSchool(id: number): Promise<FacultyResponseDto> {
    const faculty = await this.facultyRepository.findOne({
      where: { id },
      relations: ['school'],
    });

    if (!faculty) {
      throw new NotFoundException(`Không tìm thấy khoa có ID ${id}`);
    }

    return this.mapToResponseDto(faculty);
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<FacultyResponseDto> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });

    if (!faculty) {
      throw new NotFoundException(`Không tìm thấy khoa có ID ${id}`);
    }

    // Check if faculty code already exists (if code is being updated)
    if (updateFacultyDto.code && updateFacultyDto.code !== faculty.code) {
      const existingFaculty = await this.facultyRepository.findOne({
        where: { code: updateFacultyDto.code },
      });
      if (existingFaculty) {
        throw new ConflictException('Mã khoa đã tồn tại');
      }
    }

    // Check if school exists (if schoolId is being updated)
    if (updateFacultyDto.schoolId) {
      const school = await this.schoolRepository.findOne({
        where: { id: updateFacultyDto.schoolId },
      });
      if (!school) {
        throw new BadRequestException('Trường không tồn tại');
      }
    }

    Object.assign(faculty, updateFacultyDto);
    const updatedFaculty = await this.facultyRepository.save(faculty);
    return this.findOneWithSchool(updatedFaculty.id);
  }

  async remove(id: number): Promise<FacultyResponseDto> {
    const faculty = await this.facultyRepository.findOne({
      where: { id },
      relations: ['school'],
    });

    if (!faculty) {
      throw new NotFoundException(`Không tìm thấy khoa có ID ${id}`);
    }

    await this.facultyRepository.remove(faculty);
    return this.mapToResponseDto(faculty);
  }

  private mapToResponseDto(faculty: Faculty): FacultyResponseDto {
    return {
      id: faculty.id,
      code: faculty.code,
      name: faculty.name,
      description: faculty.description,
      schoolId: faculty.schoolId,
      school: faculty.school
        ? {
            id: faculty.school.id,
            code: faculty.school.code,
            name: faculty.school.name,
            description: faculty.school.description,
            address: faculty.school.address,
          }
        : null,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './faculty.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { SearchFacultyDto } from './dto/search-faculty.dto';
import { PaginatedFacultyResponseDto } from './dto/paginated-faculty-response.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    // Check if faculty code already exists
    const existingFaculty = await this.facultyRepository.findOne({
      where: { code: createFacultyDto.code },
    });
    if (existingFaculty) {
      throw new ConflictException('Mã khoa đã tồn tại');
    }

    const faculty = this.facultyRepository.create(createFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async findAll(
    searchDto?: SearchFacultyDto,
  ): Promise<Faculty[] | PaginatedFacultyResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      return this.facultyRepository.find();
    }

    const { name, code, description, page, limit, sortBy, sortOrder } =
      searchDto;

    const queryBuilder = this.facultyRepository.createQueryBuilder('faculty');

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

  async findOne(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });

    if (!faculty) {
      throw new NotFoundException(`Không tìm thấy khoa có ID ${id}`);
    }

    return faculty;
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
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

    Object.assign(faculty, updateFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async remove(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });

    if (!faculty) {
      throw new NotFoundException(`Không tìm thấy khoa có ID ${id}`);
    }

    await this.facultyRepository.remove(faculty);
    return faculty;
  }
}

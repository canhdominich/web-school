import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SearchSchoolDto } from './dto/search-school.dto';
import { PaginatedSchoolResponseDto } from './dto/paginated-school-response.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    // Check if school code already exists
    const existingSchool = await this.schoolRepository.findOne({
      where: { code: createSchoolDto.code },
    });
    if (existingSchool) {
      throw new ConflictException('Mã trường đã tồn tại');
    }

    const school = this.schoolRepository.create(createSchoolDto);
    return this.schoolRepository.save(school);
  }

  async findAll(
    searchDto?: SearchSchoolDto,
  ): Promise<School[] | PaginatedSchoolResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      return this.schoolRepository.find();
    }

    const { name, code, description, address, page, limit, sortBy, sortOrder } =
      searchDto;

    const queryBuilder = this.schoolRepository.createQueryBuilder('school');

    if (name) {
      queryBuilder.andWhere('school.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('school.code LIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('school.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (address) {
      queryBuilder.andWhere('school.address LIKE :address', {
        address: `%${address}%`,
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
      queryBuilder.orderBy(`school.${sortField}`, order);
    } else {
      queryBuilder.orderBy('school.createdAt', 'DESC');
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

  async findOne(id: number): Promise<School> {
    const school = await this.schoolRepository.findOne({ where: { id } });

    if (!school) {
      throw new NotFoundException(`Không tìm thấy trường có ID ${id}`);
    }

    return school;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const school = await this.schoolRepository.findOne({ where: { id } });

    if (!school) {
      throw new NotFoundException(`Không tìm thấy trường có ID ${id}`);
    }

    // Check if school code already exists (if code is being updated)
    if (updateSchoolDto.code && updateSchoolDto.code !== school.code) {
      const existingSchool = await this.schoolRepository.findOne({
        where: { code: updateSchoolDto.code },
      });
      if (existingSchool) {
        throw new ConflictException('Mã trường đã tồn tại');
      }
    }

    Object.assign(school, updateSchoolDto);
    return this.schoolRepository.save(school);
  }

  async remove(id: number): Promise<School> {
    const school = await this.schoolRepository.findOne({ where: { id } });

    if (!school) {
      throw new NotFoundException(`Không tìm thấy trường có ID ${id}`);
    }

    await this.schoolRepository.remove(school);
    return school;
  }
}

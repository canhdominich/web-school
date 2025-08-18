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

  async findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find();
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

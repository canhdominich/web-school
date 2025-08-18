import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
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

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['faculty'],
    });
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

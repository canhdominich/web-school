import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from './project-member.entity';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async create(
    createProjectMemberDto: CreateProjectMemberDto,
  ): Promise<ProjectMember> {
    const existing = await this.projectMemberRepository.findOne({
      where: {
        projectId: createProjectMemberDto.projectId,
        studentId: createProjectMemberDto.studentId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Student is already a member of this project',
      );
    }

    const entity = this.projectMemberRepository.create(createProjectMemberDto);
    return await this.projectMemberRepository.save(entity);
  }

  async findAll(): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      relations: ['project', 'student'],
    });
  }

  async findOne(id: number): Promise<ProjectMember> {
    const entity = await this.projectMemberRepository.findOne({
      where: { id },
      relations: ['project', 'student'],
    });
    if (!entity) {
      throw new NotFoundException(`Project member with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    id: number,
    updateProjectMemberDto: UpdateProjectMemberDto,
  ): Promise<ProjectMember> {
    const entity = await this.projectMemberRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Project member with ID ${id} not found`);
    }

    Object.assign(entity, updateProjectMemberDto);
    return await this.projectMemberRepository.save(entity);
  }

  async remove(id: number): Promise<ProjectMember> {
    const entity = await this.projectMemberRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Project member with ID ${id} not found`);
    }
    await this.projectMemberRepository.remove(entity);
    return entity;
  }

  async findByProject(projectId: number): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      where: { projectId },
      relations: ['student'],
    });
  }

  async findByStudent(studentId: number): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      where: { studentId },
      relations: ['project'],
    });
  }

  async removeByProjectAndStudent(
    projectId: number,
    studentId: number,
  ): Promise<ProjectMember> {
    const entity = await this.projectMemberRepository.findOne({
      where: { projectId, studentId },
    });
    if (!entity) {
      throw new NotFoundException('Project member not found');
    }
    await this.projectMemberRepository.remove(entity);
    return entity;
  }
}

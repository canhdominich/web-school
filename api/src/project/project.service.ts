import {
  Injectable,
  NotFoundException,
  ConflictException,
  Optional,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from './project.entity';
import { ProjectMilestoneService } from '../project-milestone/project-milestone.service';
import { ProjectMember } from './project-member.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @Optional()
    private readonly projectMilestoneService?: ProjectMilestoneService,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository?: Repository<ProjectMember>,
    @InjectRepository(User)
    private readonly userRepository?: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Check if project code already exists
    const existingProject = await this.projectRepository.findOne({
      where: { code: createProjectDto.code },
    });
    if (existingProject) {
      throw new ConflictException('Mã dự án đã tồn tại');
    }

    // Check if all students exist
    if (createProjectDto.members && createProjectDto.members.length > 0) {
      const studentIds = createProjectDto.members.map((m) => m.studentId);
      const students = await this.userRepository!.find({
        where: { id: In(studentIds) },
      });
      console.log('students =', students);
      const foundIds = new Set(students.map((s) => +s.id));
      const missing = studentIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new BadRequestException(
          `Một số sinh viên không được tìm thấy: ${missing.join(', ')}`,
        );
      }
    }

    const result = await this.projectRepository.manager.transaction(
      async (manager) => {
        const projectRepo = manager.getRepository(Project);
        const projectMemberRepo = manager.getRepository(ProjectMember);

        const project = projectRepo.create({
          ...createProjectDto,
          members: undefined, // Remove members from project entity
        });
        const savedProject = await projectRepo.save(project);

        // Create project members
        if (createProjectDto.members && createProjectDto.members.length > 0) {
          const projectMembers = createProjectDto.members.map((member) =>
            projectMemberRepo.create({
              projectId: savedProject.id,
              studentId: member.studentId,
              roleInTeam: member.roleInTeam,
            }),
          );
          await projectMemberRepo.save(projectMembers);
        }

        return savedProject;
      },
    );

    return result;
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: [
        'faculty',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
      ],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'faculty',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
      ],
    });

    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án có ID ${id}`);
    }

    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    console.log('updateProjectDto =', updateProjectDto);
    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án có ID ${id}`);
    }

    // Check if project code already exists (if code is being updated)
    if (updateProjectDto.code && updateProjectDto.code !== project.code) {
      const existingProject = await this.projectRepository.findOne({
        where: { code: updateProjectDto.code },
      });
      if (existingProject) {
        throw new ConflictException('Mã dự án đã tồn tại');
      }
    }

    const result = await this.projectRepository.manager.transaction(
      async (manager) => {
        const projectRepo = manager.getRepository(Project);
        const projectMemberRepo = manager.getRepository(ProjectMember);

        const { members, ...rest } = updateProjectDto;
        Object.assign(project, rest);

        const savedProject = await projectRepo.save(project);

        // Update project members if members is provided
        if (members) {
          // Remove existing members
          await projectMemberRepo.delete({ projectId: +savedProject.id });

          // Add new members
          if (members.length > 0) {
            const projectMembers = members.map((member) =>
              projectMemberRepo.create({
                projectId: +savedProject.id,
                studentId: +member.studentId,
                roleInTeam: member.roleInTeam,
              }),
            );
            await projectMemberRepo.save(projectMembers);
          }
        }

        return savedProject;
      },
    );

    return result;
  }

  async remove(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án có ID ${id}`);
    }

    await this.projectRepository.remove(project);
    return project;
  }

  async findByFaculty(facultyId: number): Promise<Project[]> {
    return this.projectRepository.find({
      where: { facultyId },
      relations: [
        'faculty',
        'department',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
      ],
    });
  }

  async findByDepartment(departmentId: number): Promise<Project[]> {
    return this.projectRepository.find({
      where: { departmentId },
      relations: [
        'faculty',
        'department',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
      ],
    });
  }

  async findBySupervisor(supervisorId: number): Promise<Project[]> {
    return this.projectRepository.find({
      where: { supervisorId },
      relations: [
        'faculty',
        'department',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
      ],
    });
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.projectRepository.find({
      where: { status },
      relations: [
        'faculty',
        'department',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
      ],
    });
  }
}

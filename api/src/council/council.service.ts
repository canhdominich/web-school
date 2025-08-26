import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Council } from './council.entity';
import { CouncilMember } from './council-member.entity';
import { CreateCouncilDto, UpdateCouncilDto, CouncilStatus } from './dto';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { UserRole as UserRoleEntity } from '../userRole/userRole.entity';
import { UserRole as UserRoleEnum } from '../constants/user.constant';
import { Project } from '../project/project.entity';
import { CouncilProject } from './council-project.entity';
import { CouncilGrade } from './council-grade.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CouncilService {
  constructor(
    @InjectRepository(Council)
    private readonly councilRepository: Repository<Council>,
    @InjectRepository(CouncilMember)
    private readonly councilMemberRepository: Repository<CouncilMember>,
    @InjectRepository(CouncilProject)
    private readonly councilProjectRepository: Repository<CouncilProject>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(CouncilGrade)
    private readonly councilGradeRepository: Repository<CouncilGrade>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Validate that all member IDs are valid lecturers
   */
  private async validateMembers(memberIds: number[]): Promise<User[]> {
    if (!memberIds || memberIds.length === 0) {
      throw new BadRequestException('Danh sách thành viên không được để trống');
    }

    // Get lecturer role
    const lecturerRole = await this.roleRepository.findOne({
      where: { name: UserRoleEnum.Lecturer },
    });

    if (!lecturerRole) {
      throw new BadRequestException('Không tìm thấy vai trò giảng viên');
    }

    // Get all users with their roles
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.id IN (:...memberIds)', { memberIds })
      .getMany();

    if (users.length !== memberIds.length) {
      const foundIds = users.map((u) => u.id);
      const missingIds = memberIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Không tìm thấy người dùng có ID: ${missingIds.join(', ')}`,
      );
    }

    // Validate that all users are lecturers
    const nonLecturers = users.filter(
      (user) =>
        !user.userRoles.some((ur) => ur.role.name === UserRoleEnum.Lecturer),
    );

    if (nonLecturers.length > 0) {
      const names = nonLecturers.map((u) => u.name).join(', ');
      throw new BadRequestException(
        `Các người dùng sau không phải là giảng viên: ${names}`,
      );
    }

    return users;
  }

  async create(createCouncilDto: CreateCouncilDto): Promise<Council> {
    // Check if council name already exists
    const existingCouncil = await this.councilRepository.findOne({
      where: { name: createCouncilDto.name },
    });

    if (existingCouncil) {
      throw new ConflictException('Tên hội đồng đã tồn tại');
    }

    // Validate members
    const members = await this.validateMembers(createCouncilDto.memberIds);

    const council = this.councilRepository.create({
      name: createCouncilDto.name,
      description: createCouncilDto.description,
      status: createCouncilDto.status || CouncilStatus.Active,
      facultyId: createCouncilDto.facultyId,
    });

    const savedCouncil = await this.councilRepository.save(council);

    // Create council members
    const councilMembers = members.map((member) =>
      this.councilMemberRepository.create({
        councilId: savedCouncil.id,
        userId: member.id,
      }),
    );

    await this.councilMemberRepository.save(councilMembers);

    return this.findOne(savedCouncil.id);
  }

  async findAll(): Promise<Council[]> {
    return this.councilRepository.find({
      relations: ['councilMembers', 'councilMembers.user', 'faculty'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id },
      relations: ['councilMembers', 'councilMembers.user', 'faculty'],
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${id}`);
    }

    return council;
  }

  async update(
    id: number,
    updateCouncilDto: UpdateCouncilDto,
  ): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${id}`);
    }

    // Check if new name conflicts with existing councils
    if (updateCouncilDto.name && updateCouncilDto.name !== council.name) {
      const existingCouncil = await this.councilRepository.findOne({
        where: { name: updateCouncilDto.name },
      });

      if (existingCouncil) {
        throw new ConflictException('Tên hội đồng đã tồn tại');
      }
    }

    // Update other fields
    if (updateCouncilDto.name) {
      council.name = updateCouncilDto.name;
    }
    if (updateCouncilDto.description !== undefined) {
      council.description = updateCouncilDto.description;
    }
    if (updateCouncilDto.status) {
      council.status = updateCouncilDto.status;
    }
    if (updateCouncilDto.facultyId !== undefined) {
      council.facultyId = updateCouncilDto.facultyId;
    }

    await this.councilRepository.save(council);

    // Update members if provided
    if (updateCouncilDto.memberIds) {
      const members = await this.validateMembers(updateCouncilDto.memberIds);

      // Remove existing members
      await this.councilMemberRepository.delete({ councilId: id });

      // Add new members
      const councilMembers = members.map((member) =>
        this.councilMemberRepository.create({
          councilId: id,
          userId: member.id,
        }),
      );

      await this.councilMemberRepository.save(councilMembers);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const council = await this.councilRepository.findOne({
      where: { id },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${id}`);
    }

    await this.councilRepository.remove(council);
  }

  /**
   * Get councils by status
   */
  async findByStatus(status: CouncilStatus): Promise<Council[]> {
    return this.councilRepository.find({
      where: { status },
      relations: ['councilMembers', 'councilMembers.user', 'faculty'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get councils by member ID
   */
  async findByMemberId(memberId: number): Promise<Council[]> {
    return this.councilRepository
      .createQueryBuilder('council')
      .leftJoinAndSelect('council.councilMembers', 'councilMember')
      .leftJoinAndSelect('councilMember.user', 'user')
      .leftJoinAndSelect('council.faculty', 'faculty')
      .where('councilMember.userId = :memberId', { memberId })
      .orderBy('council.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Add members to council
   */
  async addMembers(councilId: number, memberIds: number[]): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    const newMembers = await this.validateMembers(memberIds);

    // Check existing members
    const existingMembers = await this.councilMemberRepository.find({
      where: { councilId },
    });
    const existingMemberIds = existingMembers.map((m) => m.userId);

    const membersToAdd = newMembers.filter(
      (m) => !existingMemberIds.includes(m.id),
    );

    if (membersToAdd.length === 0) {
      throw new BadRequestException('Tất cả thành viên đã có trong hội đồng');
    }

    // Add new members
    const councilMembers = membersToAdd.map((member) =>
      this.councilMemberRepository.create({
        councilId,
        userId: member.id,
      }),
    );

    await this.councilMemberRepository.save(councilMembers);

    return this.findOne(councilId);
  }

  /**
   * Remove members from council
   */
  async removeMembers(
    councilId: number,
    memberIds: number[],
  ): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    // Check remaining members after removal
    const existingMembers = await this.councilMemberRepository.find({
      where: { councilId },
    });

    const remainingMembers = existingMembers.filter(
      (m) => !memberIds.includes(m.userId),
    );

    if (remainingMembers.length === 0) {
      throw new BadRequestException('Hội đồng phải có ít nhất một thành viên');
    }

    // Remove specified members
    await this.councilMemberRepository.delete({
      councilId,
      userId: In(memberIds),
    });

    return this.findOne(councilId);
  }

  /**
   * Assign multiple projects to a council
   */
  async addProjects(councilId: number, projectIds: number[]): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });
    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    if (!projectIds || projectIds.length === 0) {
      throw new BadRequestException('Danh sách dự án không được để trống');
    }

    const projects = await this.projectRepository.find({
      where: { id: In(projectIds) },
    });
    const foundIds = new Set(projects.map((p) => Number(p.id)));
    const missing = projectIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Không tìm thấy dự án có ID: ${missing.join(', ')}`,
      );
    }

    // Validate projects belong to the same faculty as council
    if (council.facultyId) {
      const invalid = projects.filter(
        (p) => Number(p.facultyId) !== Number(council.facultyId),
      );
      if (invalid.length > 0) {
        const invalidCodes = invalid.map((p) => p.code || p.id).join(', ');
        throw new BadRequestException(
          `Các dự án không thuộc cùng khoa với hội đồng (facultyId=${council.facultyId}): ${invalidCodes}`,
        );
      }
    }

    const existing = await this.councilProjectRepository.find({
      where: { councilId },
    });
    const existingProjectIds = new Set(existing.map((cp) => cp.projectId));
    const toCreate = projectIds.filter((id) => !existingProjectIds.has(id));

    if (toCreate.length === 0) {
      throw new BadRequestException(
        'Tất cả dự án đã được gán cho hội đồng này',
      );
    }

    const rows = toCreate.map((projectId) =>
      this.councilProjectRepository.create({ councilId, projectId }),
    );
    await this.councilProjectRepository.save(rows);

    return this.findOne(councilId);
  }

  /**
   * Unassign multiple projects from a council
   */
  async removeProjects(
    councilId: number,
    projectIds: number[],
  ): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });
    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    if (!projectIds || projectIds.length === 0) {
      throw new BadRequestException('Danh sách dự án không được để trống');
    }

    await this.councilProjectRepository.delete({
      councilId,
      projectId: In(projectIds),
    });
    return this.findOne(councilId);
  }

  /**
   * Get all projects assigned to a council
   */
  async getProjects(councilId: number): Promise<Project[]> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });
    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    const rows = await this.councilProjectRepository.find({
      where: { councilId },
      relations: ['project'],
    });
    return rows.map((r) => r.project);
  }

  /**
   * Lecturer in council grades a project
   */
  async gradeProject(
    councilId: number,
    projectId: number,
    score: number,
    comment?: string,
    lecturerId?: number,
  ) {
    // Validate project status is IN_PROGRESS before grading
    const project = await this.projectRepository.findOne({
      where: { id: projectId as any },
    });
    if (project) {
      // Import types lazily to avoid circular dependencies at top-level
      const { ProjectStatus } = await import('../project/project.entity');
      const { getProjectStatusLabel } = await import(
        '../project/project.utils'
      );
      if (
        ![ProjectStatus.APPROVED, ProjectStatus.IN_PROGRESS].includes(
          project.status,
        )
      ) {
        const label = getProjectStatusLabel(project.status);
        throw new BadRequestException(
          `Không thể thực hiện chấm điểm khi dự án đang ở trạng thái ${label}`,
        );
      }
    }

    if (score == null || isNaN(Number(score)) || score < 0 || score > 10) {
      throw new BadRequestException('Điểm phải trong khoảng 0-10');
    }

    // Ensure council and project relation exists
    const mapping = await this.councilProjectRepository.findOne({
      where: { councilId, projectId },
    });
    if (!mapping) {
      throw new BadRequestException('Hội đồng chưa được gán cho dự án này');
    }

    // Ensure lecturer is member of council
    if (!lecturerId) {
      throw new BadRequestException('Thiếu lecturerId');
    }
    const cm = await this.councilMemberRepository.findOne({
      where: { councilId, userId: Number(lecturerId) },
    });
    if (!cm) {
      throw new BadRequestException('Giảng viên không thuộc hội đồng này');
    }

    // Upsert grade
    let grade = await this.councilGradeRepository.findOne({
      where: { councilId, projectId, lecturerId },
    });
    if (!grade) {
      grade = this.councilGradeRepository.create({
        councilId,
        projectId,
        lecturerId,
        score,
        comment: comment ?? null,
      });
    } else {
      grade.score = score;
      grade.comment = comment ?? null;
    }
    await this.councilGradeRepository.save(grade);

    // Recompute average score and store on project
    const allGrades = await this.councilGradeRepository.find({
      where: { projectId },
    });
    const avg =
      allGrades.length > 0
        ? Number(
            (
              allGrades.reduce((s, g) => s + Number(g.score), 0) /
              allGrades.length
            ).toFixed(2),
          )
        : null;
    await this.projectRepository.update(
      { id: projectId as any },
      { averageScore: avg as any },
    );

    // Notify project members about the new average score
    try {
      const proj = await this.projectRepository.findOne({
        where: { id: projectId as any },
        relations: ['members'],
      });
      if (proj && proj.members && proj.members.length > 0) {
        const notifications = proj.members.map((m) => ({
          title: 'Cập nhật điểm trung bình dự án',
          body:
            avg == null
              ? `Dự án của bạn hiện chưa có điểm trung bình`
              : `Điểm trung bình mới của dự án là ${avg}`,
          userId: m.studentId,
        }));
        await Promise.all(
          notifications.map((n) => this.notificationService.create(n)),
        );
      }
    } catch (e) {
      // fail-soft: logging only
      console.error('Error sending average score notifications:', e);
    }

    return { success: true, averageScore: avg };
  }

  async listGrades(councilId: number, projectId: number) {
    const rows = await this.councilGradeRepository.find({
      where: { councilId, projectId },
      relations: ['lecturer'],
    });
    return rows.map((r) => ({
      id: r.id,
      lecturerId: r.lecturerId,
      lecturerName: r.lecturer?.name || 'Unknown',
      score: Number(r.score),
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findCouncilsForProjectGrading(projectId: number) {
    // Find councils that have been assigned to this project
    const councilProjects = await this.councilProjectRepository.find({
      where: { projectId },
      relations: ['council'],
    });

    // Get council IDs
    const councilIds = councilProjects
      .filter((cp) => cp.council)
      .map((cp) => cp.council.id);

    if (councilIds.length === 0) {
      return [];
    }

    // Load councils with proper relations
    return this.councilRepository.find({
      where: { id: In(councilIds) },
      relations: ['councilMembers', 'councilMembers.user', 'faculty'],
    });
  }
}

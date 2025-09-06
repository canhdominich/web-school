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
import {
  CreateProjectDto,
  UpdateProjectDto,
  SearchProjectDto,
  PaginatedProjectResponseDto,
} from './dto';
import { ProjectStatus } from './project.entity';
import { ProjectMilestoneService } from '../project-milestone/project-milestone.service';
import { ProjectMember } from './project-member.entity';
import { User } from '../user/user.entity';
import {
  ProjectMilestone,
  ProjectMilestoneStatus,
} from '../project-milestone/project-milestone.entity';
import {
  TermMilestone,
  TermMilestoneStatus,
} from '../term-milestone/term-milestone.entity';
import { NotificationService } from '../notification/notification.service';
import { UserRole } from 'src/constants/user.constant';
import { RequestUser } from 'src/interfaces';
import { Term, TermStatus } from 'src/term/term.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly notificationService: NotificationService,
    @Optional()
    private readonly projectMilestoneService?: ProjectMilestoneService,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository?: Repository<ProjectMember>,
    @InjectRepository(User)
    private readonly userRepository?: Repository<User>,
    @InjectRepository(Term)
    private readonly termRepository?: Repository<Term>,
  ) {}

  private validateProject(
    createOrUpdateProjectDto: CreateProjectDto | UpdateProjectDto,
  ): void {
    if (!createOrUpdateProjectDto.termId) {
      throw new BadRequestException('Vui lòng chọn tiến độ');
    }

    if (!createOrUpdateProjectDto.facultyId) {
      throw new BadRequestException('Vui lòng chọn khoa');
    }

    if (!createOrUpdateProjectDto.departmentId) {
      throw new BadRequestException('Vui lòng chọn bộ môn');
    }

    if (!createOrUpdateProjectDto.majorId) {
      throw new BadRequestException('Vui lòng chọn ngành');
    }

    if (!createOrUpdateProjectDto.supervisorId) {
      throw new BadRequestException('Vui lòng chọn giảng viên hướng dẫn');
    }

    if (!createOrUpdateProjectDto.termId) {
      throw new BadRequestException('Vui lòng chọn tiến độ');
    }
  }
  /**
   * Create a new project with notifications
   * - Notifies supervisor about new project assignment
   * - Notifies all members about being added to the project
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    this.validateProject(createProjectDto);

    // Check if project code already exists
    const existingProject = await this.projectRepository.findOne({
      where: { code: createProjectDto.code },
    });
    if (existingProject) {
      throw new ConflictException('Mã đề tài đã tồn tại');
    }

    // Check if all students exist
    if (createProjectDto.members && createProjectDto.members.length > 0) {
      const studentIds = createProjectDto.members.map((m) => m.studentId);
      const students = await this.userRepository!.find({
        where: { id: In(studentIds) },
      });
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
        const termRepo = manager.getRepository(Term);

        const term = await termRepo.findOne({
          where: { id: createProjectDto.termId },
        });
        if (!term) {
          throw new BadRequestException('Tiến độ không được tìm thấy');
        }

        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const startDate = new Date(`${term.startDate}T00:00:00`);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const endDate = new Date(`${term.endDate}T23:59:59`);

        if (startDate > now || endDate < now) {
          throw new BadRequestException(
            'Không thể đăng ký đề tài ngoài thời gian tiến độ',
          );
        } else if (term.status === TermStatus.CLOSED) {
          throw new BadRequestException(
            'Không thể đăng ký đề tài trong tiến độ đã đóng',
          );
        }

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

        // Copy term milestones to project milestones
        const tmRepo = manager.getRepository(TermMilestone);
        const pmRepo = manager.getRepository(ProjectMilestone);
        const termMilestones = await tmRepo.find({
          where: { termId: createProjectDto.termId },
          order: { orderIndex: 'ASC' },
        });
        if (termMilestones.length > 0) {
          const projectMilestones = termMilestones.map((tm) =>
            pmRepo.create({
              projectId: savedProject.id,
              title: tm.title,
              dueDate: tm.dueDate as unknown as Date,
              description: tm.description ?? null,
              orderIndex: tm.orderIndex ?? 0,
              isRequired: tm.isRequired ?? false,
              status:
                tm.status === TermMilestoneStatus.INACTIVE
                  ? ProjectMilestoneStatus.INACTIVE
                  : ProjectMilestoneStatus.ACTIVE,
            }),
          );
          await pmRepo.save(projectMilestones);
        }

        // Reload project with relations including milestones
        const savedWithRelations = await projectRepo.findOne({
          where: { id: savedProject.id },
          relations: [
            'faculty',
            'department',
            'major',
            'term',
            'createdByUser',
            'supervisorUser',
            'members',
            'members.student',
            'projectMilestones',
          ],
        });

        return savedWithRelations!;
      },
    );

    // Create notifications for project members and supervisor
    await this.createNotificationsForProject(result, createProjectDto);

    return result;
  }

  private async createNotificationsForProject(
    project: Project,
    createProjectDto: CreateProjectDto,
  ): Promise<void> {
    try {
      // Notification for supervisor
      if (project.supervisorUser) {
        await this.notificationService.create({
          title: 'Đề tài mới được giao',
          body: `Bạn đã được yêu cầu làm giảng viên hướng dẫn cho đề tài "${project.title}" (${project.code})`,
          userId: project.supervisorUser.id,
        });
      }

      // Notifications for project members
      if (createProjectDto.members && createProjectDto.members.length > 0) {
        const memberNotifications = createProjectDto.members.map((member) => ({
          title: 'Bạn đã được thêm vào đề tài mới',
          body: `Bạn đã được thêm vào đề tài "${project.title}" (${project.code}) với vai trò ${member.roleInTeam}`,
          userId: member.studentId,
        }));

        // Create notifications in parallel
        await Promise.all(
          memberNotifications.map((notification) =>
            this.notificationService.create(notification),
          ),
        );
      }
    } catch (error) {
      // Log error but don't fail the project creation
      console.error('Error creating notifications for project:', error);
    }
  }

  private testRoleComparison(
    existingRole: string,
    newRole: string,
    userId: number,
  ): boolean {
    console.log(`🧪 TEST Role Comparison for User ${userId}:`);
    const hasChange = existingRole !== newRole;
    console.log(`  - Final result: ${hasChange}`);
    return hasChange;
  }

  /**
   * Compare two member arrays to detect actual changes
   * Returns true if there are actual changes, false otherwise
   */
  private hasMemberChanges(
    oldMembers: ProjectMember[],
    newMembers: Array<{ studentId: number; roleInTeam: string }>,
  ): boolean {
    console.log('🔍 hasMemberChanges called with:');
    console.log(
      '  - Old members:',
      oldMembers.map((m) => ({ id: m.studentId, role: m.roleInTeam })),
    );
    console.log(
      '  - New members:',
      newMembers.map((m) => ({ id: m.studentId, role: m.roleInTeam })),
    );

    if (oldMembers.length !== newMembers.length) {
      console.log('🔍 Length different - has changes');
      return true;
    }

    // Create maps for comparison
    const oldMemberMap = new Map(
      oldMembers.map((m) => [+m.studentId, m.roleInTeam]),
    );

    const newMemberMap = new Map(
      newMembers.map((m) => [+m.studentId, m.roleInTeam]),
    );

    console.log('🔍 Old member map:', Object.fromEntries(oldMemberMap));
    console.log('🔍 New member map:', Object.fromEntries(newMemberMap));

    // Check if any member is different
    for (const [studentId, newRole] of newMemberMap) {
      const oldRole = oldMemberMap.get(studentId);
      console.log(
        `🔍 Comparing user ${studentId}: old="${oldRole}" vs new="${newRole}"`,
      );
      console.log(
        `  - Old role type: ${typeof oldRole}, length: ${oldRole?.length}`,
      );
      console.log(
        `  - New role type: ${typeof newRole}, length: ${newRole?.length}`,
      );
      console.log(
        `  - Comparison: "${oldRole}" !== "${newRole}" = ${oldRole !== newRole}`,
      );

      if (!oldRole || oldRole !== newRole) {
        console.log(`🔍 Change detected for user ${studentId}`);
        return true;
      }
    }

    console.log('🔍 No changes detected');
    return false;
  }

  private async createMemberChangeNotifications(
    project: Project,
    oldMembers: ProjectMember[],
    newMembers: Array<{ studentId: number; roleInTeam: string }>,
    changes?: {
      membersToRemove: ProjectMember[];
      membersToAdd: Array<{ studentId: number; roleInTeam: string }>;
      membersToUpdate: Array<{ studentId: number; roleInTeam: string }>;
    },
  ): Promise<void> {
    try {
      console.log('📢 createMemberChangeNotifications called with:');
      console.log('  - Project:', project.title, project.code);
      console.log('  - Changes:', changes);

      // Double-check if there are actually any changes
      if (changes) {
        const { membersToRemove, membersToAdd, membersToUpdate } = changes;

        // If no actual changes, don't create any notifications
        if (
          membersToRemove.length === 0 &&
          membersToAdd.length === 0 &&
          membersToUpdate.length === 0
        ) {
          console.log(
            '✅ No actual changes detected - skipping all notifications',
          );
          return;
        }

        console.log('📢 Creating notifications for actual changes:');
        console.log('  - Remove:', membersToRemove.length);
        console.log('  - Add:', membersToAdd.length);
        console.log('  - Update:', membersToUpdate.length);

        // Notifications for removed members
        for (const member of membersToRemove) {
          console.log(
            `📢 Creating removal notification for user ${member.studentId}`,
          );
          await this.notificationService.create({
            title: 'Bạn đã bị loại khỏi đề tài',
            body: `Bạn đã bị loại khỏi đề tài "${project.title}" (${project.code})`,
            userId: member.studentId,
            link: undefined,
          });
          console.log(
            `✅ Removal notification created for user ${member.studentId}`,
          );
        }

        // Notifications for new members
        for (const member of membersToAdd) {
          console.log(
            `📢 Creating addition notification for user ${member.studentId}`,
          );
          await this.notificationService.create({
            title: 'Bạn đã được thêm vào đề tài',
            body: `Bạn đã được thêm vào đề tài "${project.title}" (${project.code}) với vai trò ${member.roleInTeam}`,
            userId: member.studentId,
            link: undefined,
          });
          console.log(
            `✅ Addition notification created for user ${member.studentId}`,
          );
        }

        // Notifications for existing members with role changes
        for (const memberUpdate of membersToUpdate) {
          console.log(
            `🔍 Looking for oldMember for user ${memberUpdate.studentId}...`,
          );
          console.log(
            `🔍 oldMembers:`,
            oldMembers.map((m) => ({ id: m.studentId, role: m.roleInTeam })),
          );
          console.log(`🔍 memberUpdate:`, {
            id: memberUpdate.studentId,
            role: memberUpdate.roleInTeam,
          });
          console.log(
            `🔍 memberUpdate.studentId type:`,
            typeof memberUpdate.studentId,
          );

          const oldMember = oldMembers.find(
            (m) => +m.studentId === memberUpdate.studentId,
          );

          console.log(
            `🔍 oldMember found:`,
            oldMember
              ? { id: oldMember.studentId, role: oldMember.roleInTeam }
              : 'NOT FOUND',
          );
          if (oldMember) {
            console.log(
              `🔍 oldMember.studentId type:`,
              typeof oldMember.studentId,
            );
            console.log(
              `🔍 Comparison: ${oldMember.studentId} === ${memberUpdate.studentId} = ${oldMember.studentId === memberUpdate.studentId}`,
            );
          }

          if (oldMember) {
            console.log(
              `📢 Creating role change notification for user ${memberUpdate.studentId}: "${oldMember.roleInTeam}" -> "${memberUpdate.roleInTeam}"`,
            );
            console.log(
              `📢 About to call notificationService.create for user ${memberUpdate.studentId}`,
            );

            try {
              const notification = await this.notificationService.create({
                title: 'Vai trò của bạn trong đề tài đã thay đổi',
                body: `Vai trò của bạn trong đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldMember.roleInTeam}" thành "${memberUpdate.roleInTeam}"`,
                userId: memberUpdate.studentId,
                link: undefined,
              });
              console.log(
                `✅ Role change notification created successfully for user ${memberUpdate.studentId}, ID: ${notification.id}`,
              );
            } catch (error) {
              console.error(
                `❌ Error creating role change notification for user ${memberUpdate.studentId}:`,
                error,
              );
              throw error;
            }
          } else {
            console.log(
              `❌ oldMember NOT FOUND for user ${memberUpdate.studentId} - skipping notification`,
            );
          }
        }
      } else {
        console.log('📢 Using fallback logic for backward compatibility');
        // Fallback to old logic for backward compatibility
        const oldMemberIds = new Set(oldMembers.map((m) => m.studentId));
        const newMemberIds = new Set(newMembers.map((m) => m.studentId));

        // Notifications for removed members
        const removedMembers = oldMembers.filter(
          (m) => !newMemberIds.has(m.studentId),
        );
        for (const member of removedMembers) {
          await this.notificationService.create({
            title: 'Bạn đã bị loại khỏi đề tài',
            body: `Bạn đã bị loại khỏi đề tài "${project.title}" (${project.code})`,
            userId: member.studentId,
            link: undefined,
          });
        }

        // Notifications for new members
        const addedMembers = newMembers.filter(
          (m) => !oldMemberIds.has(m.studentId),
        );
        for (const member of addedMembers) {
          await this.notificationService.create({
            title: 'Bạn đã được thêm vào đề tài',
            body: `Bạn đã được thêm vào đề tài "${project.title}" (${project.code}) với vai trò ${member.roleInTeam}`,
            userId: member.studentId,
            link: undefined,
          });
        }

        // Notifications for existing members with role changes
        const existingMembers = newMembers.filter((m) =>
          oldMemberIds.has(m.studentId),
        );
        for (const newMember of existingMembers) {
          const oldMember = oldMembers.find(
            (m) => m.studentId === newMember.studentId,
          );
          if (oldMember && oldMember.roleInTeam !== newMember.roleInTeam) {
            await this.notificationService.create({
              title: 'Vai trò của bạn trong đề tài đã thay đổi',
              body: `Vai trò của bạn trong đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldMember.roleInTeam}" thành "${newMember.roleInTeam}"`,
              userId: newMember.studentId,
              link: undefined,
            });
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the project update
      console.error('❌ Error creating member change notifications:', error);
    }
  }

  private async createSupervisorChangeNotification(
    project: Project,
    oldSupervisorId: number,
    newSupervisorId: number,
  ): Promise<void> {
    try {
      // Notification for old supervisor
      await this.notificationService.create({
        title: 'Bạn không còn là giảng viên hướng dẫn',
        body: `Bạn không còn là giảng viên hướng dẫn cho đề tài "${project.title}" (${project.code})`,
        userId: oldSupervisorId,
        link: undefined,
      });

      // Notification for new supervisor
      await this.notificationService.create({
        title: 'Bạn đã được giao làm giảng viên hướng dẫn',
        body: `Bạn đã được giao làm giảng viên hướng dẫn cho đề tài "${project.title}" (${project.code})`,
        userId: newSupervisorId,
        link: undefined,
      });

      // Notification for project members about supervisor change
      const projectMembers = await this.projectMemberRepository!.find({
        where: { projectId: project.id },
      });

      for (const member of projectMembers) {
        await this.notificationService.create({
          title: 'Giảng viên hướng dẫn đề tài đã thay đổi',
          body: `Giảng viên hướng dẫn đề tài "${project.title}" (${project.code}) đã thay đổi`,
          userId: member.studentId,
          link: undefined,
        });
      }
    } catch (error) {
      // Log error but don't fail the project update
      console.error('Error creating supervisor change notification:', error);
    }
  }

  private async createStatusChangeNotification(
    project: Project,
    oldStatus: ProjectStatus,
    newStatus: ProjectStatus,
  ): Promise<void> {
    try {
      // Get status labels for better notification messages
      const statusLabels = {
        draft: 'Nháp',
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        in_progress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        cancelled: 'Hủy',
      };

      console.log('project = ', project);

      const oldStatusLabel = statusLabels[oldStatus] || oldStatus;
      const newStatusLabel = statusLabels[newStatus] || newStatus;

      // Notification for supervisor about status change
      if (project.supervisorUser) {
        await this.notificationService.create({
          title: 'Trạng thái đề tài đã thay đổi',
          body: `Đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldStatusLabel}" sang "${newStatusLabel}"`,
          userId: project.supervisorUser.id,
          link: undefined,
        });
      }

      // Notification for project members about status change
      const projectMembers = await this.projectMemberRepository!.find({
        where: { projectId: project.id },
      });

      for (const member of projectMembers) {
        await this.notificationService.create({
          title: 'Trạng thái đề tài đã thay đổi',
          body: `Đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldStatusLabel}" sang "${newStatusLabel}"`,
          userId: member.studentId,
          link: undefined,
        });
      }

      // Notification for project creator about status change
      if (
        project.createdByUser &&
        project.createdByUser.id !== project.supervisorUser?.id
      ) {
        await this.notificationService.create({
          title: 'Trạng thái đề tài đã thay đổi',
          body: `Đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldStatusLabel}" sang "${newStatusLabel}"`,
          userId: project.createdByUser.id,
          link: undefined,
        });
      }
    } catch (error) {
      // Log error but don't fail the project update
      console.error('Error creating status change notification:', error);
    }
  }

  private async createLevelChangeNotification(
    project: Project,
    oldLevel: string,
    newLevel: string,
  ): Promise<void> {
    try {
      // Get level labels for better notification messages
      const levelLabels = {
        undergraduate: 'Đại học',
        graduate: 'Sau đại học',
        research: 'Nghiên cứu',
      };

      const oldLevelLabel =
        levelLabels[oldLevel as keyof typeof levelLabels] || oldLevel;
      const newLevelLabel =
        levelLabels[newLevel as keyof typeof levelLabels] || newLevel;

      // Notification for supervisor about level change
      if (project.supervisorUser) {
        await this.notificationService.create({
          title: 'Cấp độ đề tài đã thay đổi',
          body: `Đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldLevelLabel}" sang "${newLevelLabel}"`,
          userId: project.supervisorUser.id,
          link: undefined,
        });
      }

      // Notification for project members about level change
      const projectMembers = await this.projectMemberRepository!.find({
        where: { projectId: project.id },
      });

      for (const member of projectMembers) {
        await this.notificationService.create({
          title: 'Cấp độ đề tài đã thay đổi',
          body: `Đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldLevelLabel}" sang "${newLevelLabel}"`,
          userId: member.studentId,
          link: undefined,
        });
      }

      // Notification for project creator about level change
      if (
        project.createdByUser &&
        project.createdByUser.id !== project.supervisorUser?.id
      ) {
        await this.notificationService.create({
          title: 'Cấp độ đề tài đã thay đổi',
          body: `Đề tài "${project.title}" (${project.code}) đã thay đổi từ "${oldLevelLabel}" sang "${newLevelLabel}"`,
          userId: project.createdByUser.id,
          link: undefined,
        });
      }
    } catch (error) {
      // Log error but don't fail the project update
      console.error('Error creating level change notification:', error);
    }
  }

  async findAllWithSearch(
    searchDto?: SearchProjectDto,
    user?: RequestUser,
  ): Promise<Project[] | PaginatedProjectResponseDto> {
    if (!searchDto || Object.keys(searchDto).length === 0) {
      return this.findAll(user);
    }

    const {
      title,
      code,
      facultyId,
      departmentId,
      majorId,
      termId,
      status,
      level,
      createdBy,
      supervisorId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.faculty', 'faculty')
      .leftJoinAndSelect('project.department', 'department')
      .leftJoinAndSelect('project.major', 'major')
      .leftJoinAndSelect('project.term', 'term')
      .leftJoinAndSelect('project.createdByUser', 'createdByUser')
      .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.student', 'student')
      .leftJoinAndSelect('project.projectMilestones', 'projectMilestones');

    // Apply search filters
    if (title) {
      queryBuilder.andWhere('project.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    if (code) {
      queryBuilder.andWhere('project.code LIKE :code', { code: `%${code}%` });
    }

    if (facultyId) {
      queryBuilder.andWhere('project.facultyId = :facultyId', { facultyId });
    }

    if (departmentId) {
      queryBuilder.andWhere('project.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (majorId) {
      queryBuilder.andWhere('project.majorId = :majorId', { majorId });
    }

    if (termId) {
      queryBuilder.andWhere('project.termId = :termId', { termId });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (level) {
      queryBuilder.andWhere('project.level = :level', { level });
    }

    if (createdBy) {
      queryBuilder.andWhere('project.createdBy = :createdBy', { createdBy });
    }

    if (supervisorId) {
      queryBuilder.andWhere('project.supervisorId = :supervisorId', {
        supervisorId,
      });
    }

    // Apply user role-based filtering
    if (user) {
      const roles = user.roles || [];

      // Admin: No additional filtering needed
      if (!roles.includes(UserRole.Admin)) {
        // Student: Return projects created by user or where user is a member
        if (roles.includes(UserRole.Student)) {
          queryBuilder.andWhere(
            '(project.createdBy = :userId OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.projectId = project.id AND pm.studentId = :userId))',
            { userId: user.id },
          );
        }

        // Lecturer: Return projects where user is supervisor + projects in councils where user is member
        if (roles.includes(UserRole.Lecturer)) {
          queryBuilder.andWhere(
            '(project.supervisorId = :userId OR EXISTS (SELECT 1 FROM council_projects cp INNER JOIN council_members cm ON cp.councilId = cm.councilId WHERE cp.projectId = project.id AND cm.userId = :userId))',
            { userId: user.id },
          );
        }

        // DepartmentHead: Return projects in user's department + projects in councils where user is member
        if (roles.includes(UserRole.DepartmentHead)) {
          if (user?.departmentId) {
            queryBuilder.andWhere(
              '(project.departmentId = :departmentId OR EXISTS (SELECT 1 FROM council_projects cp INNER JOIN council_members cm ON cp.councilId = cm.councilId WHERE cp.projectId = project.id AND cm.userId = :userId))',
              { departmentId: user.departmentId, userId: user.id },
            );
          } else {
            queryBuilder.andWhere(
              'EXISTS (SELECT 1 FROM council_projects cp INNER JOIN council_members cm ON cp.councilId = cm.councilId WHERE cp.projectId = project.id AND cm.userId = :userId)',
              { userId: user.id },
            );
          }
        }

        // FacultyDean: Return projects in user's faculty + projects in councils where user is member
        if (roles.includes(UserRole.FacultyDean)) {
          if (user?.facultyId) {
            queryBuilder.andWhere(
              '(project.facultyId = :facultyId OR EXISTS (SELECT 1 FROM council_projects cp INNER JOIN council_members cm ON cp.councilId = cm.councilId WHERE cp.projectId = project.id AND cm.userId = :userId))',
              { facultyId: user.facultyId, userId: user.id },
            );
          } else {
            queryBuilder.andWhere(
              'EXISTS (SELECT 1 FROM council_projects cp INNER JOIN council_members cm ON cp.councilId = cm.councilId WHERE cp.projectId = project.id AND cm.userId = :userId)',
              { userId: user.id },
            );
          }
        }
      }
    }

    // Apply sorting
    if (sortBy) {
      const allowedSortFields = [
        'id',
        'title',
        'code',
        'facultyId',
        'departmentId',
        'majorId',
        'termId',
        'status',
        'level',
        'createdAt',
        'updatedAt',
      ];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';
      const order = sortOrder || 'DESC';
      queryBuilder.orderBy(`project.${sortField}`, order);
    } else {
      queryBuilder.orderBy('project.createdAt', 'DESC');
    }

    // Apply pagination
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

  async findAll(user?: RequestUser): Promise<Project[]> {
    if (!user) {
      return this.projectRepository.find({
        relations: [
          'faculty',
          'department',
          'major',
          'term',
          'createdByUser',
          'supervisorUser',
          'members',
          'members.student',
          'projectMilestones',
        ],
      });
    }

    const roles = user.roles || [];

    // Admin: Return all projects
    if (roles.includes(UserRole.Admin)) {
      return this.projectRepository.find({
        relations: [
          'faculty',
          'department',
          'major',
          'term',
          'createdByUser',
          'supervisorUser',
          'members',
          'members.student',
          'projectMilestones',
        ],
      });
    }

    // Student: Return projects created by user or where user is a member
    if (roles.includes(UserRole.Student)) {
      // First get projects created by the user
      const createdProjects = await this.projectRepository.find({
        where: { createdBy: user.id },
        relations: [
          'faculty',
          'department',
          'major',
          'term',
          'createdByUser',
          'supervisorUser',
          'members',
          'members.student',
          'projectMilestones',
        ],
      });

      // Then get projects where user is a member
      const memberProjects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.faculty', 'faculty')
        .leftJoinAndSelect('project.department', 'department')
        .leftJoinAndSelect('project.major', 'major')
        .leftJoinAndSelect('project.term', 'term')
        .leftJoinAndSelect('project.createdByUser', 'createdByUser')
        .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
        .leftJoinAndSelect('project.members', 'members')
        .leftJoinAndSelect('members.student', 'student')
        .leftJoinAndSelect('project.projectMilestones', 'projectMilestones')
        .where(
          'EXISTS (SELECT 1 FROM project_members pm WHERE pm.projectId = project.id AND pm.studentId = :userId)',
          { userId: user.id },
        )
        .getMany();

      // Combine and remove duplicates
      const allProjects = [...createdProjects, ...memberProjects];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id),
      );

      return uniqueProjects;
    }

    // Lecturer: Return projects where user is supervisor + projects in councils where user is member
    if (roles.includes(UserRole.Lecturer)) {
      // Get projects where user is supervisor
      const supervisorProjects = await this.projectRepository.find({
        where: { supervisorId: user.id },
        relations: [
          'faculty',
          'department',
          'major',
          'term',
          'createdByUser',
          'supervisorUser',
          'members',
          'members.student',
          'projectMilestones',
        ],
      });

      // Get projects in councils where user is a member
      const councilProjects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.faculty', 'faculty')
        .leftJoinAndSelect('project.department', 'department')
        .leftJoinAndSelect('project.major', 'major')
        .leftJoinAndSelect('project.term', 'term')
        .leftJoinAndSelect('project.createdByUser', 'createdByUser')
        .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
        .leftJoinAndSelect('project.members', 'members')
        .leftJoinAndSelect('members.student', 'student')
        .leftJoinAndSelect('project.projectMilestones', 'projectMilestones')
        .innerJoin('council_projects', 'cp', 'cp.projectId = project.id')
        .innerJoin('council_members', 'cm', 'cm.councilId = cp.councilId')
        .where('cm.userId = :userId', { userId: user.id })
        .getMany();

      // Combine and remove duplicates
      const allProjects = [...supervisorProjects, ...councilProjects];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id),
      );

      return uniqueProjects;
    }

    // DepartmentHead: Return projects in user's department + projects in councils where user is member
    if (roles.includes(UserRole.DepartmentHead)) {
      let departmentProjects: Project[] = [];

      // Note: This assumes the user object has departmentId property
      // If the user entity doesn't have this property, you may need to:
      // 1. Add departmentId to User entity, or
      // 2. Create a separate query to find user's department, or
      // 3. Pass departmentId as a separate parameter
      if (user?.departmentId) {
        departmentProjects = await this.findByDepartment(user.departmentId);
      } else {
        // If no departmentId, log warning
        console.warn(
          `DepartmentHead user ${user.id} has no departmentId property`,
        );
      }

      // Get projects in councils where user is a member
      const councilProjects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.faculty', 'faculty')
        .leftJoinAndSelect('project.department', 'department')
        .leftJoinAndSelect('project.major', 'major')
        .leftJoinAndSelect('project.term', 'term')
        .leftJoinAndSelect('project.createdByUser', 'createdByUser')
        .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
        .leftJoinAndSelect('project.members', 'members')
        .leftJoinAndSelect('members.student', 'student')
        .leftJoinAndSelect('project.projectMilestones', 'projectMilestones')
        .innerJoin('council_projects', 'cp', 'cp.projectId = project.id')
        .innerJoin('council_members', 'cm', 'cm.councilId = cp.councilId')
        .where('cm.userId = :userId', { userId: user.id })
        .getMany();

      // Combine and remove duplicates
      const allProjects = [...departmentProjects, ...councilProjects];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id),
      );

      return uniqueProjects;
    }

    // FacultyDean: Return projects in user's faculty + projects in councils where user is member
    if (roles.includes(UserRole.FacultyDean)) {
      let facultyProjects: Project[] = [];

      // Note: This assumes the user object has facultyId property
      // If the user entity doesn't have this property, you may need to:
      // 1. Add facultyId to User entity, or
      // 2. Create a separate query to find user's faculty, or
      // 3. Pass facultyId as a separate parameter
      if (user.facultyId) {
        facultyProjects = await this.findByFaculty(user.facultyId);
      } else {
        // If no facultyId, log warning
        console.warn(`FacultyDean user ${user.id} has no facultyId property`);
      }

      // Get projects in councils where user is a member
      const councilProjects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.faculty', 'faculty')
        .leftJoinAndSelect('project.department', 'department')
        .leftJoinAndSelect('project.major', 'major')
        .leftJoinAndSelect('project.term', 'term')
        .leftJoinAndSelect('project.createdByUser', 'createdByUser')
        .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
        .leftJoinAndSelect('project.members', 'members')
        .leftJoinAndSelect('members.student', 'student')
        .leftJoinAndSelect('project.projectMilestones', 'projectMilestones')
        .innerJoin('council_projects', 'cp', 'cp.projectId = project.id')
        .innerJoin('council_members', 'cm', 'cm.councilId = cp.councilId')
        .where('cm.userId = :userId', { userId: user.id })
        .getMany();

      // Combine and remove duplicates
      const allProjects = [...facultyProjects, ...councilProjects];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id),
      );

      return uniqueProjects;
    }

    // Council: Return projects in councils where user is member
    if (roles.includes(UserRole.Council)) {
      return this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.faculty', 'faculty')
        .leftJoinAndSelect('project.department', 'department')
        .leftJoinAndSelect('project.major', 'major')
        .leftJoinAndSelect('project.term', 'term')
        .leftJoinAndSelect('project.createdByUser', 'createdByUser')
        .leftJoinAndSelect('project.supervisorUser', 'supervisorUser')
        .leftJoinAndSelect('project.members', 'members')
        .leftJoinAndSelect('members.student', 'student')
        .leftJoinAndSelect('project.projectMilestones', 'projectMilestones')
        .innerJoin('council_projects', 'cp', 'cp.projectId = project.id')
        .innerJoin('council_members', 'cm', 'cm.councilId = cp.councilId')
        .where('cm.userId = :userId', { userId: user.id })
        .getMany();
    }

    // Default: Return empty array for unknown roles
    return [];
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'faculty',
        'department',
        'major',
        'term',
        'createdByUser',
        'supervisorUser',
        'members',
        'members.student',
        'projectMilestones',
      ],
    });

    if (!project) {
      throw new NotFoundException(`Không tìm thấy đề tài có ID ${id}`);
    }

    return project;
  }

  /**
   * Update an existing project with notifications
   * - Notifies supervisor changes
   * - Notifies member additions/removals/role changes
   */
  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.validateProject(updateProjectDto);

    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Không tìm thấy đề tài có ID ${id}`);
    }

    // Check if project code already exists (if code is being updated)
    if (updateProjectDto.code && updateProjectDto.code !== project.code) {
      const existingProject = await this.projectRepository.findOne({
        where: { code: updateProjectDto.code },
      });
      if (existingProject) {
        throw new ConflictException('Mã đề tài đã tồn tại');
      }
    }

    const result = await this.projectRepository.manager.transaction(
      async (manager) => {
        const projectRepo = manager.getRepository(Project);
        const projectMemberRepo = manager.getRepository(ProjectMember);
        const termRepo = manager.getRepository(Term);

        if (updateProjectDto.termId) {
          const term = await termRepo.findOne({
            where: { id: updateProjectDto.termId },
          });
          if (!term) {
            throw new BadRequestException('Tiến độ không được tìm thấy');
          }

          const now = new Date();
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          const startDate = new Date(`${term.startDate}T00:00:00`);
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          const endDate = new Date(`${term.endDate}T23:59:59`);

          if (startDate > now || endDate < now) {
            throw new BadRequestException(
              'Không thể cập nhật đề tài ngoài thời gian tiến độ',
            );
          } else if (term.status === TermStatus.CLOSED) {
            throw new BadRequestException(
              'Không thể cập nhật đề tài trong tiến độ đã đóng',
            );
          }
        }

        const oldStatus = project.status;
        const oldLevel = project.level;

        const { members, ...rest } = updateProjectDto;
        Object.assign(project, rest);

        // Check if supervisor changed
        const supervisorChanged =
          project.supervisorId !== updateProjectDto.supervisorId;
        const oldSupervisorId = project.supervisorId;

        // Check if status changed
        const statusChanged =
          updateProjectDto.status && oldStatus !== updateProjectDto.status;

        // Check if level changed
        const levelChanged =
          updateProjectDto.level && oldLevel !== updateProjectDto.level;

        await projectRepo.save(project);

        const savedProject = await this.findOne(project.id);

        // Create notification for supervisor change only if actually changed
        if (
          supervisorChanged &&
          updateProjectDto.supervisorId &&
          oldSupervisorId !== updateProjectDto.supervisorId
        ) {
          await this.createSupervisorChangeNotification(
            savedProject,
            oldSupervisorId,
            updateProjectDto.supervisorId,
          );
        }

        // Create notification for status change if actually changed
        if (statusChanged && updateProjectDto.status) {
          await this.createStatusChangeNotification(
            savedProject,
            oldStatus,
            updateProjectDto.status,
          );
        }

        // Create notification for level change if actually changed
        if (levelChanged && updateProjectDto.level) {
          await this.createLevelChangeNotification(
            savedProject,
            oldLevel,
            updateProjectDto.level,
          );
        }

        // Update project members if members is provided
        if (members) {
          // Get existing members before updating
          const existingMembers = await projectMemberRepo.find({
            where: { projectId: +savedProject.id },
            relations: ['student'],
          });

          // First check if there are actually any changes
          if (this.hasMemberChanges(existingMembers, members)) {
            // Create maps for efficient comparison
            const existingMemberMap = new Map(
              existingMembers.map((m) => [+m.studentId, m]),
            );
            const newMemberMap = new Map(
              members.map((m) => [
                +m.studentId,
                { studentId: +m.studentId, roleInTeam: m.roleInTeam },
              ]),
            );

            // Find members to remove, add, and update - only actual changes
            const membersToRemove = existingMembers.filter(
              (m) => !newMemberMap.has(+m.studentId),
            );
            const membersToAdd = members.filter(
              (m) => !existingMemberMap.has(+m.studentId),
            );
            const membersToUpdate = members.filter((m) => {
              const existing = existingMemberMap.get(+m.studentId);
              if (existing) {
                const existingRole = existing.roleInTeam;
                const newRole = m.roleInTeam;

                const hasRoleChange = this.testRoleComparison(
                  existingRole,
                  newRole,
                  m.studentId,
                );

                return hasRoleChange;
              }
              return false;
            });

            for (const member of members) {
              const existing = existingMembers.find(
                (m) => m.studentId === member.studentId,
              );
              if (existing) {
                const existingRole = existing.roleInTeam;
                const newRole = member.roleInTeam;
                const hasChange = existingRole !== newRole;
                console.log(
                  `  User ${member.studentId}: "${existingRole}" !== "${newRole}" = ${hasChange}`,
                );
              }
            }

            console.log('Members to remove count:', membersToRemove.length);
            console.log('Members to add count:', membersToAdd.length);
            console.log('Members to update count:', membersToUpdate.length);

            // Only perform database operations for actual changes
            if (membersToRemove.length > 0) {
              console.log(
                'Removing members:',
                membersToRemove.map((m) => m.studentId),
              );
              await projectMemberRepo.delete({
                projectId: +savedProject.id,
                studentId: In(membersToRemove.map((m) => m.studentId)),
              });
            }

            if (membersToAdd.length > 0) {
              console.log(
                'Adding members:',
                membersToAdd.map((m) => m.studentId),
              );
              const newProjectMembers = membersToAdd.map((member) =>
                projectMemberRepo.create({
                  projectId: +savedProject.id,
                  studentId: +member.studentId,
                  roleInTeam: member.roleInTeam,
                }),
              );
              await projectMemberRepo.save(newProjectMembers);
            }

            if (membersToUpdate.length > 0) {
              for (const memberUpdate of membersToUpdate) {
                console.log(
                  `Updating user ${memberUpdate.studentId} role to: ${memberUpdate.roleInTeam}`,
                );
                await projectMemberRepo.update(
                  {
                    projectId: +savedProject.id,
                    studentId: memberUpdate.studentId,
                  },
                  { roleInTeam: memberUpdate.roleInTeam },
                );
              }
            }

            // Create notifications only for actual changes to avoid spam
            if (
              membersToRemove.length > 0 ||
              membersToAdd.length > 0 ||
              membersToUpdate.length > 0
            ) {
              try {
                await this.createMemberChangeNotifications(
                  savedProject,
                  existingMembers,
                  members,
                  { membersToRemove, membersToAdd, membersToUpdate },
                );
                console.log(
                  '✅ createMemberChangeNotifications completed successfully',
                );
              } catch (error) {
                console.error(
                  '❌ Error in createMemberChangeNotifications:',
                  error,
                );
                throw error;
              }

              for (const memberUpdate of membersToUpdate) {
                try {
                  await this.notificationService.findByUserId(
                    memberUpdate.studentId,
                  );
                } catch (error) {
                  console.error(
                    `❌ Error fetching notifications for user ${memberUpdate.studentId}:`,
                    error,
                  );
                }
              }
            } else {
              console.log(
                '✅ No member changes detected - skipping notifications',
              );
            }
          } else {
            console.log(
              '✅ No member changes detected - skipping all operations',
            );
          }
        }

        // Check if project has milestones, if not copy from term
        const existingMilestones = await manager
          .getRepository(ProjectMilestone)
          .find({
            where: { projectId: +savedProject.id },
          });

        if (existingMilestones.length === 0) {
          // Copy term milestones to project milestones
          const tmRepo = manager.getRepository(TermMilestone);
          const pmRepo = manager.getRepository(ProjectMilestone);
          const termMilestones = await tmRepo.find({
            where: { termId: savedProject.termId },
            order: { orderIndex: 'ASC' },
          });
          if (termMilestones.length > 0) {
            const projectMilestones = termMilestones.map((tm) =>
              pmRepo.create({
                projectId: +savedProject.id,
                title: tm.title,
                dueDate: tm.dueDate as unknown as Date,
                description: tm.description ?? null,
                orderIndex: tm.orderIndex ?? 0,
                status:
                  tm.status === TermMilestoneStatus.INACTIVE
                    ? ProjectMilestoneStatus.INACTIVE
                    : ProjectMilestoneStatus.ACTIVE,
              }),
            );
            await pmRepo.save(projectMilestones);
          }
        }

        // Reload with relations including milestones
        const savedWithRelations = await projectRepo.findOne({
          where: { id: savedProject.id },
          relations: [
            'faculty',
            'department',
            'major',
            'term',
            'createdByUser',
            'supervisorUser',
            'members',
            'members.student',
            'projectMilestones',
          ],
        });

        return savedWithRelations!;
      },
    );

    return result;
  }

  /**
   * Remove a project with notifications
   * - Notifies supervisor and all members about project deletion
   */
  async remove(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['supervisorUser', 'members', 'members.student'],
    });

    if (!project) {
      throw new NotFoundException(`Không tìm thấy đề tài có ID ${id}`);
    }

    // Create notifications before removing the project
    await this.createProjectDeletionNotifications(project);

    await this.projectRepository.remove(project);
    return project;
  }

  private async createProjectDeletionNotifications(
    project: Project,
  ): Promise<void> {
    try {
      // Notification for supervisor
      if (project.supervisorUser) {
        await this.notificationService.create({
          title: 'Đề tài đã bị xóa',
          body: `Đề tài "${project.title}" (${project.code}) mà bạn đang hướng dẫn đã bị xóa`,
          userId: project.supervisorUser.id,
          link: undefined,
        });
      }

      // Notifications for project members
      if (project.members && project.members.length > 0) {
        for (const member of project.members) {
          await this.notificationService.create({
            title: 'Đề tài đã bị xóa',
            body: `Đề tài "${project.title}" (${project.code}) mà bạn đang tham gia đã bị xóa`,
            userId: member.studentId,
            link: undefined,
          });
        }
      }
    } catch (error) {
      // Log error but don't fail the project deletion
      console.error('Error creating project deletion notifications:', error);
    }
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
        'projectMilestones',
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
        'projectMilestones',
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
        'projectMilestones',
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
        'projectMilestones',
      ],
    });
  }
}

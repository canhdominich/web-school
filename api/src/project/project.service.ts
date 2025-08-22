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
import {
  ProjectMilestone,
  ProjectMilestoneStatus,
} from '../project-milestone/project-milestone.entity';
import {
  TermMilestone,
  TermMilestoneStatus,
} from '../term-milestone/term-milestone.entity';
import { NotificationService } from '../notification/notification.service';

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
  ) {}

  /**
   * Create a new project with notifications
   * - Notifies supervisor about new project assignment
   * - Notifies all members about being added to the project
   */
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
          title: 'Dự án mới được giao',
          body: `Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án "${project.title}" (${project.code})`,
          userId: project.supervisorUser.id,
          link: undefined,
        });
      }

      // Notifications for project members
      if (createProjectDto.members && createProjectDto.members.length > 0) {
        const memberNotifications = createProjectDto.members.map((member) => ({
          title: 'Bạn đã được thêm vào dự án mới',
          body: `Bạn đã được thêm vào dự án "${project.title}" (${project.code}) với vai trò ${member.roleInTeam}`,
          userId: member.studentId,
          link: undefined,
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
            title: 'Bạn đã bị loại khỏi dự án',
            body: `Bạn đã bị loại khỏi dự án "${project.title}" (${project.code})`,
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
            title: 'Bạn đã được thêm vào dự án',
            body: `Bạn đã được thêm vào dự án "${project.title}" (${project.code}) với vai trò ${member.roleInTeam}`,
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
                title: 'Vai trò của bạn trong dự án đã thay đổi',
                body: `Vai trò của bạn trong dự án "${project.title}" (${project.code}) đã thay đổi từ "${oldMember.roleInTeam}" thành "${memberUpdate.roleInTeam}"`,
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
            title: 'Bạn đã bị loại khỏi dự án',
            body: `Bạn đã bị loại khỏi dự án "${project.title}" (${project.code})`,
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
            title: 'Bạn đã được thêm vào dự án',
            body: `Bạn đã được thêm vào dự án "${project.title}" (${project.code}) với vai trò ${member.roleInTeam}`,
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
              title: 'Vai trò của bạn trong dự án đã thay đổi',
              body: `Vai trò của bạn trong dự án "${project.title}" (${project.code}) đã thay đổi từ "${oldMember.roleInTeam}" thành "${newMember.roleInTeam}"`,
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
        body: `Bạn không còn là giảng viên hướng dẫn cho dự án "${project.title}" (${project.code})`,
        userId: oldSupervisorId,
        link: undefined,
      });

      // Notification for new supervisor
      await this.notificationService.create({
        title: 'Bạn đã được giao làm giảng viên hướng dẫn',
        body: `Bạn đã được giao làm giảng viên hướng dẫn cho dự án "${project.title}" (${project.code})`,
        userId: newSupervisorId,
        link: undefined,
      });

      // Notification for project members about supervisor change
      const projectMembers = await this.projectMemberRepository!.find({
        where: { projectId: project.id },
      });

      for (const member of projectMembers) {
        await this.notificationService.create({
          title: 'Giảng viên hướng dẫn dự án đã thay đổi',
          body: `Giảng viên hướng dẫn dự án "${project.title}" (${project.code}) đã thay đổi`,
          userId: member.studentId,
          link: undefined,
        });
      }
    } catch (error) {
      // Log error but don't fail the project update
      console.error('Error creating supervisor change notification:', error);
    }
  }

  async findAll(): Promise<Project[]> {
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
      throw new NotFoundException(`Không tìm thấy dự án có ID ${id}`);
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

        // Check if supervisor changed
        const supervisorChanged =
          project.supervisorId !== updateProjectDto.supervisorId;
        const oldSupervisorId = project.supervisorId;

        const savedProject = await projectRepo.save(project);

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
              // So sánh roleInTeam từ existing member với new member
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

            console.log('  - Members to remove count:', membersToRemove.length);
            console.log('  - Members to add count:', membersToAdd.length);
            console.log('  - Members to update count:', membersToUpdate.length);

            // Only perform database operations for actual changes
            if (membersToRemove.length > 0) {
              console.log(
                '🗑️ Removing members:',
                membersToRemove.map((m) => m.studentId),
              );
              await projectMemberRepo.delete({
                projectId: +savedProject.id,
                studentId: In(membersToRemove.map((m) => m.studentId)),
              });
            }

            if (membersToAdd.length > 0) {
              console.log(
                '➕ Adding members:',
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
                  `  - Updating user ${memberUpdate.studentId} role to: ${memberUpdate.roleInTeam}`,
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
                  const notifications =
                    await this.notificationService.findByUserId(
                      memberUpdate.studentId,
                    );
                  if (notifications.data.length > 0) {
                    const latest = notifications.data[0];
                    console.log(
                      `    Latest: "${latest.title}" - "${latest.body}" (${latest.createdAt})`,
                    );
                  }
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
      throw new NotFoundException(`Không tìm thấy dự án có ID ${id}`);
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
          title: 'Dự án đã bị xóa',
          body: `Dự án "${project.title}" (${project.code}) mà bạn đang hướng dẫn đã bị xóa`,
          userId: project.supervisorUser.id,
          link: undefined,
        });
      }

      // Notifications for project members
      if (project.members && project.members.length > 0) {
        for (const member of project.members) {
          await this.notificationService.create({
            title: 'Dự án đã bị xóa',
            body: `Dự án "${project.title}" (${project.code}) mà bạn đang tham gia đã bị xóa`,
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

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash } from 'bcrypt';
import { Role } from '../role/role.entity';
import { UserRole as UserRoleEntity } from '../userRole/userRole.entity';
import { UserRole as UserRoleEnum } from '../constants/user.constant';
import { Faculty } from '../faculty/faculty.entity';
import { Department } from '../department/department.entity';
import { Major } from '../major/major.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
  ) {}

  /**
   * Generate a unique 8-digit code for new users
   * Format: 00000001, 00000002, etc.
   */
  private async generateUniqueCode(): Promise<string> {
    let code = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    while (!isUnique && attempts < maxAttempts) {
      // Get the next available ID
      const lastUser = await this.userRepository.findOne({
        order: { id: 'DESC' },
        where: {},
      });

      const nextId = lastUser ? lastUser.id + 1 : 1;
      code = nextId.toString().padStart(8, '0');

      // Check if code already exists (in case of manual insert or data migration)
      const existingUser = await this.userRepository.findOne({
        where: { code },
      });

      if (!existingUser) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Không thể sinh mã duy nhất sau số lần thử tối đa');
    }

    return code;
  }

  /**
   * Validate faculty, department, and major IDs
   */
  private async validateAcademicInfo(
    facultyId?: number,
    departmentId?: number,
    majorId?: number,
  ): Promise<void> {
    if (facultyId) {
      const faculty = await this.facultyRepository.findOne({
        where: { id: facultyId },
      });
      if (!faculty) {
        throw new BadRequestException(`Không tìm thấy khoa có ID ${facultyId}`);
      }
    }

    if (departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId },
      });
      if (!department) {
        throw new BadRequestException(
          `Không tìm thấy bộ môn có ID ${departmentId}`,
        );
      }

      // If facultyId is provided, check if department belongs to that faculty
      if (facultyId && Number(department.facultyId) !== facultyId) {
        throw new BadRequestException(
          `Bộ môn có ID ${departmentId} không thuộc khoa có ID ${facultyId}`,
        );
      }
    }

    if (majorId) {
      const major = await this.majorRepository.findOne({
        where: { id: majorId },
      });
      if (!major) {
        throw new BadRequestException(`Không tìm thấy ngành có ID ${majorId}`);
      }

      // If departmentId is provided, check if major belongs to that department
      if (departmentId && Number(major.departmentId) !== departmentId) {
        throw new BadRequestException(
          `Ngành có ID ${majorId} không thuộc bộ môn có ID ${departmentId}`,
        );
      }

      // If facultyId is provided, check if major belongs to that faculty through department
      if (facultyId) {
        const department = await this.departmentRepository.findOne({
          where: { id: major.departmentId },
        });
        if (department && Number(department.facultyId) !== facultyId) {
          throw new BadRequestException(
            `Ngành có ID ${majorId} không thuộc khoa có ID ${facultyId}`,
          );
        }
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Validate academic information
    await this.validateAcademicInfo(
      createUserDto.facultyId,
      createUserDto.departmentId,
      createUserDto.majorId,
    );

    const hashedPassword = await hash(createUserDto.password, 10);

    const result = await this.userRepository.manager.transaction(
      async (manager) => {
        const userRepo = manager.getRepository(User);
        const roleRepo = manager.getRepository(Role);
        const userRoleRepo = manager.getRepository(UserRoleEntity);

        // Generate unique code for new user
        const code = await this.generateUniqueCode();

        const user = userRepo.create({
          ...createUserDto,
          code,
          password: hashedPassword,
        });
        const savedUser = await userRepo.save(user);

        const desiredRoleNames: UserRoleEnum[] = createUserDto.roles ?? [];
        if (desiredRoleNames.length > 0) {
          const roles = await roleRepo.find({
            where: { name: In(desiredRoleNames) },
          });
          const foundNames = new Set(roles.map((r) => r.name));
          const missing = desiredRoleNames.filter((r) => !foundNames.has(r));
          if (missing.length > 0) {
            throw new BadRequestException(
              `Vai trò không hợp lệ: ${missing.join(', ')}`,
            );
          }
          const userRoles = roles.map((role) =>
            userRoleRepo.create({ userId: savedUser.id, roleId: role.id }),
          );
          if (userRoles.length > 0) {
            await userRoleRepo.save(userRoles);
          }
        }

        return savedUser;
      },
    );

    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: [
        'userRoles',
        'userRoles.role',
        'faculty',
        'department',
        'major',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'faculty',
        'department',
        'major',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID ${id}`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng có email ${email}`,
      );
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.manager.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const roleRepo = manager.getRepository(Role);
      const userRoleRepo = manager.getRepository(UserRoleEntity);

      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng có ID ${id}`);
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await userRepo.findOne({
          where: { email: updateUserDto.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email đã tồn tại');
        }
      }

      if (updateUserDto.password) {
        updateUserDto.password = await hash(updateUserDto.password, 10);
      }

      // Validate academic information if provided
      if (
        updateUserDto.facultyId ||
        updateUserDto.departmentId ||
        updateUserDto.majorId
      ) {
        await this.validateAcademicInfo(
          updateUserDto.facultyId,
          updateUserDto.departmentId,
          updateUserDto.majorId,
        );
      }

      const { roles: rolesMaybe, ...rest } = updateUserDto;
      Object.assign(user, rest);
      const savedUser = await userRepo.save(user);

      if (rolesMaybe) {
        const desiredRoleNames: UserRoleEnum[] = rolesMaybe;
        const roles = await roleRepo.find({
          where: { name: In(desiredRoleNames) },
        });
        const foundNames = new Set(roles.map((r) => r.name));
        const missing = desiredRoleNames.filter((r) => !foundNames.has(r));
        if (missing.length > 0) {
          throw new BadRequestException(
            `Vai trò không hợp lệ: ${missing.join(', ')}`,
          );
        }

        const existingUserRoles = await userRoleRepo.find({
          where: { userId: savedUser.id },
        });
        const existingRoleIds = new Set(
          existingUserRoles.map((ur) => ur.roleId),
        );
        const desiredRoleIds = new Set(roles.map((r) => r.id));

        const toAdd = roles
          .filter((r) => !existingRoleIds.has(r.id))
          .map((r) => r.id);
        const toRemove = [...existingRoleIds].filter(
          (id) => !desiredRoleIds.has(id),
        );

        if (toRemove.length > 0) {
          await userRoleRepo.delete({
            userId: savedUser.id,
            roleId: In(toRemove),
          });
        }
        if (toAdd.length > 0) {
          const userRoles = toAdd.map((roleId) =>
            userRoleRepo.create({ userId: savedUser.id, roleId }),
          );
          await userRoleRepo.save(userRoles);
        }
      }

      return savedUser;
    });

    // Reload user with roles
    return this.findOne(id);
  }

  async remove(id: number): Promise<User> {
    const result = await this.userRepository.manager.transaction(
      async (manager) => {
        const userRepo = manager.getRepository(User);
        const userRoleRepo = manager.getRepository(UserRoleEntity);

        const user = await userRepo.findOne({ where: { id } });
        if (!user) {
          throw new NotFoundException(`Không tìm thấy người dùng có ID ${id}`);
        }

        // Check constraints before deletion
        const constraintViolations = await this.checkUserConstraints(
          id,
          manager,
        );
        if (constraintViolations.length > 0) {
          const violationDetails = constraintViolations
            .map((v) => v.detail)
            .join(', ');
          throw new BadRequestException(
            `Không thể xóa tài khoản này vì đang được sử dụng trong: ${violationDetails}`,
          );
        }

        await userRoleRepo.delete({ userId: id });
        await userRepo.remove(user);
        return user;
      },
    );

    return result;
  }

  /**
   * Check if user can be deleted by checking all related tables
   */
  private async checkUserConstraints(
    userId: number,
    manager: EntityManager,
  ): Promise<Array<{ table: string; detail: string }>> {
    const violations: Array<{ table: string; detail: string }> = [];

    // Check milestone submissions
    const milestoneSubmissionRepo = manager.getRepository(
      'milestone_submissions',
    );
    const milestoneSubmissions = await milestoneSubmissionRepo.count({
      where: { submittedBy: userId },
    });
    if (milestoneSubmissions > 0) {
      violations.push({
        table: 'milestone_submissions',
        detail: `${milestoneSubmissions} bài nộp milestone`,
      });
    }

    // Check project members
    const projectMemberRepo = manager.getRepository('project_members');
    const projectMembers = await projectMemberRepo.count({
      where: { studentId: userId },
    });
    if (projectMembers > 0) {
      violations.push({
        table: 'project_members',
        detail: `${projectMembers} thành viên dự án`,
      });
    }

    // Check projects (created by)
    const projectRepo = manager.getRepository('projects');
    const createdProjects = await projectRepo.count({
      where: { createdBy: userId },
    });
    if (createdProjects > 0) {
      violations.push({
        table: 'projects',
        detail: `${createdProjects} dự án đã tạo`,
      });
    }

    // Check projects (supervisor)
    const supervisedProjects = await projectRepo.count({
      where: { supervisorId: userId },
    });
    if (supervisedProjects > 0) {
      violations.push({
        table: 'projects',
        detail: `${supervisedProjects} dự án đang giám sát`,
      });
    }

    // Check notifications
    const notificationRepo = manager.getRepository('notifications');
    const notifications = await notificationRepo.count({
      where: { userId: userId },
    });
    if (notifications > 0) {
      violations.push({
        table: 'notifications',
        detail: `${notifications} thông báo`,
      });
    }

    return violations;
  }

  /**
   * Get all faculties
   */
  async getFaculties(): Promise<Faculty[]> {
    return this.facultyRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Get departments by faculty
   */
  async getDepartments(facultyId?: number): Promise<Department[]> {
    const whereCondition = facultyId ? { facultyId } : {};
    return this.departmentRepository.find({
      where: whereCondition,
      relations: ['faculty'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get majors by department
   */
  async getMajors(departmentId?: number): Promise<Major[]> {
    const whereCondition = departmentId ? { departmentId } : {};
    return this.majorRepository.find({
      where: whereCondition,
      relations: ['department', 'department.faculty'],
      order: { name: 'ASC' },
    });
  }
}

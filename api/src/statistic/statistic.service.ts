import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { UserRole } from '../userRole/userRole.entity';
import { Project, ProjectStatus } from '../project/project.entity';
import { Faculty } from '../faculty/faculty.entity';
import { Department } from '../department/department.entity';
import { Major } from '../major/major.entity';
import {
  StatisticResponseDto,
  UserStatisticsDto,
  ProjectStatisticsDto,
  AcademicStructureDto,
} from './dto/statistic-response.dto';
import { UserRole as UserRoleEnum } from '../constants/user.constant';

interface RoleCountResult {
  roleName: string;
  count: string;
}

interface StatusCountResult {
  status: string;
  count: string;
}

interface MonthlyProjectResult {
  month: string;
  count: string;
}

interface MonthlyUserResult {
  month: string;
  count: string;
}

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
  ) {}

  async getOverallStatistics(): Promise<StatisticResponseDto> {
    const [userStats, projectStats, academicStats] = await Promise.all([
      this.getUserStatistics(),
      this.getProjectStatistics(),
      this.getAcademicStructureStatistics(),
    ]);

    return {
      users: userStats,
      projects: projectStats,
      academicStructure: academicStats,
      generatedAt: new Date(),
    };
  }

  private async getUserStatistics(): Promise<UserStatisticsDto> {
    // Get total users count
    const totalUsers = await this.userRepository.count();

    // Get users count by role
    const roleCounts = await this.userRoleRepository
      .createQueryBuilder('ur')
      .select('r.name', 'roleName')
      .addSelect('COUNT(DISTINCT ur.userId)', 'count')
      .leftJoin('ur.role', 'r')
      .groupBy('r.name')
      .getRawMany<RoleCountResult>();

    // Get current year
    const currentYear = new Date().getFullYear();

    // Get monthly user statistics
    const monthlyUserStats = await this.userRepository
      .createQueryBuilder('u')
      .select('EXTRACT(MONTH FROM u.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM u.createdAt) = :year', {
        year: currentYear,
      })
      .groupBy('EXTRACT(MONTH FROM u.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyUserResult>();

    // Initialize counts
    const counts = {
      students: 0,
      lecturers: 0,
      departmentHeads: 0,
      facultyDeans: 0,
      councils: 0,
      admins: 0,
    };

    // Map role counts
    roleCounts.forEach((item) => {
      const count = parseInt(item.count);
      switch (item.roleName as UserRoleEnum) {
        case UserRoleEnum.Student:
          counts.students = count;
          break;
        case UserRoleEnum.Lecturer:
          counts.lecturers = count;
          break;
        case UserRoleEnum.DepartmentHead:
          counts.departmentHeads = count;
          break;
        case UserRoleEnum.FacultyDean:
          counts.facultyDeans = count;
          break;
        case UserRoleEnum.Council:
          counts.councils = count;
          break;
        case UserRoleEnum.Admin:
          counts.admins = count;
          break;
      }
    });

    // Initialize monthly users array with zeros for all 12 months
    const monthlyUsers: number[] = Array.from({ length: 12 }, () => 0);

    // Fill in the actual values for users
    monthlyUserStats.forEach((stat: MonthlyUserResult) => {
      const monthIndex = parseInt(stat.month, 10) - 1; // Convert to 0-based index
      monthlyUsers[monthIndex] = parseInt(stat.count, 10);
    });

    return {
      totalUsers,
      ...counts,
      monthlyUsers,
    };
  }

  private async getProjectStatistics(): Promise<ProjectStatisticsDto> {
    // Get total projects count
    const totalProjects = await this.projectRepository.count();

    // Get projects count by status
    const statusCounts = await this.projectRepository
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.status')
      .getRawMany<StatusCountResult>();

    // Get current year
    const currentYear = new Date().getFullYear();

    // Get monthly project statistics (all projects)
    const monthlyStats = await this.projectRepository
      .createQueryBuilder('p')
      .select('EXTRACT(MONTH FROM p.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM p.createdAt) = :year', {
        year: currentYear,
      })
      .groupBy('EXTRACT(MONTH FROM p.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyProjectResult>();

    // Get monthly completed project statistics
    const monthlyCompletedStats = await this.projectRepository
      .createQueryBuilder('p')
      .select('EXTRACT(MONTH FROM p.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM p.createdAt) = :year', {
        year: currentYear,
      })
      .andWhere('p.status = :status', {
        status: ProjectStatus.COMPLETED,
      })
      .groupBy('EXTRACT(MONTH FROM p.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany<MonthlyProjectResult>();

    // Initialize counts
    const counts = {
      draftProjects: 0,
      pendingProjects: 0,
      approvedProjects: 0,
      inProgressProjects: 0,
      completedProjects: 0,
      cancelledProjects: 0,
    };

    // Map status counts
    statusCounts.forEach((item) => {
      const count = parseInt(item.count);
      switch (item.status as ProjectStatus) {
        case ProjectStatus.DRAFT:
          counts.draftProjects = count;
          break;
        case ProjectStatus.PENDING:
          counts.pendingProjects = count;
          break;
        case ProjectStatus.APPROVED_BY_LECTURER:
        case ProjectStatus.APPROVED_BY_FACULTY_DEAN:
        case ProjectStatus.APPROVED_BY_RECTOR:
          counts.approvedProjects = count;
          break;
        case ProjectStatus.IN_PROGRESS:
          counts.inProgressProjects = count;
          break;
        case ProjectStatus.COMPLETED:
          counts.completedProjects = count;
          break;
        case ProjectStatus.CANCELLED:
          counts.cancelledProjects = count;
          break;
      }
    });

    // Initialize monthly projects array with zeros for all 12 months
    const monthlyProjects: number[] = Array.from({ length: 12 }, () => 0);

    // Fill in the actual values for all projects
    monthlyStats.forEach((stat: MonthlyProjectResult) => {
      const monthIndex = parseInt(stat.month, 10) - 1; // Convert to 0-based index
      monthlyProjects[monthIndex] = parseInt(stat.count, 10);
    });

    // Initialize monthly completed projects array with zeros for all 12 months
    const monthlyCompletedProjects: number[] = Array.from(
      { length: 12 },
      () => 0,
    );

    // Fill in the actual values for completed projects
    monthlyCompletedStats.forEach((stat: MonthlyProjectResult) => {
      const monthIndex = parseInt(stat.month, 10) - 1; // Convert to 0-based index
      monthlyCompletedProjects[monthIndex] = parseInt(stat.count, 10);
    });

    return {
      totalProjects,
      ...counts,
      monthlyProjects,
      monthlyCompletedProjects,
    };
  }

  private async getAcademicStructureStatistics(): Promise<AcademicStructureDto> {
    const [totalFaculties, totalDepartments, totalMajors] = await Promise.all([
      this.facultyRepository.count(),
      this.departmentRepository.count(),
      this.majorRepository.count(),
    ]);

    return {
      totalFaculties,
      totalDepartments,
      totalMajors,
    };
  }
}

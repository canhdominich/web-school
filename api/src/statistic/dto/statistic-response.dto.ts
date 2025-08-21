import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Number of students' })
  students: number;

  @ApiProperty({ description: 'Number of lecturers' })
  lecturers: number;

  @ApiProperty({ description: 'Number of department heads' })
  departmentHeads: number;

  @ApiProperty({ description: 'Number of faculty deans' })
  facultyDeans: number;

  @ApiProperty({ description: 'Number of council members' })
  councils: number;

  @ApiProperty({ description: 'Number of administrators' })
  admins: number;

  @ApiProperty({
    description:
      'Number of users created by month (array of 12 months, index 0 = January)',
    type: [Number],
    example: [10, 15, 20, 18, 25, 22, 28, 30, 35, 32, 38, 40],
  })
  monthlyUsers: number[];
}

export class ProjectStatisticsDto {
  @ApiProperty({ description: 'Total number of projects' })
  totalProjects: number;

  @ApiProperty({ description: 'Number of draft projects' })
  draftProjects: number;

  @ApiProperty({ description: 'Number of pending projects' })
  pendingProjects: number;

  @ApiProperty({ description: 'Number of approved projects' })
  approvedProjects: number;

  @ApiProperty({ description: 'Number of in-progress projects' })
  inProgressProjects: number;

  @ApiProperty({ description: 'Number of completed projects' })
  completedProjects: number;

  @ApiProperty({ description: 'Number of cancelled projects' })
  cancelledProjects: number;

  @ApiProperty({
    description:
      'Number of projects created by month (array of 12 months, index 0 = January)',
    type: [Number],
    example: [5, 8, 12, 15, 10, 7, 9, 11, 13, 16, 14, 18],
  })
  monthlyProjects: number[];

  @ApiProperty({
    description:
      'Number of completed projects by month (array of 12 months, index 0 = January)',
    type: [Number],
    example: [2, 3, 5, 8, 6, 4, 7, 9, 8, 10, 9, 12],
  })
  monthlyCompletedProjects: number[];
}

export class AcademicStructureDto {
  @ApiProperty({ description: 'Total number of faculties' })
  totalFaculties: number;

  @ApiProperty({ description: 'Total number of departments' })
  totalDepartments: number;

  @ApiProperty({ description: 'Total number of majors' })
  totalMajors: number;
}

export class StatisticResponseDto {
  @ApiProperty({ description: 'User statistics' })
  users: UserStatisticsDto;

  @ApiProperty({ description: 'Project statistics' })
  projects: ProjectStatisticsDto;

  @ApiProperty({ description: 'Academic structure statistics' })
  academicStructure: AcademicStructureDto;

  @ApiProperty({ description: 'Timestamp when statistics were generated' })
  generatedAt: Date;
} 
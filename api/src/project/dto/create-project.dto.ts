import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ProjectStatus, ProjectLevel } from '../project.entity';

export class CreateProjectDto {
  @ApiProperty({
    example: 'PRJ001',
    description: 'Unique project code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    example: 'Smart Campus Management System',
    description: 'Project title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    example: 'A comprehensive system for managing campus operations...',
    description: 'Project abstract',
  })
  @IsString()
  @IsNotEmpty()
  abstract: string;

  @ApiProperty({
    example: 'To develop an efficient campus management platform...',
    description: 'Project objectives',
  })
  @IsString()
  @IsNotEmpty()
  objectives: string;

  @ApiProperty({
    example: 'The system will cover student management, faculty management...',
    description: 'Project scope',
  })
  @IsString()
  @IsNotEmpty()
  scope: string;

  @ApiProperty({
    example: 'Agile development methodology with weekly sprints...',
    description: 'Project methodology',
  })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({
    example: 'Web application, mobile app, and admin dashboard...',
    description: 'Expected outputs',
  })
  @IsString()
  @IsNotEmpty()
  expectedOutputs: string;

  @ApiProperty({ example: '2024-01-01', description: 'Project start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'Project end date' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.DRAFT,
    description: 'Project status',
    default: ProjectStatus.DRAFT,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({
    enum: ProjectLevel,
    example: ProjectLevel.UNDERGRADUATE,
    description: 'Project level',
    default: ProjectLevel.UNDERGRADUATE,
  })
  @IsEnum(ProjectLevel)
  @IsOptional()
  level?: ProjectLevel;

  @ApiProperty({ example: 50000, description: 'Project budget', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @ApiProperty({ example: 1, description: 'Faculty ID' })
  @IsNumber()
  @IsNotEmpty()
  facultyId: number;

  @ApiProperty({ example: 1, description: 'Department ID' })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty({ example: 1, description: 'Major ID' })
  @IsNumber()
  @IsNotEmpty()
  majorId: number;

  @ApiProperty({ example: 1, description: 'User ID who created the project' })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;

  @ApiProperty({ example: 1, description: 'Supervisor user ID' })
  @IsNumber()
  @IsNotEmpty()
  supervisorId: number;

  @ApiProperty({ example: 1, description: 'Term ID this project belongs to' })
  @IsNumber()
  @IsNotEmpty()
  termId: number;

  @ApiProperty({
    example: [
      { studentId: 1001, roleInTeam: 'Leader' },
      { studentId: 1002, roleInTeam: 'Member' },
    ],
    required: false,
    description: 'Initial members to register to this project',
  })
  @IsOptional()
  members?: Array<{ studentId: number; roleInTeam: string }>;
}

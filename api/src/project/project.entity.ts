import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Faculty } from '../faculty/faculty.entity';
import { Department } from '../department/department.entity';
import { Major } from '../major/major.entity';
import { ProjectMember } from './project-member.entity';
import { Term } from '../term/term.entity';
import { ProjectMilestone } from '../project-milestone/project-milestone.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED_BY_LECTURER = 'approved_by_lecturer',
  APPROVED_BY_FACULTY_DEAN = 'approved_by_faculty_dean',
  APPROVED_BY_RECTOR = 'approved_by_rector',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectLevel {
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  RESEARCH = 'research',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  abstract: string;

  @Column({ type: 'text' })
  objectives: string;

  @Column({ type: 'text' })
  scope: string;

  @Column({ type: 'text' })
  method: string;

  @Column({ type: 'text' })
  expectedOutputs: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectLevel,
    default: ProjectLevel.UNDERGRADUATE,
  })
  level: ProjectLevel;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @ManyToOne(() => Faculty, { nullable: false })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @Column({ type: 'bigint' })
  facultyId: number;

  @ManyToOne(() => Department, { nullable: false })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'bigint' })
  departmentId: number;

  @ManyToOne(() => Major, { nullable: false })
  @JoinColumn({ name: 'majorId' })
  major: Major;

  @Column({ type: 'bigint' })
  majorId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Column({ type: 'bigint' })
  createdBy: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'supervisorId' })
  supervisorUser: User;

  @Column({ type: 'bigint' })
  supervisorId: number;

  @ManyToOne(() => Term, { nullable: false })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column({ type: 'bigint' })
  termId: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];

  @OneToMany(() => ProjectMilestone, (milestone) => milestone.project)
  projectMilestones: ProjectMilestone[];

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  averageScore: number | null;
}

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

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
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
}

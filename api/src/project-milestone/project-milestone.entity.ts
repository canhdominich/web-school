import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';

export enum ProjectMilestoneStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('project_milestones')
export class ProjectMilestone {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'bigint' })
  projectId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({
    type: 'enum',
    enum: ProjectMilestoneStatus,
    default: ProjectMilestoneStatus.ACTIVE,
  })
  status: ProjectMilestoneStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

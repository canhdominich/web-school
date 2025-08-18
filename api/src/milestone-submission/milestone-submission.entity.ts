import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectMilestone } from '../project-milestone/project-milestone.entity';
import { User } from '../user/user.entity';

@Entity('milestone_submissions')
export class MilestoneSubmission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => ProjectMilestone, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'milestoneId' })
  milestone: ProjectMilestone;

  @Column({ type: 'bigint' })
  milestoneId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'submittedBy' })
  submittedByUser: User;

  @Column({ type: 'bigint' })
  submittedBy: number;

  @Column({ type: 'datetime' })
  submittedAt: Date;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  fileUrl?: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

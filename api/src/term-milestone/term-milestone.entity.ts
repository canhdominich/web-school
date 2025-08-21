import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Term } from '../term/term.entity';

export enum TermMilestoneStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('term_milestones')
export class TermMilestone {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => Term, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column({ type: 'bigint' })
  termId: number;

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
    enum: TermMilestoneStatus,
    default: TermMilestoneStatus.ACTIVE,
  })
  status: TermMilestoneStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

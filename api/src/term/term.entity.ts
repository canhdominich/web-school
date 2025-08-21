import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TermMilestone } from '../term-milestone/term-milestone.entity';

export enum TermStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('terms')
export class Term {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: TermStatus, default: TermStatus.OPEN })
  status: TermStatus;

  @OneToMany(() => TermMilestone, (termMilestone) => termMilestone.term, {
    cascade: true,
  })
  termMilestones: TermMilestone[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

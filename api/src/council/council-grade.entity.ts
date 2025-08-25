import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Project } from '../project/project.entity';
import { Council } from './council.entity';
import { User } from '../user/user.entity';

@Entity('council_grades')
@Unique(['projectId', 'lecturerId'])
export class CouncilGrade {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  projectId: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'bigint' })
  councilId: number;

  @ManyToOne(() => Council, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'councilId' })
  council: Council;

  @Column({ type: 'bigint' })
  lecturerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lecturerId' })
  lecturer: User;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  score: number; // 0 - 10

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

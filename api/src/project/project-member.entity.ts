import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from '../user/user.entity';

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'bigint' })
  projectId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'bigint' })
  studentId: number;

  @Column({ type: 'varchar', length: 100 })
  roleInTeam: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
 
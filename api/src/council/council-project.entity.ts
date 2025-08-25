import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Council } from './council.entity';
import { Project } from '../project/project.entity';

@Entity('council_projects')
export class CouncilProject {
  @PrimaryColumn({ type: 'bigint' })
  councilId: number;

  @PrimaryColumn({ type: 'bigint' })
  projectId: number;

  @ManyToOne(() => Council, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'councilId' })
  council: Council;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}

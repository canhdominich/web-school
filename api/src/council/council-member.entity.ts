import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Council } from './council.entity';
import { User } from '../user/user.entity';

@Entity('council_members')
export class CouncilMember {
  @PrimaryColumn({ type: 'bigint' })
  councilId: number;

  @PrimaryColumn({ type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  roleInCouncil: string;

  @ManyToOne(() => Council, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'councilId' })
  council: Council;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  joinedAt: Date;
}

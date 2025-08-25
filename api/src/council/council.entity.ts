import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CouncilMember } from './council-member.entity';
import { Faculty } from '../faculty/faculty.entity';

@Entity('councils')
export class Council {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // active, inactive, archived

  @Column({ type: 'bigint', nullable: true })
  facultyId: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => CouncilMember, (councilMember) => councilMember.council)
  councilMembers: CouncilMember[];
}

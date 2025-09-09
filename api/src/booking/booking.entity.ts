import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Project } from '../project/project.entity';
import { Term } from '../term/term.entity';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED_BY_LECTURER = 'approved_by_lecturer',
  APPROVED_BY_FACULTY_DEAN = 'approved_by_faculty_dean',
  APPROVED_BY_RECTOR = 'approved_by_rector',
  REJECTED = 'rejected',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'datetime' })
  time: Date;

  @ManyToOne(() => Project, { nullable: false })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'bigint' })
  projectId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'bigint' })
  studentId: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedByLecturerId' })
  approvedByLecturer: User;

  @Column({ type: 'bigint', nullable: true })
  approvedByLecturerId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedByFacultyDeanId' })
  approvedByFacultyDean: User;

  @Column({ type: 'bigint', nullable: true })
  approvedByFacultyDeanId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedByRectorId' })
  approvedByRector: User;

  @Column({ type: 'bigint', nullable: true })
  approvedByRectorId: number | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date | null;
}

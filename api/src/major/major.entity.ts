import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from '../department/department.entity';
import { Faculty } from '../faculty/faculty.entity';
import { School } from '../school/school.entity';

@Entity('majors')
export class Major {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  departmentId: number;

  @Column({ type: 'bigint' })
  facultyId: number;

  @Column({ type: 'bigint' })
  schoolId: number;

  @Column({ type: 'varchar', length: 15, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;
}

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
import { UserRole } from '../userRole/userRole.entity';
import { Faculty } from 'src/faculty/faculty.entity';
import { Department } from 'src/department/department.entity';
import { Major } from 'src/major/major.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 15, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'bigint', nullable: true })
  facultyId: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @Column({ type: 'bigint', nullable: true })
  departmentId: number;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'bigint', nullable: true })
  majorId: number;

  @ManyToOne(() => Major)
  @JoinColumn({ name: 'majorId' })
  major: Major;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}

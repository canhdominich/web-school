import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string; // Mã năm học, ví dụ: AY-2024-2025

  @Column({ type: 'varchar', length: 255 })
  name: string; // Ví dụ: "Năm học 2024 - 2025"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

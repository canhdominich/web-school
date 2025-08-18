import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Faculty } from '../faculty/faculty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Faculty])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {} 
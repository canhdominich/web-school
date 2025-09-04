import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Major } from './major.entity';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';
import { Department } from '../department/department.entity';
import { Faculty } from '../faculty/faculty.entity';
import { School } from '../school/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Major, Department, Faculty, School])],
  controllers: [MajorController],
  providers: [MajorService],
})
export class MajorModule {}

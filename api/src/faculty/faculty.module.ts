import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { School } from '../school/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty, School])],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {} 
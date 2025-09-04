import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYear } from './academic-year.entity';
import { AcademicYearController } from './academic-year.controller';
import { AcademicYearService } from './academic-year.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
})
export class AcademicYearModule {}

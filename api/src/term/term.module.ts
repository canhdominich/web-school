import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Term } from './term.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { TermController } from './term.controller';
import { TermService } from './term.service';

@Module({
  imports: [TypeOrmModule.forFeature([Term, AcademicYear])],
  controllers: [TermController],
  providers: [TermService],
  exports: [TermService],
})
export class TermModule {}

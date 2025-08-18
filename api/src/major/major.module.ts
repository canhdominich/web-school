import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Major } from './major.entity';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';
import { Department } from '../department/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Major, Department])],
  controllers: [MajorController],
  providers: [MajorService],
})
export class MajorModule {}

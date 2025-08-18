import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermMilestone } from './term-milestone.entity';
import { TermMilestoneController } from './term-milestone.controller';
import { TermMilestoneService } from './term-milestone.service';

@Module({
  imports: [TypeOrmModule.forFeature([TermMilestone])],
  controllers: [TermMilestoneController],
  providers: [TermMilestoneService],
  exports: [TermMilestoneService],
})
export class TermMilestoneModule {}

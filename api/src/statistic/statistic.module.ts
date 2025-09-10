import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { UserRole } from '../user-role/userRole.entity';
import { Project } from '../project/project.entity';
import { Faculty } from '../faculty/faculty.entity';
import { Department } from '../department/department.entity';
import { Major } from '../major/major.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRole,
      Project,
      Faculty,
      Department,
      Major,
    ]),
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDataSource } from './data-source';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserRoleModule } from './userRole/userRole.module';
import { FacultyModule } from './faculty/faculty.module';
import { DepartmentModule } from './department/department.module';
import { MajorModule } from './major/major.module';
import { NotificationModule } from './notification/notification.module';
import { ProjectModule } from './project/project.module';
import { TermModule } from './term/term.module';
import { TermMilestoneModule } from './term-milestone/term-milestone.module';
import { ProjectMilestoneModule } from './project-milestone/project-milestone.module';
import { MilestoneSubmissionModule } from './milestone-submission/milestone-submission.module';
import { StatisticModule } from './statistic/statistic.module';
import { CouncilModule } from './council/council.module';
import { SchoolModule } from './school/school.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return await createDataSource(configService);
      },
      inject: [ConfigService],
    }),
    AuthModule,
    RoleModule,
    UserModule,
    UserRoleModule,
    SchoolModule,
    FacultyModule,
    DepartmentModule,
    MajorModule,
    NotificationModule,
    ProjectModule,
    TermModule,
    TermMilestoneModule,
    ProjectMilestoneModule,
    MilestoneSubmissionModule,
    StatisticModule,
    CouncilModule,
  ],
})
export class AppModule {}

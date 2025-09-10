import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import { UserRole } from '../user-role/userRole.entity';
import { Faculty } from '../faculty/faculty.entity';
import { Department } from '../department/department.entity';
import { Major } from '../major/major.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, Faculty, Department, Major])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

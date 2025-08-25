import { Module } from '@nestjs/common';
import { CouncilController } from './council.controller';
import { CouncilService } from './council.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Council } from './council.entity';
import { CouncilMember } from './council-member.entity';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { UserRole } from '../userRole/userRole.entity';
import { Faculty } from '../faculty/faculty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Council,
      CouncilMember,
      User,
      Role,
      UserRole,
      Faculty,
    ]),
  ],
  controllers: [CouncilController],
  providers: [CouncilService],
  exports: [CouncilService],
})
export class CouncilModule {}

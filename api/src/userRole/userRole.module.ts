import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './userRole.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserRoleModule {}

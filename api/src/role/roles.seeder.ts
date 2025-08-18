import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { UserRole } from '../constants/user.constant';

@Injectable()
export class RolesSeeder implements OnModuleInit {
  private readonly logger = new Logger(RolesSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit(): Promise<void> {
    const allRoleNames = Object.values(UserRole);

    const existingRoles = await this.roleRepository.find();
    const existingNames = new Set(existingRoles.map((r) => r.name));

    const rolesToCreate = allRoleNames
      .filter((roleName) => !existingNames.has(roleName))
      .map((roleName) => this.roleRepository.create({ name: roleName }));

    if (rolesToCreate.length === 0) {
      this.logger.log('Roles are already seeded. No action needed.');
      return;
    }

    await this.roleRepository.save(rolesToCreate);
    this.logger.log(
      `Seeded roles: ${rolesToCreate.map((r) => r.name).join(', ')}`,
    );
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Council } from './council.entity';
import { CouncilMember } from './council-member.entity';
import { CreateCouncilDto, UpdateCouncilDto, CouncilStatus } from './dto';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { UserRole as UserRoleEntity } from '../userRole/userRole.entity';
import { UserRole as UserRoleEnum } from '../constants/user.constant';

@Injectable()
export class CouncilService {
  constructor(
    @InjectRepository(Council)
    private readonly councilRepository: Repository<Council>,
    @InjectRepository(CouncilMember)
    private readonly councilMemberRepository: Repository<CouncilMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  /**
   * Validate that all member IDs are valid lecturers
   */
  private async validateMembers(memberIds: number[]): Promise<User[]> {
    if (!memberIds || memberIds.length === 0) {
      throw new BadRequestException('Danh sách thành viên không được để trống');
    }

    // Get lecturer role
    const lecturerRole = await this.roleRepository.findOne({
      where: { name: UserRoleEnum.Lecturer },
    });

    if (!lecturerRole) {
      throw new BadRequestException('Không tìm thấy vai trò giảng viên');
    }

    // Get all users with their roles
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.id IN (:...memberIds)', { memberIds })
      .getMany();

    if (users.length !== memberIds.length) {
      const foundIds = users.map((u) => u.id);
      const missingIds = memberIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Không tìm thấy người dùng có ID: ${missingIds.join(', ')}`,
      );
    }

    // Validate that all users are lecturers
    const nonLecturers = users.filter(
      (user) =>
        !user.userRoles.some((ur) => ur.role.name === UserRoleEnum.Lecturer),
    );

    if (nonLecturers.length > 0) {
      const names = nonLecturers.map((u) => u.name).join(', ');
      throw new BadRequestException(
        `Các người dùng sau không phải là giảng viên: ${names}`,
      );
    }

    return users;
  }

  async create(createCouncilDto: CreateCouncilDto): Promise<Council> {
    // Check if council name already exists
    const existingCouncil = await this.councilRepository.findOne({
      where: { name: createCouncilDto.name },
    });

    if (existingCouncil) {
      throw new ConflictException('Tên hội đồng đã tồn tại');
    }

    // Validate members
    const members = await this.validateMembers(createCouncilDto.memberIds);

    const council = this.councilRepository.create({
      name: createCouncilDto.name,
      description: createCouncilDto.description,
      status: createCouncilDto.status || CouncilStatus.Active,
    });

    const savedCouncil = await this.councilRepository.save(council);

    // Create council members
    const councilMembers = members.map((member) =>
      this.councilMemberRepository.create({
        councilId: savedCouncil.id,
        userId: member.id,
      }),
    );

    await this.councilMemberRepository.save(councilMembers);

    return this.findOne(savedCouncil.id);
  }

  async findAll(): Promise<Council[]> {
    return this.councilRepository.find({
      relations: ['councilMembers', 'councilMembers.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id },
      relations: ['councilMembers', 'councilMembers.user'],
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${id}`);
    }

    return council;
  }

  async update(
    id: number,
    updateCouncilDto: UpdateCouncilDto,
  ): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${id}`);
    }

    // Check if new name conflicts with existing councils
    if (updateCouncilDto.name && updateCouncilDto.name !== council.name) {
      const existingCouncil = await this.councilRepository.findOne({
        where: { name: updateCouncilDto.name },
      });

      if (existingCouncil) {
        throw new ConflictException('Tên hội đồng đã tồn tại');
      }
    }

    // Update other fields
    if (updateCouncilDto.name) {
      council.name = updateCouncilDto.name;
    }
    if (updateCouncilDto.description !== undefined) {
      council.description = updateCouncilDto.description;
    }
    if (updateCouncilDto.status) {
      council.status = updateCouncilDto.status;
    }

    await this.councilRepository.save(council);

    // Update members if provided
    if (updateCouncilDto.memberIds) {
      const members = await this.validateMembers(updateCouncilDto.memberIds);

      // Remove existing members
      await this.councilMemberRepository.delete({ councilId: id });

      // Add new members
      const councilMembers = members.map((member) =>
        this.councilMemberRepository.create({
          councilId: id,
          userId: member.id,
        }),
      );

      await this.councilMemberRepository.save(councilMembers);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const council = await this.councilRepository.findOne({
      where: { id },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${id}`);
    }

    await this.councilRepository.remove(council);
  }

  /**
   * Get councils by status
   */
  async findByStatus(status: CouncilStatus): Promise<Council[]> {
    return this.councilRepository.find({
      where: { status },
      relations: ['councilMembers', 'councilMembers.user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get councils by member ID
   */
  async findByMemberId(memberId: number): Promise<Council[]> {
    return this.councilRepository
      .createQueryBuilder('council')
      .leftJoinAndSelect('council.councilMembers', 'councilMember')
      .leftJoinAndSelect('councilMember.user', 'user')
      .where('councilMember.userId = :memberId', { memberId })
      .orderBy('council.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Add members to council
   */
  async addMembers(councilId: number, memberIds: number[]): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    const newMembers = await this.validateMembers(memberIds);

    // Check existing members
    const existingMembers = await this.councilMemberRepository.find({
      where: { councilId },
    });
    const existingMemberIds = existingMembers.map((m) => m.userId);

    const membersToAdd = newMembers.filter(
      (m) => !existingMemberIds.includes(m.id),
    );

    if (membersToAdd.length === 0) {
      throw new BadRequestException('Tất cả thành viên đã có trong hội đồng');
    }

    // Add new members
    const councilMembers = membersToAdd.map((member) =>
      this.councilMemberRepository.create({
        councilId,
        userId: member.id,
      }),
    );

    await this.councilMemberRepository.save(councilMembers);

    return this.findOne(councilId);
  }

  /**
   * Remove members from council
   */
  async removeMembers(
    councilId: number,
    memberIds: number[],
  ): Promise<Council> {
    const council = await this.councilRepository.findOne({
      where: { id: councilId },
    });

    if (!council) {
      throw new NotFoundException(`Không tìm thấy hội đồng có ID ${councilId}`);
    }

    // Check remaining members after removal
    const existingMembers = await this.councilMemberRepository.find({
      where: { councilId },
    });

    const remainingMembers = existingMembers.filter(
      (m) => !memberIds.includes(m.userId),
    );

    if (remainingMembers.length === 0) {
      throw new BadRequestException('Hội đồng phải có ít nhất một thành viên');
    }

    // Remove specified members
    await this.councilMemberRepository.delete({
      councilId,
      userId: In(memberIds),
    });

    return this.findOne(councilId);
  }
}

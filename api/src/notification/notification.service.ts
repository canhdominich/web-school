import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../user/user.entity';

export interface NotificationFilters {
  page?: number;
  limit?: number;
  seen?: boolean;
  userId?: number;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { id: createNotificationDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `Không tìm thấy người dùng có ID ${createNotificationDto.userId}`,
        );
      }

      const notification = this.notificationRepository.create(
        createNotificationDto,
      );

      const savedNotification =
        await this.notificationRepository.save(notification);
      console.log('✅ Notification saved successfully:', savedNotification.id);

      return savedNotification;
    } catch (error) {
      console.error('❌ Error in NotificationService.create:', error);
      throw error;
    }
  }

  async findAll(filters?: NotificationFilters): Promise<NotificationResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user');

    if (filters?.seen !== undefined) {
      queryBuilder.andWhere('notification.seen = :seen', {
        seen: filters.seen,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('notification.userId = :userId', {
        userId: filters.userId,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findUnread(
    filters?: NotificationFilters,
  ): Promise<NotificationResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.seen = :seen', { seen: false });

    if (filters?.userId) {
      queryBuilder.andWhere('notification.userId = :userId', {
        userId: filters.userId,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByUserId(
    userId: number,
    filters?: NotificationFilters,
  ): Promise<NotificationResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.userId = :userId', { userId });

    if (filters?.seen !== undefined) {
      queryBuilder.andWhere('notification.seen = :seen', {
        seen: filters.seen,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo có ID ${id}`);
    }

    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo có ID ${id}`);
    }

    // Check if user exists if userId is being updated
    if (updateNotificationDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateNotificationDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `Không tìm thấy người dùng có ID ${updateNotificationDto.userId}`,
        );
      }
    }

    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationRepository.update({}, { seen: true });
  }

  async remove(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo có ID ${id}`);
    }

    await this.notificationRepository.remove(notification);
    return notification;
  }
}

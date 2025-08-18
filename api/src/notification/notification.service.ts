import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../user/user.entity';

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
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      relations: ['user'],
    });
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
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification successfully created.',
    type: Notification,
  })
  create(@Body() dto: CreateNotificationDto, @Request() req) {
    // Ensure the notification is created for the authenticated user
    const userId = req.user.id;
    return this.notificationService.create({ ...dto, userId });
  }

  @Get()
  @ApiOperation({
    summary: 'Get notifications for authenticated user with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'seen',
    required: false,
    type: Boolean,
    description: 'Filter by seen status',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated notifications for authenticated user.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Notification' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('seen') seen?: boolean,
  ) {
    const userId = req.user.id;
    return this.notificationService.findAll({
      page,
      limit,
      seen,
      userId,
    });
  }

  @Get('unread')
  @ApiOperation({
    summary: 'Get unread notifications for authenticated user with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return paginated unread notifications for authenticated user.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Notification' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findUnread(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const userId = req.user.id;
    return this.notificationService.findUnread({
      page,
      limit,
      userId,
    });
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get notifications by user ID with pagination (admin only)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'seen',
    required: false,
    type: Boolean,
    description: 'Filter by seen status',
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated notifications for specific user.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Notification' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('seen') seen?: boolean,
  ) {
    // Only allow users to access their own notifications or admins
    const authenticatedUserId = req.user.id;
    if (authenticatedUserId !== userId && req.user.role !== 'admin') {
      throw new Error('Unauthorized access to notifications');
    }
    return this.notificationService.findByUserId(userId, { page, limit, seen });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the notification.',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.notificationService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification successfully updated.',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotificationDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.notificationService.update(id, dto, userId);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read.',
  })
  markAllAsRead(@Request() req) {
    const userId = req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.notificationService.remove(id, userId);
  }
}

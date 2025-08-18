import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MilestoneSubmissionService } from './milestone-submission.service';
import { CreateMilestoneSubmissionDto } from './dto/create-milestone-submission.dto';
import { UpdateMilestoneSubmissionDto } from './dto/update-milestone-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../constants/user.constant';

@ApiTags('milestone-submissions')
@ApiBearerAuth()
@Controller('milestone-submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MilestoneSubmissionController {
  constructor(private readonly service: MilestoneSubmissionService) {}

  @Post()
  @Roles(UserRole.Student)
  @ApiOperation({ summary: 'Submit a milestone (Student only)' })
  @ApiResponse({ status: 201, description: 'Submitted.' })
  create(@Body() dto: CreateMilestoneSubmissionDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Get('milestone/:milestoneId')
  @ApiOperation({ summary: 'List submissions by milestone' })
  findByMilestone(@Param('milestoneId', ParseIntPipe) milestoneId: number) {
    return this.service.findByMilestone(milestoneId);
  }

  @Get('me')
  @Roles(UserRole.Student)
  @ApiOperation({ summary: 'List my submissions' })
  findMine(@Req() req: any) {
    return this.service.findMine(req.user);
  }

  @Patch(':id')
  @Roles(UserRole.Student)
  @ApiOperation({ summary: 'Update my submission' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMilestoneSubmissionDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.Student)
  @ApiOperation({ summary: 'Delete my submission' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CouncilService } from './council.service';
import {
  CreateCouncilDto,
  UpdateCouncilDto,
  CouncilResponseDto,
  CouncilStatus,
} from './dto';
import { Council } from './council.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../constants/user.constant';

@ApiTags('councils')
@Controller('councils')
export class CouncilController {
  constructor(private readonly councilService: CouncilService) {}

  private mapCouncilToResponse(council: Council): CouncilResponseDto {
    const members = (council.councilMembers || []).map((cm) => {
      const u = cm.user as any;
      return {
        id: u.id,
        code: u.code,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
      };
    });

    return {
      id: council.id,
      name: council.name,
      description: council.description,
      status: council.status as any,
      facultyId: council.facultyId,
      faculty: council.faculty
        ? { id: Number(council.faculty.id), name: council.faculty.name }
        : undefined,
      createdAt: council.createdAt as any,
      updatedAt: council.updatedAt as any,
      members,
    } as CouncilResponseDto;
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hội đồng mới' })
  @ApiResponse({
    status: 201,
    description: 'Hội đồng được tạo thành công.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Tên hội đồng đã tồn tại.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.FacultyDean)
  async create(@Body() createCouncilDto: CreateCouncilDto) {
    const council = await this.councilService.create(createCouncilDto);
    return this.mapCouncilToResponse(council);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả hội đồng' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng.',
    type: [CouncilResponseDto],
  })
  async findAll() {
    const councils = await this.councilService.findAll();
    return councils.map((c) => this.mapCouncilToResponse(c));
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy hội đồng theo trạng thái' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng theo trạng thái.',
    type: [CouncilResponseDto],
  })
  async findByStatus(@Param('status') status: CouncilStatus) {
    const councils = await this.councilService.findByStatus(status);
    return councils.map((c) => this.mapCouncilToResponse(c));
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Lấy hội đồng theo ID thành viên' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng mà thành viên tham gia.',
    type: [CouncilResponseDto],
  })
  async findByMemberId(@Param('memberId', ParseIntPipe) memberId: number) {
    const councils = await this.councilService.findByMemberId(memberId);
    return councils.map((c) => this.mapCouncilToResponse(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hội đồng theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin hội đồng.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const council = await this.councilService.findOne(id);
    return this.mapCouncilToResponse(council);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật hội đồng' })
  @ApiResponse({
    status: 200,
    description: 'Hội đồng được cập nhật thành công.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Tên hội đồng đã tồn tại.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.FacultyDean)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouncilDto: UpdateCouncilDto,
  ) {
    const council = await this.councilService.update(id, updateCouncilDto);
    return this.mapCouncilToResponse(council);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Thêm thành viên vào hội đồng' })
  @ApiResponse({
    status: 200,
    description: 'Thành viên được thêm thành công.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.FacultyDean)
  async addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { memberIds: number[] },
  ) {
    const council = await this.councilService.addMembers(id, body.memberIds);
    return this.mapCouncilToResponse(council);
  }

  @Delete(':id/members')
  @ApiOperation({ summary: 'Xóa thành viên khỏi hội đồng' })
  @ApiResponse({
    status: 200,
    description: 'Thành viên được xóa thành công.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.FacultyDean)
  async removeMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { memberIds: number[] },
  ) {
    const council = await this.councilService.removeMembers(id, body.memberIds);
    return this.mapCouncilToResponse(council);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hội đồng' })
  @ApiResponse({ status: 200, description: 'Hội đồng được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.FacultyDean)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.councilService.remove(id);
  }
}

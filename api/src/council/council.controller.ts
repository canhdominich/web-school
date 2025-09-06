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
import { SearchCouncilDto } from './dto/search-council.dto';
import { PaginatedCouncilResponseDto } from './dto/paginated-council-response.dto';
import { Council } from './council.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../constants/user.constant';
import { ParseArrayPipe } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('councils')
@Controller('councils')
export class CouncilController {
  constructor(private readonly councilService: CouncilService) {}

  private mapCouncilToResponse(council: Council): CouncilResponseDto {
    const members = (council.councilMembers || []).map((cm) => {
      const u = cm.user as any;
      return {
        id: u?.id || 0,
        code: u?.code || '',
        name: u?.name || '',
        email: u?.email || '',
        phone: u?.phone || '',
        avatar: u?.avatar || '',
      };
    });

    return {
      id: council.id,
      name: council.name,
      description: council.description,
      status: council.status as any,
      facultyId: council.facultyId,
      faculty:
        council.faculty && council.faculty.id
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
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
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
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng có phân trang.',
    type: PaginatedCouncilResponseDto,
  })
  async findAll(@Query() searchDto: SearchCouncilDto) {
    const councils = await this.councilService.findAll(searchDto);

    // Handle pagination response
    if ('data' in councils) {
      return {
        ...councils,
        data: councils.data.map((c) => this.mapCouncilToResponse(c)),
      };
    }

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
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
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
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
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
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
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
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.councilService.remove(id);
  }

  // Assign/Unassign projects
  @Post(':id/projects')
  @ApiOperation({ summary: 'Gán nhiều project cho hội đồng' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
  async addProjects(
    @Param('id', ParseIntPipe) id: number,
    @Body('projectIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    projectIds: number[],
  ) {
    const council = await this.councilService.addProjects(id, projectIds);
    return this.mapCouncilToResponse(council);
  }

  @Delete(':id/projects')
  @ApiOperation({ summary: 'Gỡ gán project khỏi hội đồng' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Rector, UserRole.FacultyDean)
  async removeProjects(
    @Param('id', ParseIntPipe) id: number,
    @Body('projectIds', new ParseArrayPipe({ items: Number, separator: ',' }))
    projectIds: number[],
  ) {
    const council = await this.councilService.removeProjects(id, projectIds);
    return this.mapCouncilToResponse(council);
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Danh sách project đã gán cho hội đồng' })
  async listProjects(@Param('id', ParseIntPipe) id: number) {
    return this.councilService.getProjects(id);
  }

  // Grading endpoints
  @Post(':id/projects/:projectId/grade')
  @ApiOperation({
    summary: 'Giảng viên trong hội đồng chấm điểm đề tài (0-10)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.Lecturer,
    UserRole.FacultyDean,
    UserRole.Admin,
    UserRole.Rector,
  )
  async gradeProject(
    @Param('id', ParseIntPipe) councilId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() body: { score: number; comment?: string; lecturerId?: number },
  ) {
    const result = await this.councilService.gradeProject(
      councilId,
      projectId,
      body.score,
      body.comment,
      body.lecturerId,
    );
    return result;
  }

  @Get(':id/projects/:projectId/grades')
  @ApiOperation({ summary: 'Danh sách điểm của các giảng viên cho đề tài' })
  async listGrades(
    @Param('id', ParseIntPipe) councilId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.councilService.listGrades(councilId, projectId);
  }

  @Get('can-grade-project/:projectId')
  @ApiOperation({
    summary: 'Lấy danh sách hội đồng có thể chấm điểm cho đề tài',
  })
  async getCouncilsForProjectGrading(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    const councils =
      await this.councilService.findCouncilsForProjectGrading(projectId);
    return councils.map((c) => this.mapCouncilToResponse(c));
  }
}

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

@ApiTags('councils')
@Controller('councils')
export class CouncilController {
  constructor(private readonly councilService: CouncilService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hội đồng mới' })
  @ApiResponse({
    status: 201,
    description: 'Hội đồng được tạo thành công.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Tên hội đồng đã tồn tại.' })
  create(@Body() createCouncilDto: CreateCouncilDto) {
    return this.councilService.create(createCouncilDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả hội đồng' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng.',
    type: [CouncilResponseDto],
  })
  findAll() {
    return this.councilService.findAll();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy hội đồng theo trạng thái' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng theo trạng thái.',
    type: [CouncilResponseDto],
  })
  findByStatus(@Param('status') status: CouncilStatus) {
    return this.councilService.findByStatus(status);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Lấy hội đồng theo ID thành viên' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách hội đồng mà thành viên tham gia.',
    type: [CouncilResponseDto],
  })
  findByMemberId(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.councilService.findByMemberId(memberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hội đồng theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin hội đồng.',
    type: CouncilResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.councilService.findOne(id);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouncilDto: UpdateCouncilDto,
  ) {
    return this.councilService.update(id, updateCouncilDto);
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
  addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { memberIds: number[] },
  ) {
    return this.councilService.addMembers(id, body.memberIds);
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
  removeMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { memberIds: number[] },
  ) {
    return this.councilService.removeMembers(id, body.memberIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hội đồng' })
  @ApiResponse({ status: 200, description: 'Hội đồng được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội đồng.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.councilService.remove(id);
  }
}

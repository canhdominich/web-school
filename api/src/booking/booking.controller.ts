import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  SearchBookingDto,
  PaginatedBookingResponseDto,
  ApproveBookingDto,
} from './dto';
import { Booking } from './booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../constants/user.constant';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo booking mới' })
  @ApiResponse({
    status: 201,
    description: 'Booking được tạo thành công.',
    type: Booking,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án hoặc sinh viên.' })
  @ApiResponse({ status: 409, description: 'Đã có lịch đặt cho dự án này vào thời gian này.' })
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.create(createBookingDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách booking dựa trên role của user' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách booking.',
    type: [Booking],
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách booking có phân trang.',
    type: PaginatedBookingResponseDto,
  })
  findAll(@Query() searchDto: SearchBookingDto, @Req() req: any) {
    if (searchDto && Object.keys(searchDto).length > 0) {
      return this.bookingService.findAllWithSearch(searchDto, req.user);
    }
    return this.bookingService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy booking theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin booking.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking được cập nhật thành công.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa booking' })
  @ApiResponse({ status: 200, description: 'Booking được xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }

  @Post(':id/approve/lecturer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Lecturer)
  @ApiOperation({ summary: 'Duyệt booking bởi giảng viên' })
  @ApiResponse({
    status: 200,
    description: 'Booking được duyệt thành công.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  @ApiResponse({ status: 400, description: 'Không có quyền duyệt hoặc trạng thái không hợp lệ.' })
  approveByLecturer(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveBookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.approveByLecturer(id, approveDto, req.user);
  }

  @Post(':id/approve/faculty-dean')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FacultyDean)
  @ApiOperation({ summary: 'Duyệt booking bởi trưởng khoa' })
  @ApiResponse({
    status: 200,
    description: 'Booking được duyệt thành công.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  @ApiResponse({ status: 400, description: 'Không có quyền duyệt hoặc trạng thái không hợp lệ.' })
  approveByFacultyDean(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveBookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.approveByFacultyDean(id, approveDto, req.user);
  }

  @Post(':id/approve/rector')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Rector)
  @ApiOperation({ summary: 'Duyệt booking bởi phòng đào tạo' })
  @ApiResponse({
    status: 200,
    description: 'Booking được duyệt thành công.',
    type: Booking,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy booking.' })
  @ApiResponse({ status: 400, description: 'Không có quyền duyệt hoặc trạng thái không hợp lệ.' })
  approveByRector(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveBookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.approveByRector(id, approveDto, req.user);
  }
}

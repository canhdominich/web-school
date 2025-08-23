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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { User } from './user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { Faculty } from '../faculty/faculty.entity';
import { Department } from '../department/department.entity';
import { Major } from '../major/major.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or role.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [UserResponseDto] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input or role.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Get('academic/faculties')
  @ApiOperation({ summary: 'Get all faculties' })
  @ApiResponse({ status: 200, description: 'Return all faculties.', type: [Faculty] })
  getFaculties() {
    return this.userService.getFaculties();
  }

  @Get('academic/departments')
  @ApiOperation({ summary: 'Get departments by faculty' })
  @ApiQuery({ name: 'facultyId', required: false, description: 'Faculty ID to filter departments' })
  @ApiResponse({ status: 200, description: 'Return departments.', type: [Department] })
  getDepartments(@Query('facultyId') facultyId?: string) {
    const facultyIdNum = facultyId ? parseInt(facultyId, 10) : undefined;
    return this.userService.getDepartments(facultyIdNum);
  }

  @Get('academic/majors')
  @ApiOperation({ summary: 'Get majors by department' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Department ID to filter majors' })
  @ApiResponse({ status: 200, description: 'Return majors.', type: [Major] })
  getMajors(@Query('departmentId') departmentId?: string) {
    const departmentIdNum = departmentId ? parseInt(departmentId, 10) : undefined;
    return this.userService.getMajors(departmentIdNum);
  }
}

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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { SearchDepartmentDto } from './dto/search-department.dto';
import { PaginatedDepartmentResponseDto, DepartmentResponseDto } from './dto';

@ApiTags('departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a department' })
  @ApiResponse({
    status: 201,
    description: 'Department successfully created.',
    type: DepartmentResponseDto,
  })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: 200,
    description: 'Return all departments.',
    type: [DepartmentResponseDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated departments.',
    type: PaginatedDepartmentResponseDto,
  })
  findAll(@Query() searchDto: SearchDepartmentDto) {
    return this.departmentService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the department.',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({
    status: 200,
    description: 'Department successfully updated.',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ 
    status: 200, 
    description: 'Department successfully deleted.',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }
} 
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { FacultyResponseDto, PaginatedFacultyResponseDto } from './dto';
import { SearchFacultyDto } from './dto/search-faculty.dto';

@ApiTags('faculties')
@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a faculty' })
  @ApiResponse({
    status: 201,
    description: 'Faculty successfully created.',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Faculty code already exists.' })
  create(
    @Body() createFacultyDto: CreateFacultyDto,
  ): Promise<FacultyResponseDto> {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all faculties with optional search and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all faculties.',
    type: [FacultyResponseDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated faculties.',
    type: PaginatedFacultyResponseDto,
  })
  findAll(@Query() searchDto?: SearchFacultyDto) {
    return this.facultyService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a faculty by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the faculty.',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FacultyResponseDto> {
    return this.facultyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a faculty' })
  @ApiResponse({
    status: 200,
    description: 'Faculty successfully updated.',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ): Promise<FacultyResponseDto> {
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a faculty' })
  @ApiResponse({
    status: 200,
    description: 'Faculty successfully deleted.',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<FacultyResponseDto> {
    return this.facultyService.remove(id);
  }
}

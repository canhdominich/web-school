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
import { MajorService } from './major.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { SearchMajorDto } from './dto/search-major.dto';
import { PaginatedMajorResponseDto, MajorResponseDto } from './dto';

@ApiTags('majors')
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a major' })
  @ApiResponse({
    status: 201,
    description: 'Major successfully created.',
    type: MajorResponseDto,
  })
  create(@Body() dto: CreateMajorDto): Promise<MajorResponseDto> {
    return this.majorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all majors' })
  @ApiResponse({
    status: 200,
    description: 'Return all majors.',
    type: [MajorResponseDto],
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated majors.',
    type: PaginatedMajorResponseDto,
  })
  findAll(@Query() searchDto: SearchMajorDto) {
    return this.majorService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a major by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the major.',
    type: MajorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Major not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MajorResponseDto> {
    return this.majorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a major' })
  @ApiResponse({
    status: 200,
    description: 'Major successfully updated.',
    type: MajorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Major not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMajorDto): Promise<MajorResponseDto> {
    return this.majorService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a major' })
  @ApiResponse({ 
    status: 200, 
    description: 'Major successfully deleted.',
    type: MajorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Major not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<MajorResponseDto> {
    return this.majorService.remove(id);
  }
} 
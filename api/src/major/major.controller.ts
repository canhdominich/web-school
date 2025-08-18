import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MajorService } from './major.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { Major } from './major.entity';

@ApiTags('majors')
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a major' })
  @ApiResponse({
    status: 201,
    description: 'Major successfully created.',
    type: Major,
  })
  create(@Body() dto: CreateMajorDto) {
    return this.majorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all majors' })
  @ApiResponse({
    status: 200,
    description: 'Return all majors.',
    type: [Major],
  })
  findAll() {
    return this.majorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a major by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the major.',
    type: Major,
  })
  @ApiResponse({ status: 404, description: 'Major not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a major' })
  @ApiResponse({
    status: 200,
    description: 'Major successfully updated.',
    type: Major,
  })
  @ApiResponse({ status: 404, description: 'Major not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMajorDto) {
    return this.majorService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a major' })
  @ApiResponse({ status: 200, description: 'Major successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Major not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.remove(id);
  }
} 
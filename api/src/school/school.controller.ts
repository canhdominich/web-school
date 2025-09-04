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
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './school.entity';
import { SearchSchoolDto } from './dto/search-school.dto';
import { PaginatedSchoolResponseDto } from './dto/paginated-school-response.dto';

@ApiTags('schools')
@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @ApiOperation({ summary: 'Create a school' })
  @ApiResponse({
    status: 201,
    description: 'School successfully created.',
    type: School,
  })
  @ApiResponse({ status: 409, description: 'School code already exists.' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all schools with optional search and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return schools (all or filtered with pagination).',
    schema: {
      oneOf: [
        { type: 'array', items: { $ref: '#/components/schemas/School' } },
        { $ref: '#/components/schemas/PaginatedSchoolResponseDto' },
      ],
    },
  })
  findAll(@Query() searchDto?: SearchSchoolDto) {
    return this.schoolService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the school.',
    type: School,
  })
  @ApiResponse({ status: 404, description: 'School not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a school' })
  @ApiResponse({
    status: 200,
    description: 'School successfully updated.',
    type: School,
  })
  @ApiResponse({ status: 404, description: 'School not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school' })
  @ApiResponse({ status: 200, description: 'School successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolService.remove(id);
  }
}

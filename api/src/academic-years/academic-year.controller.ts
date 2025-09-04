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
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { AcademicYear } from './academic-year.entity';
import { SearchAcademicYearDto } from './dto/search-academic-year.dto';

@ApiTags('academic-years')
@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Post()
  @ApiOperation({ summary: 'Create an academic year' })
  @ApiResponse({
    status: 201,
    description: 'Academic year successfully created.',
    type: AcademicYear,
  })
  @ApiResponse({ status: 409, description: 'Academic year code already exists or overlaps with another year.' })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
    return this.academicYearService.create(createAcademicYearDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all academic years with optional search and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return academic years (all or filtered with pagination).',
    schema: {
      oneOf: [
        { type: 'array', items: { $ref: '#/components/schemas/AcademicYear' } },
        { $ref: '#/components/schemas/PaginatedAcademicYearResponseDto' },
      ],
    },
  })
  findAll(@Query() searchDto?: SearchAcademicYearDto) {
    return this.academicYearService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an academic year by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the academic year.',
    type: AcademicYear,
  })
  @ApiResponse({ status: 404, description: 'Academic year not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an academic year' })
  @ApiResponse({
    status: 200,
    description: 'Academic year successfully updated.',
    type: AcademicYear,
  })
  @ApiResponse({ status: 404, description: 'Academic year not found.' })
  @ApiResponse({ status: 409, description: 'Academic year code already exists or overlaps with another year.' })
  @ApiResponse({ status: 400, description: 'Invalid date range.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(id, updateAcademicYearDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an academic year' })
  @ApiResponse({ status: 200, description: 'Academic year successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Academic year not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearService.remove(id);
  }
}

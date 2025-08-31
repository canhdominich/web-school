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
import { Faculty } from './faculty.entity';
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
    type: Faculty,
  })
  @ApiResponse({ status: 409, description: 'Faculty code already exists.' })
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all faculties with optional search and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Return faculties (all or filtered with pagination).',
    schema: {
      oneOf: [
        { type: 'array', items: { $ref: '#/components/schemas/Faculty' } },
        { $ref: '#/components/schemas/PaginatedFacultyResponseDto' },
      ],
    },
  })
  findAll(@Query() searchDto?: SearchFacultyDto) {
    return this.facultyService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a faculty by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the faculty.',
    type: Faculty,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a faculty' })
  @ApiResponse({
    status: 200,
    description: 'Faculty successfully updated.',
    type: Faculty,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ) {
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a faculty' })
  @ApiResponse({ status: 200, description: 'Faculty successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.remove(id);
  }
}

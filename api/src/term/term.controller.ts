import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TermService } from './term.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { Term } from './term.entity';

@ApiTags('terms')
@Controller('terms')
export class TermController {
  constructor(private readonly termService: TermService) {}

  @Post()
  @ApiOperation({ summary: 'Create a term' })
  @ApiResponse({
    status: 201,
    description: 'Term successfully created.',
    type: Term,
  })
  @ApiResponse({ status: 409, description: 'Term code already exists.' })
  create(@Body() createTermDto: CreateTermDto) {
    return this.termService.create(createTermDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all terms' })
  @ApiResponse({ status: 200, description: 'Return all terms.', type: [Term] })
  findAll() {
    return this.termService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a term by id' })
  @ApiResponse({ status: 200, description: 'Return the term.', type: Term })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.termService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a term' })
  @ApiResponse({
    status: 200,
    description: 'Term successfully updated.',
    type: Term,
  })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTermDto: UpdateTermDto,
  ) {
    return this.termService.update(id, updateTermDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a term' })
  @ApiResponse({ status: 200, description: 'Term successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Term not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.termService.remove(id);
  }
}

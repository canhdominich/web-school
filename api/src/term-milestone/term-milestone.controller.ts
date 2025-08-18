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
import { TermMilestoneService } from './term-milestone.service';
import { CreateTermMilestoneDto } from './dto/create-term-milestone.dto';
import { UpdateTermMilestoneDto } from './dto/update-term-milestone.dto';
import { TermMilestone } from './term-milestone.entity';

@ApiTags('term-milestones')
@Controller('term-milestones')
export class TermMilestoneController {
  constructor(private readonly milestoneService: TermMilestoneService) {}

  @Post()
  @ApiOperation({ summary: 'Create a term milestone' })
  @ApiResponse({ status: 201, description: 'Created.', type: TermMilestone })
  create(@Body() dto: CreateTermMilestoneDto) {
    return this.milestoneService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all term milestones' })
  @ApiResponse({
    status: 200,
    description: 'List all milestones.',
    type: [TermMilestone],
  })
  findAll() {
    return this.milestoneService.findAll();
  }

  @Get('term/:termId')
  @ApiOperation({ summary: 'Get milestones by term' })
  @ApiResponse({
    status: 200,
    description: 'List milestones by term.',
    type: [TermMilestone],
  })
  findByTerm(@Param('termId', ParseIntPipe) termId: number) {
    return this.milestoneService.findByTerm(termId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a milestone by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the milestone.',
    type: TermMilestone,
  })
  @ApiResponse({ status: 404, description: 'Not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.milestoneService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiResponse({ status: 200, description: 'Updated.', type: TermMilestone })
  @ApiResponse({ status: 404, description: 'Not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTermMilestoneDto,
  ) {
    return this.milestoneService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiResponse({ status: 200, description: 'Deleted.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.milestoneService.remove(id);
  }
}

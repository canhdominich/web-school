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
import { ProjectMilestoneService } from './project-milestone.service';
import { CreateProjectMilestoneDto } from './dto/create-project-milestone.dto';
import { UpdateProjectMilestoneDto } from './dto/update-project-milestone.dto';
import { ProjectMilestone } from './project-milestone.entity';

@ApiTags('project-milestones')
@Controller('project-milestones')
export class ProjectMilestoneController {
  constructor(private readonly service: ProjectMilestoneService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project milestone' })
  @ApiResponse({ status: 201, description: 'Created.', type: ProjectMilestone })
  create(@Body() dto: CreateProjectMilestoneDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project milestones' })
  @ApiResponse({
    status: 200,
    description: 'List all.',
    type: [ProjectMilestone],
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get milestones by project' })
  @ApiResponse({
    status: 200,
    description: 'List by project.',
    type: [ProjectMilestone],
  })
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a milestone by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the milestone.',
    type: ProjectMilestone,
  })
  @ApiResponse({ status: 404, description: 'Not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiResponse({ status: 200, description: 'Updated.', type: ProjectMilestone })
  @ApiResponse({ status: 404, description: 'Not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectMilestoneDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiResponse({ status: 200, description: 'Deleted.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

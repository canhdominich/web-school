import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SearchProjectDto } from './dto/search-project.dto';
import { PaginatedProjectResponseDto } from './dto/paginated-project-response.dto';
import { Project, ProjectStatus } from './project.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project successfully created.',
    type: Project,
  })
  @ApiResponse({ status: 409, description: 'Project code already exists.' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects based on user role' })
  @ApiResponse({
    status: 200,
    description: 'Return projects based on user role.',
    type: [Project],
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated projects based on user role.',
    type: PaginatedProjectResponseDto,
  })
  findAll(@Query() searchDto: SearchProjectDto, @Req() req: any) {
    if (searchDto && Object.keys(searchDto).length > 0) {
      return this.projectService.findAllWithSearch(searchDto, req.user);
    }
    return this.projectService.findAll(req.user);
  }

  @Get('faculty/:facultyId')
  @ApiOperation({ summary: 'Get projects by faculty' })
  @ApiResponse({
    status: 200,
    description: 'Return projects by faculty.',
    type: [Project],
  })
  findByFaculty(@Param('facultyId', ParseIntPipe) facultyId: number) {
    return this.projectService.findByFaculty(facultyId);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get projects by department' })
  @ApiResponse({
    status: 200,
    description: 'Return projects by department.',
    type: [Project],
  })
  findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
    return this.projectService.findByDepartment(departmentId);
  }

  @Get('supervisor/:supervisorId')
  @ApiOperation({ summary: 'Get projects by supervisor' })
  @ApiResponse({
    status: 200,
    description: 'Return projects by supervisor.',
    type: [Project],
  })
  findBySupervisor(@Param('supervisorId', ParseIntPipe) supervisorId: number) {
    return this.projectService.findBySupervisor(supervisorId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get projects by status' })
  @ApiResponse({
    status: 200,
    description: 'Return projects by status.',
    type: [Project],
  })
  findByStatus(@Param('status') status: ProjectStatus) {
    return this.projectService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the project.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Project successfully updated.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id);
  }
}

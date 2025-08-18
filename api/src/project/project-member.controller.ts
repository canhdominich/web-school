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
import { ProjectMemberService } from './project-member.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { ProjectMember } from './project-member.entity';

@ApiTags('project-members')
@Controller('project-members')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new member to a project' })
  @ApiResponse({
    status: 201,
    description: 'Project member successfully added.',
    type: ProjectMember,
  })
  @ApiResponse({ status: 409, description: 'Student is already a member of this project.' })
  create(@Body() createProjectMemberDto: CreateProjectMemberDto) {
    return this.projectMemberService.create(createProjectMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project members' })
  @ApiResponse({
    status: 200,
    description: 'Return all project members.',
    type: [ProjectMember],
  })
  findAll() {
    return this.projectMemberService.findAll();
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get members by project' })
  @ApiResponse({
    status: 200,
    description: 'Return project members by project.',
    type: [ProjectMember],
  })
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectMemberService.findByProject(projectId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get projects by student' })
  @ApiResponse({
    status: 200,
    description: 'Return projects by student.',
    type: [ProjectMember],
  })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.projectMemberService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project member by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the project member.',
    type: ProjectMember,
  })
  @ApiResponse({ status: 404, description: 'Project member not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectMemberService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project member' })
  @ApiResponse({
    status: 200,
    description: 'Project member successfully updated.',
    type: ProjectMember,
  })
  @ApiResponse({ status: 404, description: 'Project member not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectMemberDto: UpdateProjectMemberDto,
  ) {
    return this.projectMemberService.update(id, updateProjectMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a project member' })
  @ApiResponse({ status: 200, description: 'Project member successfully removed.' })
  @ApiResponse({ status: 404, description: 'Project member not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectMemberService.remove(id);
  }

  @Delete('project/:projectId/student/:studentId')
  @ApiOperation({ summary: 'Remove a student from a project' })
  @ApiResponse({ status: 200, description: 'Student successfully removed from project.' })
  @ApiResponse({ status: 404, description: 'Project member not found.' })
  removeByProjectAndStudent(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.projectMemberService.removeByProjectAndStudent(projectId, studentId);
  }
} 
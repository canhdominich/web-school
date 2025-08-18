import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateProjectMemberDto {
  @ApiProperty({ example: 1, description: 'Project ID' })
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty({ example: 1, description: 'Student user ID' })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({
    example: 'Team Leader',
    description: 'Role in the project team',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  roleInTeam: string;
} 
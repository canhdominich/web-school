import { httpClient } from "@/lib/httpClient";
import type { User, RowData } from "@/types/common";

export type ProjectStatus =
	| "draft"
	| "pending"
	| "approved_by_lecturer"
	| "approved_by_faculty_dean"
	| "approved_by_rector"
	| "in_progress"
	| "completed"
	| "cancelled";

export enum ProjectStatusEnum {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED_BY_LECTURER = 'approved_by_lecturer',
  APPROVED_BY_FACULTY_DEAN = 'approved_by_faculty_dean',
  APPROVED_BY_RECTOR = 'approved_by_rector',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type ProjectLevel = "undergraduate" | "graduate" | "research";

export interface ProjectMemberDto {
	studentId: number;
	roleInTeam: string;
}

export interface ProjectMemberEntity {
	id: number;
	projectId: number;
	studentId: number;
	roleInTeam: string;
	createdAt: string;
	updatedAt: string;
	student?: User;
}

export interface MilestoneSubmissionEntity {
    id: number;
    milestoneId: number;
    submittedBy: number;
    submittedAt: string;
    note?: string | null;
    fileUrl?: string | null;
    version: number;
    createdAt: string;
    updatedAt: string;
    projectMilestone?: {
        id: number;
        title: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
    };
}
export interface ProjectEntity extends RowData {
	id: number;
	code: string;
	title: string;
	abstract: string;
	objectives: string;
	scope: string;
	method: string;
	expectedOutputs: string;
	startDate: string;
	endDate: string;
	status: ProjectStatus;
	level: ProjectLevel;
	budget: number;
	facultyId: number;
	departmentId: number;
	majorId: number;
	createdBy: number;
	supervisorId: number;
	termId: number;
	createdAt: string;
	updatedAt: string;
	faculty?: { id: number; name: string };
	department?: { id: number; name: string };
	major?: { id: number; name: string };
	term?: { id: number; name: string };
	createdByUser?: Pick<User, "id" | "name" | "email">;
	supervisorUser?: Pick<User, "id" | "name" | "email">;
	members?: ProjectMemberEntity[];
	projectMilestones?: ProjectMilestoneEntity[];
	averageScore?: number | null;
	lastMilestoneSubmission?: MilestoneSubmissionEntity | null;
}

export interface ProjectMilestoneEntity {
	id: string;
	projectId: string;
	title: string;
	dueDate: string;
	description: string;
	orderIndex: number;
	isRequired: boolean;
	status: "active" | "inactive" | string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateProjectDto {
	code: string;
	title: string;
	abstract: string;
	objectives: string;
	scope: string;
	method: string;
	expectedOutputs: string;
	startDate: string;
	endDate: string;
	status?: ProjectStatus;
	level?: ProjectLevel;
	budget?: number;
	facultyId: number;
	departmentId: number;
	majorId: number;
	createdBy: number;
	supervisorId: number;
	termId: number;
	members?: ProjectMemberDto[];
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

export interface SearchProjectDto {
	title?: string;
	code?: string;
	status?: ProjectStatus;
	level?: ProjectLevel;
	facultyId?: number;
	departmentId?: number;
	majorId?: number;
	termId?: number;
	academicYearId?: number;
	supervisorId?: number;
	createdBy?: number;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
	isArchived?: boolean;
}

export interface PaginatedProjectResponse {
	data: ProjectEntity[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export const getProjects = async (searchParams?: SearchProjectDto): Promise<PaginatedProjectResponse> => {
	const params = new URLSearchParams();
	
	if (searchParams) {
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				params.append(key, value.toString());
			}
		});
	}
	
	// Always include default pagination if not provided
	if (!searchParams?.page) {
		params.set('page', '1');
	}
	if (!searchParams?.limit) {
		params.set('limit', '10');
	}
	
	const queryString = params.toString();
	const url = queryString ? `/projects?${queryString}` : '/projects';
	
	const res = await httpClient.get(url);
	return res.data;
};

export const getProjectById = async (id: string): Promise<ProjectEntity> => {
	const res = await httpClient.get(`/projects/${id}`);
	return res.data;
};

export const createProject = async (
	data: CreateProjectDto
): Promise<ProjectEntity> => {
	const res = await httpClient.post("/projects", data);
	return res.data;
};

export const updateProject = async (
	id: string,
	data: UpdateProjectDto
): Promise<ProjectEntity> => {
	const res = await httpClient.patch(`/projects/${id}`, data);
	return res.data;
};

export const deleteProject = async (id: string): Promise<void> => {
	await httpClient.delete(`/projects/${id}`);
}; 
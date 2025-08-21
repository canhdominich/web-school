import { httpClient } from "@/lib/httpClient";
import type { User } from "@/types/common";

export type ProjectStatus =
	| "draft"
	| "pending"
	| "approved"
	| "in_progress"
	| "completed"
	| "cancelled";

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

export interface ProjectEntity {
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

export const getProjects = async (): Promise<ProjectEntity[]> => {
	const res = await httpClient.get("/projects");
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
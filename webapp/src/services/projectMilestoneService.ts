import { httpClient } from "@/lib/httpClient";

export interface ProjectMilestone {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    projectId: string;
    termMilestoneId?: string;
    order: number;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    createdAt: string;
    updatedAt: string;
    project?: {
        id: string;
        title: string;
    };
    termMilestone?: {
        id: string;
        title: string;
    };
}

export const getProjectMilestones = async (): Promise<ProjectMilestone[]> => {
    const res = await httpClient.get('/project-milestones');
    return res.data;
};

export const getProjectMilestoneById = async (id: string): Promise<ProjectMilestone> => {
    const res = await httpClient.get(`/project-milestones/${id}`);
    return res.data;
};

export const getProjectMilestonesByProjectId = async (projectId: string): Promise<ProjectMilestone[]> => {
    const res = await httpClient.get(`/project-milestones/project/${projectId}`);
    return res.data;
};

export const getProjectMilestonesByTermMilestoneId = async (termMilestoneId: string): Promise<ProjectMilestone[]> => {
    const res = await httpClient.get(`/project-milestones/term-milestone/${termMilestoneId}`);
    return res.data;
};

export const createProjectMilestone = async (data: {
    title: string;
    description: string;
    dueDate: string;
    projectId: string;
    termMilestoneId?: string;
    order: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
}): Promise<ProjectMilestone> => {
    const res = await httpClient.post('/project-milestones', data);
    return res.data;
};

export const updateProjectMilestone = async (id: string, data: {
    title?: string;
    description?: string;
    dueDate?: string;
    order?: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
}): Promise<ProjectMilestone> => {
    const res = await httpClient.patch(`/project-milestones/${id}`, data);
    return res.data;
};

export const updateProjectMilestoneStatus = async (id: string, status: 'pending' | 'in_progress' | 'completed' | 'overdue'): Promise<ProjectMilestone> => {
    const res = await httpClient.patch(`/project-milestones/${id}/status`, { status });
    return res.data;
};

export const reorderProjectMilestones = async (projectId: string, milestoneIds: string[]): Promise<void> => {
    await httpClient.patch(`/project-milestones/${projectId}/reorder`, { milestoneIds });
};

export const deleteProjectMilestone = async (id: string): Promise<void> => {
    await httpClient.delete(`/project-milestones/${id}`);
};

export interface CreateProjectMilestoneDto {
    title: string;
    description: string;
    dueDate: string;
    projectId: string;
    termMilestoneId?: string;
    order: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface UpdateProjectMilestoneDto {
    title?: string;
    description?: string;
    dueDate?: string;
    order?: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
} 
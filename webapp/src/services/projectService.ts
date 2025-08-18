import { httpClient } from "@/lib/httpClient";

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate?: string;
    userId: string;
    majorId?: string;
    termId?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    major?: {
        id: string;
        name: string;
    };
    term?: {
        id: string;
        name: string;
    };
}

export const getProjects = async (): Promise<Project[]> => {
    const res = await httpClient.get('/projects');
    return res.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
    const res = await httpClient.get(`/projects/${id}`);
    return res.data;
};

export const getProjectsByUserId = async (userId: string): Promise<Project[]> => {
    const res = await httpClient.get(`/projects/user/${userId}`);
    return res.data;
};

export const getProjectsByMajorId = async (majorId: string): Promise<Project[]> => {
    const res = await httpClient.get(`/projects/major/${majorId}`);
    return res.data;
};

export const getProjectsByTermId = async (termId: string): Promise<Project[]> => {
    const res = await httpClient.get(`/projects/term/${termId}`);
    return res.data;
};

export const createProject = async (data: {
    title: string;
    description: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate?: string;
    userId: string;
    majorId?: string;
    termId?: string;
}): Promise<Project> => {
    const res = await httpClient.post('/projects', data);
    return res.data;
};

export const updateProject = async (id: string, data: {
    title?: string;
    description?: string;
    status?: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    startDate?: string;
    endDate?: string;
    majorId?: string;
    termId?: string;
}): Promise<Project> => {
    const res = await httpClient.patch(`/projects/${id}`, data);
    return res.data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await httpClient.delete(`/projects/${id}`);
};

export interface CreateProjectDto {
    title: string;
    description: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate?: string;
    userId: string;
    majorId?: string;
    termId?: string;
}

export interface UpdateProjectDto {
    title?: string;
    description?: string;
    status?: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    startDate?: string;
    endDate?: string;
    majorId?: string;
    termId?: string;
} 
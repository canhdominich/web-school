import { httpClient } from "@/lib/httpClient";
import { TermMilestoneStatus } from "@/types/common";

export interface TermMilestone {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    termId: string;
    orderIndex: number;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
    term?: {
        id: string;
        name: string;
    };
}

export const getTermMilestones = async (): Promise<TermMilestone[]> => {
    const res = await httpClient.get('/term-milestones');
    return res.data;
};

export const getTermMilestoneById = async (id: string): Promise<TermMilestone> => {
    const res = await httpClient.get(`/term-milestones/${id}`);
    return res.data;
};

export const getTermMilestonesByTermId = async (termId: string): Promise<TermMilestone[]> => {
    const res = await httpClient.get(`/term-milestones/term/${termId}`);
    return res.data;
};

export const createTermMilestone = async (data: {
    title: string;
    description: string;
    dueDate: string;
    termId: string;
    orderIndex: number;
    isRequired?: boolean;
}): Promise<TermMilestone> => {
    const res = await httpClient.post('/term-milestones', data);
    return res.data;
};

export const updateTermMilestone = async (id: string, data: {
    title?: string;
    description?: string;
    dueDate?: string;
    orderIndex?: number;
    isRequired?: boolean;
}): Promise<TermMilestone> => {
    const res = await httpClient.patch(`/term-milestones/${id}`, data);
    return res.data;
};

export const reorderTermMilestones = async (termId: string, milestoneIds: string[]): Promise<void> => {
    await httpClient.patch(`/term-milestones/${termId}/reorder`, { milestoneIds });
};

export const deleteTermMilestone = async (id: string): Promise<void> => {
    await httpClient.delete(`/term-milestones/${id}`);
};

export interface CreateTermMilestoneDto {
    title: string;
    description: string;
    dueDate: string;
    termId: string;
    orderIndex: number;
    isRequired?: boolean;
    status: TermMilestoneStatus;
}

export interface UpdateTermMilestoneDto {
    title?: string;
    description?: string;
    dueDate?: string;
    orderIndex?: number;
    isRequired?: boolean;
    status?: TermMilestoneStatus;
} 
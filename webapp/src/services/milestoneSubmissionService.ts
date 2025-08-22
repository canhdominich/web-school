import { httpClient } from "@/lib/httpClient";

export interface MilestoneSubmission {
    id: string;
    title: string;
    description: string;
    content: string;
    attachments: string[];
    projectMilestoneId: string;
    userId: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
    submittedAt?: string;
    reviewedAt?: string;
    reviewerId?: string;
    feedback?: string;
    createdAt: string;
    updatedAt: string;
    projectMilestone?: {
        id: string;
        title: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
    reviewer?: {
        id: string;
        name: string;
        email: string;
    };
}

export const getMilestoneSubmissions = async (): Promise<MilestoneSubmission[]> => {
    const res = await httpClient.get('/milestone-submissions');
    return res.data;
};

export const getMilestoneSubmissionById = async (id: string): Promise<MilestoneSubmission> => {
    const res = await httpClient.get(`/milestone-submissions/${id}`);
    return res.data;
};

export const getMilestoneSubmissionsByProjectMilestoneId = async (projectMilestoneId: string): Promise<MilestoneSubmission[]> => {
    const res = await httpClient.get(`/milestone-submissions/project-milestone/${projectMilestoneId}`);
    return res.data;
};

export const getMilestoneSubmissionsByUserId = async (userId: string): Promise<MilestoneSubmission[]> => {
    const res = await httpClient.get(`/milestone-submissions/user/${userId}`);
    return res.data;
};

export const getMilestoneSubmissionsByStatus = async (status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested'): Promise<MilestoneSubmission[]> => {
    const res = await httpClient.get(`/milestone-submissions/status/${status}`);
    return res.data;
};

export const createMilestoneSubmission = async (data: {
    title: string;
    description: string;
    content: string;
    attachments?: string[];
    projectMilestoneId: string;
    userId: string;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
}): Promise<MilestoneSubmission> => {
    const res = await httpClient.post('/milestone-submissions', data);
    return res.data;
};

export const updateMilestoneSubmission = async (id: string, data: {
    title?: string;
    description?: string;
    content?: string;
    attachments?: string[];
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
}): Promise<MilestoneSubmission> => {
    const res = await httpClient.patch(`/milestone-submissions/${id}`, data);
    return res.data;
};

export const submitMilestoneSubmission = async (id: string): Promise<MilestoneSubmission> => {
    const res = await httpClient.patch(`/milestone-submissions/${id}/submit`);
    return res.data;
};

export const reviewMilestoneSubmission = async (id: string, data: {
    status: 'approved' | 'rejected' | 'revision_requested';
    feedback?: string;
    reviewerId: string;
}): Promise<MilestoneSubmission> => {
    const res = await httpClient.patch(`/milestone-submissions/${id}/review`, data);
    return res.data;
};

export const deleteMilestoneSubmission = async (id: string): Promise<void> => {
    await httpClient.delete(`/milestone-submissions/${id}`);
};

export interface CreateMilestoneSubmissionDto {
    title: string;
    description: string;
    content: string;
    attachments?: string[];
    projectMilestoneId: string;
    userId: string;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
}

export interface UpdateMilestoneSubmissionDto {
    title?: string;
    description?: string;
    content?: string;
    attachments?: string[];
    status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
}

export interface ReviewMilestoneSubmissionDto {
    status: 'approved' | 'rejected' | 'revision_requested';
    feedback?: string;
    reviewerId: string;
}

// Simple DTO aligned with backend NestJS service
export interface CreateMilestoneSubmissionSimpleDto {
    milestoneId: number;
    note?: string;
    fileUrl?: string;
}

export const createMilestoneSubmissionSimple = async (data: CreateMilestoneSubmissionSimpleDto) => {
    const res = await httpClient.post('/milestone-submissions', data);
    return res.data;
}; 
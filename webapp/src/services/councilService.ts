import { httpClient } from "@/lib/httpClient";
import { Council, CreateCouncilDto, UpdateCouncilDto } from "@/types/council";
import { ProjectEntity } from "@/services/projectService";

export const getCouncils = async (): Promise<Council[]> => {
    const res = await httpClient.get('/councils');
    return res.data;
};

export const getCouncilById = async (id: string): Promise<Council> => {
    const res = await httpClient.get(`/councils/${id}`);
    return res.data;
};

export const createCouncil = async (data: CreateCouncilDto): Promise<Council> => {
    const res = await httpClient.post('/councils', data);
    return res.data;
};

export const updateCouncil = async (id: string, data: UpdateCouncilDto): Promise<Council> => {
    const res = await httpClient.patch(`/councils/${id}`, data);
    return res.data;
};

export const deleteCouncil = async (id: string): Promise<void> => {
    await httpClient.delete(`/councils/${id}`);
};

export const addCouncilMembers = async (id: string, memberIds: number[]): Promise<Council> => {
    const res = await httpClient.post(`/councils/${id}/members`, { memberIds });
    return res.data;
};

export const removeCouncilMembers = async (id: string, memberIds: number[]): Promise<Council> => {
    const res = await httpClient.delete(`/councils/${id}/members`, { data: { memberIds } });
    return res.data;
};

export const getCouncilsByStatus = async (status: string): Promise<Council[]> => {
    const res = await httpClient.get(`/councils/status/${status}`);
    return res.data;
};

export const getCouncilsByMember = async (memberId: string): Promise<Council[]> => {
    const res = await httpClient.get(`/councils/member/${memberId}`);
    return res.data;
};

// Projects assignment APIs
export const addCouncilProjects = async (id: string, projectIds: number[]): Promise<Council> => {
    const res = await httpClient.post(`/councils/${id}/projects`, { projectIds });
    return res.data;
};

export const removeCouncilProjects = async (id: string, projectIds: number[]): Promise<Council> => {
    const res = await httpClient.delete(`/councils/${id}/projects`, { data: { projectIds } });
    return res.data;
};

export const getCouncilProjects = async (id: string): Promise<ProjectEntity[]> => {
    const res = await httpClient.get(`/councils/${id}/projects`);
    return res.data;
};

// New function to get councils that can grade a specific project
export const getCouncilsForProjectGrading = async (projectId: string): Promise<Council[]> => {
    const res = await httpClient.get(`/councils/can-grade-project/${projectId}`);
    return res.data;
};

// New grading functions
export const gradeProject = async (
    councilId: string,
    projectId: string,
    score: number,
    comment?: string,
    lecturerId?: number
): Promise<{ success: boolean; averageScore: number | null }> => {
    const res = await httpClient.post(`/councils/${councilId}/projects/${projectId}/grade`, {
        score,
        comment,
        lecturerId,
    });
    return res.data;
};

export const getProjectGrades = async (
    councilId: string,
    projectId: string
): Promise<Array<{
    id: number;
    lecturerId: number;
    lecturerName: string;
    score: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
}>> => {
    const res = await httpClient.get(`/councils/${councilId}/projects/${projectId}/grades`);
    return res.data;
};

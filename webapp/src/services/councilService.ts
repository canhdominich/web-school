import { httpClient } from "@/lib/httpClient";
import { Council, CreateCouncilDto, UpdateCouncilDto } from "@/types/council";

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

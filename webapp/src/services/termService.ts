import { httpClient } from "@/lib/httpClient";

export interface Term {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getTerms = async (): Promise<Term[]> => {
    const res = await httpClient.get('/terms');
    return res.data;
};

export const getTermById = async (id: string): Promise<Term> => {
    const res = await httpClient.get(`/terms/${id}`);
    return res.data;
};

export const getActiveTerm = async (): Promise<Term | null> => {
    const res = await httpClient.get('/terms/active');
    return res.data;
};

export const createTerm = async (data: {
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}): Promise<Term> => {
    const res = await httpClient.post('/terms', data);
    return res.data;
};

export const updateTerm = async (id: string, data: {
    name?: string;
    code?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}): Promise<Term> => {
    const res = await httpClient.patch(`/terms/${id}`, data);
    return res.data;
};

export const activateTerm = async (id: string): Promise<Term> => {
    const res = await httpClient.patch(`/terms/${id}/activate`);
    return res.data;
};

export const deactivateTerm = async (id: string): Promise<Term> => {
    const res = await httpClient.patch(`/terms/${id}/deactivate`);
    return res.data;
};

export const deleteTerm = async (id: string): Promise<void> => {
    await httpClient.delete(`/terms/${id}`);
};

export interface CreateTermDto {
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface UpdateTermDto {
    name?: string;
    code?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
} 
import { httpClient } from "@/lib/httpClient";
import { Term } from "@/types/common";

export const getTerms = async (): Promise<Term[]> => {
    const res = await httpClient.get('/terms');
    return res.data;
};

export const getTermById = async (id: string): Promise<Term> => {
    const res = await httpClient.get(`/terms/${id}`);
    return res.data;
};

export const createTerm = async (data: {
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}): Promise<Term> => {
    const res = await httpClient.post('/terms', data);
    return res.data;
};

export const updateTerm = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}): Promise<Term> => {
    const res = await httpClient.patch(`/terms/${id}`, data);
    return res.data;
};

export const deleteTerm = async (id: string): Promise<void> => {
    await httpClient.delete(`/terms/${id}`);
};

export interface CreateTermDto {
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface UpdateTermDto {
    name?: string;
    code?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
} 
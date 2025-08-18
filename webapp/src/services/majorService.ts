import { httpClient } from "@/lib/httpClient";
import { Major } from "@/types/common";

export const getMajors = async (): Promise<Major[]> => {
    const res = await httpClient.get('/majors');
    return res.data;
};

export const getMajorById = async (id: string): Promise<Major> => {
    const res = await httpClient.get(`/majors/${id}`);
    return res.data;
};

export const createMajor = async (data: {
    name: string;
    code: string;
    description?: string;
    departmentId: number;
}): Promise<Major> => {
    const res = await httpClient.post('/majors', data);
    return res.data;
};

export const updateMajor = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    departmentId?: number;
}): Promise<Major> => {
    const res = await httpClient.patch(`/majors/${id}`, data);
    return res.data;
};

export const deleteMajor = async (id: string): Promise<void> => {
    await httpClient.delete(`/majors/${id}`);
};

export interface CreateMajorDto {
    name: string;
    code: string;
    description?: string;
    departmentId: number;
}

export interface UpdateMajorDto {
    name?: string;
    code?: string;
    description?: string;
    departmentId?: number;
} 
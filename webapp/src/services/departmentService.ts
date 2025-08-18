import { httpClient } from "@/lib/httpClient";
import { Department } from "@/types/common";

export const getDepartments = async (): Promise<Department[]> => {
    const res = await httpClient.get('/departments');
    return res.data;
};

export const getDepartmentById = async (id: string): Promise<Department> => {
    const res = await httpClient.get(`/departments/${id}`);
    return res.data;
};

export const createDepartment = async (data: {
    name: string;
    code: string;
    description?: string;
    facultyId: number;
}): Promise<Department> => {
    const res = await httpClient.post('/departments', data);
    return res.data;
};

export const updateDepartment = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    facultyId?: number;
}): Promise<Department> => {
    const res = await httpClient.patch(`/departments/${id}`, data);
    return res.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
    await httpClient.delete(`/departments/${id}`);
};

export interface CreateDepartmentDto {
    name: string;
    code: string;
    description?: string;
    facultyId: number;
}

export interface UpdateDepartmentDto {
    name?: string;
    code?: string;
    description?: string;
    facultyId?: number;
} 
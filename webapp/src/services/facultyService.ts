import { httpClient } from "@/lib/httpClient";

export interface Faculty {
  id: number;
  name: string;
  description?: string;
}

export const getFaculties = async (): Promise<Faculty[]> => {
    const res = await httpClient.get('/users/academic/faculties');
    return res.data;
};

export const getFacultyById = async (id: string): Promise<Faculty> => {
    const res = await httpClient.get(`/faculties/${id}`);
    return res.data;
};

export const createFaculty = async (data: {
    name: string;
    code: string;
    description?: string;
}): Promise<Faculty> => {
    const res = await httpClient.post('/faculties', data);
    return res.data;
};

export const updateFaculty = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
}): Promise<Faculty> => {
    const res = await httpClient.patch(`/faculties/${id}`, data);
    return res.data;
};

export const deleteFaculty = async (id: string): Promise<void> => {
    await httpClient.delete(`/faculties/${id}`);
};

export interface CreateFacultyDto {
    name: string;
    code: string;
    description?: string;
}

export interface UpdateFacultyDto {
    name?: string;
    code?: string;
    description?: string;
}

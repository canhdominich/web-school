import { httpClient } from "@/lib/httpClient";
import { Major } from "@/types/common";

export interface SearchMajorDto {
  name?: string;
  code?: string;
  description?: string;
  departmentId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedMajorResponse {
  data: Major[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getMajors = async (searchParams?: SearchMajorDto): Promise<Major[] | PaginatedMajorResponse> => {
    const params = new URLSearchParams();
    
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/majors?${queryString}` : '/majors';
    
    const res = await httpClient.get(url);
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
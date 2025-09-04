import { httpClient } from "@/lib/httpClient";
import type { School } from "@/types/common";

export interface SearchSchoolDto {
  name?: string;
  code?: string;
  description?: string;
  address?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedSchoolResponse {
  data: School[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getSchools = async (searchParams?: SearchSchoolDto): Promise<PaginatedSchoolResponse> => {
    const params = new URLSearchParams();
    
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    // Always include default pagination if not provided
    if (!searchParams?.page) {
      params.set('page', '1');
    }
    if (!searchParams?.limit) {
      params.set('limit', '10');
    }
    
    const queryString = params.toString();
    const url = queryString ? `/schools?${queryString}` : '/schools';
    
    const res = await httpClient.get(url);
    return res.data;
};

export const getSchoolById = async (id: string): Promise<School> => {
    const res = await httpClient.get(`/schools/${id}`);
    return res.data;
};

export const createSchool = async (data: {
    name: string;
    code: string;
    description?: string;
    address?: string;
}): Promise<School> => {
    const res = await httpClient.post('/schools', data);
    return res.data;
};

export const updateSchool = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    address?: string;
}): Promise<School> => {
    const res = await httpClient.patch(`/schools/${id}`, data);
    return res.data;
};

export const deleteSchool = async (id: string): Promise<void> => {
    await httpClient.delete(`/schools/${id}`);
};

export interface CreateSchoolDto {
    name: string;
    code: string;
    description?: string;
    address?: string;
}

export interface UpdateSchoolDto {
    name?: string;
    code?: string;
    description?: string;
    address?: string;
}

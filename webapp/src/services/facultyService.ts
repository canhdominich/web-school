import { httpClient } from "@/lib/httpClient";
import type { Faculty } from "@/types/common";

export interface SearchFacultyDto {
  name?: string;
  code?: string;
  description?: string;
  schoolId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedFacultyResponse {
  data: Faculty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getFaculties = async (searchParams?: SearchFacultyDto): Promise<PaginatedFacultyResponse> => {
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
    const url = queryString ? `/faculties?${queryString}` : '/faculties';
    
    const res = await httpClient.get(url);
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
    schoolId: number;
}): Promise<Faculty> => {
    const res = await httpClient.post('/faculties', data);
    return res.data;
};

export const updateFaculty = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    schoolId?: number;
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
    schoolId: number;
}

export interface UpdateFacultyDto {
    name?: string;
    code?: string;
    description?: string;
    schoolId?: number;
}

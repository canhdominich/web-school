import { httpClient } from "@/lib/httpClient";
import type { AcademicYear } from "@/types/common";

export interface SearchAcademicYearDto {
  name?: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedAcademicYearResponse {
  data: AcademicYear[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getAcademicYears = async (searchParams?: SearchAcademicYearDto): Promise<PaginatedAcademicYearResponse> => {
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
    const url = queryString ? `/academic-years?${queryString}` : '/academic-years';
    
    const res = await httpClient.get(url);
    return res.data;
};

export const getAcademicYearById = async (id: string): Promise<AcademicYear> => {
    const res = await httpClient.get(`/academic-years/${id}`);
    return res.data;
};

export const createAcademicYear = async (data: {
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
}): Promise<AcademicYear> => {
    const res = await httpClient.post('/academic-years', data);
    return res.data;
};

export const updateAcademicYear = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}): Promise<AcademicYear> => {
    const res = await httpClient.patch(`/academic-years/${id}`, data);
    return res.data;
};

export const deleteAcademicYear = async (id: string): Promise<void> => {
    await httpClient.delete(`/academic-years/${id}`);
};

export interface CreateAcademicYearDto {
    name: string;
    code: string;
    description?: string;
    startDate: string;
    endDate: string;
}

export interface UpdateAcademicYearDto {
    name?: string;
    code?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

import { httpClient } from "@/lib/httpClient";
import { Department } from "@/types/common";

export interface SearchDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  facultyId?: number;
  schoolId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedDepartmentResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getDepartments = async (searchParams?: SearchDepartmentDto): Promise<PaginatedDepartmentResponse> => {
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
    const url = queryString ? `/departments?${queryString}` : '/departments';
    
    const res = await httpClient.get(url);
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
    schoolId: number;
}): Promise<Department> => {
    const res = await httpClient.post('/departments', data);
    return res.data;
};

export const updateDepartment = async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    facultyId?: number;
    schoolId?: number;
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
    schoolId: number;
}

export interface UpdateDepartmentDto {
    name?: string;
    code?: string;
    description?: string;
    facultyId?: number;
    schoolId?: number;
} 
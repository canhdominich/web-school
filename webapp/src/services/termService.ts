import { httpClient } from "@/lib/httpClient";
import { Term, TermStatus } from "@/types/common";

export interface SearchTermDto {
  name?: string;
  code?: string;
  description?: string;
  status?: TermStatus;
  startDate?: string;
  endDate?: string;
  academicYearId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedTermResponse {
  data: Term[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getTerms = async (searchParams?: SearchTermDto): Promise<PaginatedTermResponse> => {
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
    const url = queryString ? `/terms?${queryString}` : '/terms';
    
    const res = await httpClient.get(url);
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
    status: TermStatus;
    academicYearId?: number;
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
    status?: TermStatus;
    academicYearId?: number;
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
    status: TermStatus;
    academicYearId?: number;
}

export interface UpdateTermDto {
    name?: string;
    code?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: TermStatus;
    academicYearId?: number;
} 
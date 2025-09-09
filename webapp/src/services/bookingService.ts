import { httpClient } from '@/lib/httpClient';
import { User } from '@/types/common';
import { ProjectEntity } from './projectService';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED_BY_LECTURER = 'approved_by_lecturer',
  APPROVED_BY_FACULTY_DEAN = 'approved_by_faculty_dean',
  APPROVED_BY_RECTOR = 'approved_by_rector',
  REJECTED = 'rejected',
}

export type Project = ProjectEntity;

export interface Booking {
  id: number;
  time: string;
  projectId: number;
  studentId: number;
  status: BookingStatus;
  approvedByLecturerId?: number;
  approvedByFacultyDeanId?: number;
  approvedByRectorId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relations
  project?: Project;
  student?: User;
  approvedByLecturer?: User;
  approvedByFacultyDean?: User;
  approvedByRector?: User;
}

export interface CreateBookingDto {
  time: string;
  projectId: number;
  studentId: number;
}

export interface UpdateBookingDto {
  time?: string;
  projectId?: number;
  studentId?: number;
}

export interface SearchBookingDto {
  projectId?: number;
  studentId?: number;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApproveBookingDto {
  status: BookingStatus.APPROVED_BY_LECTURER | BookingStatus.APPROVED_BY_FACULTY_DEAN | BookingStatus.APPROVED_BY_RECTOR | BookingStatus.REJECTED;
}

export interface PaginatedBookingResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Functions
export const createBooking = async (data: CreateBookingDto): Promise<Booking> => {
  const response = await httpClient.post('/bookings', data);
  return response.data;
};

export const getBookings = async (searchParams?: SearchBookingDto): Promise<Booking[] | PaginatedBookingResponse> => {
  const response = await httpClient.get('/bookings', { params: searchParams });
  return response.data;
};

export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await httpClient.get(`/bookings/${id}`);
  return response.data;
};

export const updateBooking = async (id: number, data: UpdateBookingDto): Promise<Booking> => {
  const response = await httpClient.patch(`/bookings/${id}`, data);
  return response.data;
};

export const deleteBooking = async (id: number): Promise<void> => {
  await httpClient.delete(`/bookings/${id}`);
};

export const approveByLecturer = async (id: number, data: ApproveBookingDto): Promise<Booking> => {
  const response = await httpClient.post(`/bookings/${id}/approve/lecturer`, data);
  return response.data;
};

export const approveByFacultyDean = async (id: number, data: ApproveBookingDto): Promise<Booking> => {
  const response = await httpClient.post(`/bookings/${id}/approve/faculty-dean`, data);
  return response.data;
};

export const approveByRector = async (id: number, data: ApproveBookingDto): Promise<Booking> => {
  const response = await httpClient.post(`/bookings/${id}/approve/rector`, data);
  return response.data;
};

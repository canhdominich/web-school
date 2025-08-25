export interface CouncilMember {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface CouncilFaculty {
  id: number;
  name: string;
}

export interface Council {
  id: number;
  name: string;
  description?: string;
  status: CouncilStatus;
  facultyId?: number;
  faculty?: CouncilFaculty;
  createdAt: string;
  updatedAt: string;
  members: CouncilMember[];
}

export type CouncilStatus = 'active' | 'inactive' | 'archived';

export interface CreateCouncilDto {
  name: string;
  description?: string;
  status?: CouncilStatus;
  facultyId?: number;
  memberIds: number[];
}

export interface UpdateCouncilDto {
  name?: string;
  description?: string;
  status?: CouncilStatus;
  facultyId?: number;
  memberIds?: number[];
}

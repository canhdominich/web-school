export interface RequestUser {
  id: number;
  email: string;
  name: string;
  roles: string[];
  facultyId: number;
  departmentId: number;
  majorId: number;
}

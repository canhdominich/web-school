export enum UserRole {
  Student = "Student",
  Lecturer = "Lecturer", 
  DepartmentHead = "DepartmentHead",
  FacultyDean = "FacultyDean",
  Rector = "Rector",
  Council = "Council",
  Admin = "Admin",
}

export enum UserStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export const UserStatusOptions = [
  { value: UserStatus.Active, label: "Active" },
  { value: UserStatus.Inactive, label: "Inactive" },
];

export const UserRoleOptions = [
  { value: UserRole.Student, label: "Sinh viên" },
  { value: UserRole.Lecturer, label: "Giảng viên" },
  { value: UserRole.DepartmentHead, label: "Chủ nhiệm bộ môn" },
  { value: UserRole.FacultyDean, label: "Trưởng khoa" },
  { value: UserRole.Rector, label: "Phòng đào tạo" },
  { value: UserRole.Council, label: "Hội đồng" },
  { value: UserRole.Admin, label: "Quản trị viên" },
];


import { httpClient } from "@/lib/httpClient";
import { Department, Faculty, IUserRole, Major, User } from "@/types/common";

export const getUsers = async (): Promise<User[]> => {
    const res = await httpClient.get('/users');
    return res.data;
};

export const getLecturers = async (): Promise<User[]> => {
    const res = await httpClient.get('/users');
    const users = res.data;
    // Filter only lecturers
    return users.filter((user: User) => 
        (user.userRoles ?? []).some((userRole: IUserRole) => userRole.role.name === 'Lecturer')
    );
};

export const getUserById = async (id: string): Promise<User> => {
    const res = await httpClient.get(`/users/${id}`);
    return res.data;
};

export const createUser = async (data: {
    name: string
    email: string
    phone: string
    password: string
    roles: string[]
    facultyId?: number
    departmentId?: number
    majorId?: number
}): Promise<User> => {
    const res = await httpClient.post('/users', data)
    return res.data
}

export const updateUser = async (id: string, data: {
    name?: string
    email?: string
    phone?: string
    password?: string
    roles?: string[]
    avatar?: string
    facultyId?: number
    departmentId?: number
    majorId?: number
}): Promise<User> => {
    const res = await httpClient.patch(`/users/${id}`, data)
    return res.data
}

export const deleteUser = async (id: string): Promise<void> => {
    await httpClient.delete(`/users/${id}`)
}

// Academic information APIs
export const getFaculties = async (): Promise<Faculty[]> => {
    const res = await httpClient.get('/users/academic/faculties');
    return res.data;
};

export const getDepartments = async (facultyId?: number): Promise<Department[]> => {
    const params = facultyId ? { facultyId } : {};
    const res = await httpClient.get('/users/academic/departments', { params });
    return res.data;
};

export const getMajors = async (departmentId?: number): Promise<Major[]> => {
    const params = departmentId ? { departmentId } : {};
    const res = await httpClient.get('/users/academic/majors', { params });
    return res.data;
};

export interface CreateUserDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    roles: string[];
    facultyId?: number;
    departmentId?: number;
    majorId?: number;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    roles?: string[];
    avatar?: string;
    facultyId?: number;
    departmentId?: number;
    majorId?: number;
}

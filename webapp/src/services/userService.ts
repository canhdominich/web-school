import { httpClient } from "@/lib/httpClient";
import { User } from "@/types/common";

export const getUsers = async (): Promise<User[]> => {
    const res = await httpClient.get('/users');
    return res.data;
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
}): Promise<User> => {
    const res = await httpClient.patch(`/users/${id}`, data)
    return res.data
}

export const deleteUser = async (id: string): Promise<void> => {
    await httpClient.delete(`/users/${id}`)
}

export interface CreateUserDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    roles: string[];
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    roles?: string[];
    avatar?: string;
}

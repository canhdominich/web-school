import { httpClient } from "@/lib/httpClient";

export const login = async (email: string, password: string) => {
    const res = await httpClient.post('/auth/login', { email, password });
    return res.data;
};

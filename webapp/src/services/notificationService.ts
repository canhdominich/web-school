import { httpClient } from "@/lib/httpClient";

export interface Notification {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export const getNotifications = async (): Promise<Notification[]> => {
    const res = await httpClient.get('/notifications');
    return res.data;
};

export const getNotificationById = async (id: string): Promise<Notification> => {
    const res = await httpClient.get(`/notifications/${id}`);
    return res.data;
};

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const res = await httpClient.get(`/notifications/user/${userId}`);
    return res.data;
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
    const res = await httpClient.get('/notifications/unread');
    return res.data;
};

export const createNotification = async (data: {
    title: string;
    content: string;
    type: 'info' | 'warning' | 'error' | 'success';
    userId: string;
}): Promise<Notification> => {
    const res = await httpClient.post('/notifications', data);
    return res.data;
};

export const updateNotification = async (id: string, data: {
    title?: string;
    content?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    isRead?: boolean;
}): Promise<Notification> => {
    const res = await httpClient.patch(`/notifications/${id}`, data);
    return res.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
    const res = await httpClient.patch(`/notifications/${id}/read`);
    return res.data;
};

export const markAllAsRead = async (): Promise<void> => {
    await httpClient.patch('/notifications/read-all');
};

export const deleteNotification = async (id: string): Promise<void> => {
    await httpClient.delete(`/notifications/${id}`);
};

export interface CreateNotificationDto {
    title: string;
    content: string;
    type: 'info' | 'warning' | 'error' | 'success';
    userId: string;
}

export interface UpdateNotificationDto {
    title?: string;
    content?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    isRead?: boolean;
} 
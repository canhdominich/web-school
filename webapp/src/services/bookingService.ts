import { httpClient } from "@/lib/httpClient";

export const getBookings = async () => {
    const res = await httpClient.get('/bookings');
    return res.data;
};

export const getBookingById = async (id: number) => {
    const res = await httpClient.get(`/bookings/${id}`);
    return res.data;
};

export const createBooking = async (data: {
    userId: number
    vehicleId: number
    parkingLotId: number
    slotId: number
    checkinTime: string
}) => {
    const res = await httpClient.post('/bookings', data)
    return res.data
}

export const updateBooking = async (id: number, data: {
    userId?: number
    vehicleId?: number
    parkingLotId?: number
    slotId?: number
    checkinTime?: string
}) => {
    const res = await httpClient.patch(`/bookings/${id}`, data)
    return res.data
}

export const deleteBooking = async (id: number) => {
    const res = await httpClient.delete(`/bookings/${id}`)
    return res.data
}

export const getDashboardStats = async () => {
    const res = await httpClient.get('/bookings/dashboard/statistics')
    return res.data
}

export interface CreateBookingDto {
    userId: number;
    vehicleId: number;
    parkingLotId: number;
    slotId: number;
    checkinTime: string;
    checkoutTime?: string;
    status: string;
    paymentStatus: string;
}

export interface UpdateBookingDto {
    userId?: number;
    vehicleId?: number;
    parkingLotId?: number;
    slotId?: number;
    checkinTime?: string;
    checkoutTime?: string;
    status?: string;
    paymentStatus?: string;
}

export interface Booking {
    id: number;
    userId: number;
    note?: string;
    user?: {
        id: number;
        name: string;
        phone: string;
        email: string;
        password: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    };
    vehicleId: number;
    vehicle?: {
        id: number;
        userId: number;
        licensePlate: string;
        model: string;
        color: string;
        vehicleType: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
    parkingLotId: number;
    parkingLot?: {
        id: number;
        name: string;
        location: string;
        openTime: string;
        closeTime: string;
        totalSlots: number;
        createdAt: Date;
        updatedAt: Date;
    };
    slotId: number;
    slot?: {
        id: number;
        name: string;
        parkingLotId: number;
        vehicleType: string;
        status: string;
        lastUpdated: Date;
        createdAt: Date;
        updatedAt: Date;
    };
    checkinTime: string;
    checkoutTime?: string | null;
    status?: string;
    totalPrice?: string;
    paymentStatus?: string;
    createdAt: Date;
    updatedAt: Date;
}

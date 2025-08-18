import { httpClient } from "@/lib/httpClient";

export const getParkingLots = async () => {
    const res = await httpClient.get('/parking-lots');
    return res.data;
};

export const getParkingLotById = async (id: string) => {
    const res = await httpClient.get(`/parking-lots/${id}`);
    return res.data;
};

export const createParkingLot = async (data: {
    name: string
    location: string
    openTime: string
    closeTime: string
    totalSlots: number
}) => {
    const res = await httpClient.post('/parking-lots', data)
    return res.data
}

export const updateParkingLot = async (id: string, data: {
    name?: string
    location?: string
    openTime?: string
    closeTime?: string
    totalSlots?: number
}) => {
    const res = await httpClient.patch(`/parking-lots/${id}`, data)
    return res.data
}

export const deleteParkingLot = async (id: string) => {
    const res = await httpClient.delete(`/parking-lots/${id}`)
    return res.data
}

export interface CreateParkingLotDto {
    name: string;
    location: string;
    openTime: string;
    closeTime: string;
    totalSlots: number;
}

export interface UpdateParkingLotDto {
    name?: string;
    location?: string;
    openTime?: string;
    closeTime?: string;
    totalSlots?: number;
}

export interface ParkingLot {
    id: number;
    name: string;
    location: string;
    openTime: string;
    closeTime: string;
    totalSlots: number;
    createdAt: Date;
    updatedAt: Date;
}

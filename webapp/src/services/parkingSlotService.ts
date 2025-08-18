import { httpClient } from "@/lib/httpClient";

export const getParkingSlots = async () => {
    const res = await httpClient.get('/parking-slots');
    return res.data;
};

export const getParkingSlotById = async (id: string) => {
    const res = await httpClient.get(`/parking-slots/${id}`);
    return res.data;
};

export const createParkingSlot = async (data: {
    name: string
    parkingLotId: number
    vehicleType: string
    status: string
}) => {
    const res = await httpClient.post('/parking-slots', data)
    return res.data
}

export const updateParkingSlot = async (id: string, data: {
    name?: string
    parkingLotId?: number
    vehicleType?: string
    status?: string
}) => {
    const res = await httpClient.patch(`/parking-slots/${id}`, data)
    return res.data
}

export const deleteParkingSlot = async (id: string) => {
    const res = await httpClient.delete(`/parking-slots/${id}`)
    return res.data
}

export const getParkingSlotByParkingLotId = async (parkingLotId: number) => {
    const res = await httpClient.get(`/parking-slots/parking-lot/${parkingLotId}`);
    return res.data;
};

export const getParkingSlotByVehicleType = async (vehicleType: string) => {
    const res = await httpClient.get(`/parking-slots/vehicle-type/${vehicleType}`);
    return res.data;
};

export interface CreateParkingSlotDto {
    name: string;
    parkingLotId: number;
    vehicleType: string;
    status: string;
}

export interface UpdateParkingSlotDto {
    name?: string;
    parkingLotId?: number;
    vehicleType?: string;
    status?: string;
}

export interface ParkingSlot {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    id: number;
    name: string;
    parkingLotId: number;
    vehicleType: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

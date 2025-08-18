import { httpClient } from "@/lib/httpClient";
import { VehicleType } from "@/constants/vehicle.constant";

export interface Vehicle {
  id: number;
  licensePlate: string;
  vehicleType: VehicleType;
  model: string;
  color: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  licensePlate: string;
  vehicleType: VehicleType;
  model: string;
  color: string;
  status?: string;
  userId?: number;
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  vehicleType?: VehicleType;
  model?: string;
  color?: string;
  status?: string;
  userId?: number;
}

export const getVehicles = async () => {
  const res = await httpClient.get("/vehicles");
  return res.data;
};

export const getVehicle = async (id: number) => {
  const res = await httpClient.get(`/vehicles/${id}`);
  return res.data;
};

export const getVehiclesByUser = async (userId: number) => {
  const res = await httpClient.get(`/vehicles/user/${userId}`);
  return res.data;
};

export const getVehiclesByType = async (vehicleType: VehicleType) => {
  const res = await httpClient.get(`/vehicles/type/${vehicleType}`);
  return res.data;
};

export const getActiveVehiclesByType = async (vehicleType: VehicleType) => {
  const res = await httpClient.get(`/vehicles/type/${vehicleType}/active`);
  return res.data;
};

export const createVehicle = async (data: CreateVehicleDto) => {
  const res = await httpClient.post("/vehicles", data);
  return res.data;
};

export const updateVehicle = async (id: number, data: UpdateVehicleDto) => {
  const res = await httpClient.patch(`/vehicles/${id}`, data);
  return res.data;
};

export const deleteVehicle = async (id: number) => {
  const res = await httpClient.delete(`/vehicles/${id}`);
  return res.data;
};

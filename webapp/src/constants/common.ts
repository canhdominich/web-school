
export enum ParkingSlotStatus {
    Available = "Available",
    Occupied = "Occupied",
}

export const ParkingSlotStatusOptions = [
    { value: ParkingSlotStatus.Available, label: "Còn trống" },
    { value: ParkingSlotStatus.Occupied, label: "Đã được đặt" },
];

// Constant for very large number to get all records
export const VERY_BIG_NUMBER = 1000000;


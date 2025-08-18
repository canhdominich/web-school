
export enum ParkingSlotStatus {
    Available = "Available",
    Occupied = "Occupied",
}

export const ParkingSlotStatusOptions = [
    { value: ParkingSlotStatus.Available, label: "Còn trống" },
    { value: ParkingSlotStatus.Occupied, label: "Đã được đặt" },
];


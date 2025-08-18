"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ParkingSlotDataTable from "@/components/parking-slot/ParkingSlotDataTable";
import { getParkingLots, ParkingLot } from "@/services/parkingLotService";
import { ParkingSlot, getParkingSlots } from "@/services/parkingSlotService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ParkingSlotPage() {
  const headers = [
    { key: "name", title: "Tên chỗ đỗ" },
    { key: "vehicleType", title: "Loại xe" },
    { key: "status", title: "Trạng thái" },
    { key: "booking", title: "Biển số xe" },
    { key: "parkingLotId", title: "Bãi xe" },
    { key: "address", title: "Địa chỉ" },
    { key: "action", title: "Hành động" },
  ];

  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchParkingSlots = async () => {
    try {
      setIsLoading(true);
      const data = await getParkingSlots();
      setParkingSlots(data);
    } catch {
      toast.error("Không thể tải danh sách chỗ đỗ");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParkingLots = async () => {
    try {
      setIsLoading(true);
      const data = await getParkingLots();
      setParkingLots([
        {
          id: 0,
          name: "Tên bãi xe",
        },
        ...data,
      ]);
    } catch {
      toast.error("Không thể tải danh sách bãi xe");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingSlots();
    fetchParkingLots();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý chỗ đỗ" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <ParkingSlotDataTable 
              headers={headers} 
              items={parkingSlots} 
              onRefresh={fetchParkingSlots}
              parkingLots={parkingLots}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}

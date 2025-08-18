"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ParkingLotDataTable from "@/components/parking-lot/ParkingLotDataTable";
import { ParkingLot, getParkingLots } from "@/services/parkingLotService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ParkingLotPage() {
  const headers = [
    { key: "name", title: "Tên bãi xe" },
    { key: "location", title: "Vị trí" },
    { key: "openTime", title: "Giờ mở cửa" },
    { key: "closeTime", title: "Giờ đóng cửa" },
    { key: "totalSlots", title: "Tổng chỗ" },
    { key: "checkedInCount", title: "Chỗ đang gửi" },
    { key: "totalEmptySlots", title: "Chỗ trống" },
    { key: "action", title: "Hành động" },
  ];

  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchParkingLots = async () => {
    try {
      setIsLoading(true);
      const data = await getParkingLots();
      setParkingLots(data);
    } catch {
      toast.error("Không thể tải danh sách bãi xe");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý bãi xe" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <ParkingLotDataTable 
              headers={headers} 
              items={parkingLots as (ParkingLot & { checkedInCount: number; totalEmptySlots: number })[]} 
              onRefresh={fetchParkingLots}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}

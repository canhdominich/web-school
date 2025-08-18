"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getParkingLots, ParkingLot } from "@/services/parkingLotService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BookingDataTable from "@/components/booking/Booking";
import { getUsers } from "@/services/userService";
import { User } from "@/services/userService";
import { getBookings } from "@/services/bookingService";
import { Booking } from "@/services/bookingService";

export default function ParkingSlotPage() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);    
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error("Không thể tải danh sách người gửi");
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch {
      toast.error("Không thể tải danh sách đặt chỗ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
    fetchUsers();
    fetchBookings();
  }, []);

  const onRefresh = () => {
    fetchParkingLots();
    fetchUsers();
    fetchBookings();
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Đặt chỗ giữ xe" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <BookingDataTable
              parkingLots={parkingLots}
              users={users}
              onRefresh={onRefresh}
              bookings={bookings}
              vehicles={[]}
              parkingSlots={[]}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}

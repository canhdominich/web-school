"use client";
import BookingStatusDataTable from "@/components/booking-status/BookingStatusDataTable";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { UserRole } from "@/constants/user.constant";
import { getBookings } from "@/services/bookingService";
import { Booking } from "@/services/bookingService";
import { ParkingLot, getParkingLots } from "@/services/parkingLotService";
import { getUsers } from "@/services/userService";
import { User } from '@/types/common';
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { hasRole } from '@/utils/user.utils';

export default function BookingStatusPage() {
  const headers = [
    { key: "parkingLotName", title: "Bãi xe" },
    { key: "slotName", title: "Chỗ đỗ" },
    { key: "vehiclePlate", title: "Biển số xe" },
    { key: "checkinTime", title: "Thời gian vào" },
    { key: "checkoutTime", title: "Thời gian ra" },
    { key: "status", title: "Trạng thái" },
    { key: "totalPrice", title: "Tiền thu" },
    { key: "paymentStatus", title: "Trạng thái thanh toán" },
    { key: "action", title: "Hành động" }
  ];

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
  };

  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle={hasRole(user, UserRole.Student) ? "Lịch sử đặt chỗ" : "Quản lý vào ra"} />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <BookingStatusDataTable
              headers={headers}
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

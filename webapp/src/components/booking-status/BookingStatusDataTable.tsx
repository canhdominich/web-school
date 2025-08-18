"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Header, User } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { ParkingLot } from "@/services/parkingLotService";
import axios from "axios";
import { Booking, createBooking, CreateBookingDto, deleteBooking, getBookingById, updateBooking, UpdateBookingDto } from "@/services/bookingService";
import { getParkingSlotByParkingLotId, ParkingSlot } from "@/services/parkingSlotService";
import { getVehiclesByUser, Vehicle } from "@/services/vehicleService";
import { BookingPaymentStatusOptions, BookingPaymentStatus, BookingPaymentStatusType, BookingStatus, BookingStatusOptions, BookingStatusType } from "@/constants/booking.constant";
import { UserRole } from "@/constants/user.constant";
import { ChevronDownIcon } from "@/icons";
import DatePicker from "../form/date-picker";
import Select from "../form/Select";
import moment from "moment";
import Badge from "../ui/badge/Badge";
import { createVNPayPaymentUrl } from "@/services/paymentService";

interface BookingStatusDataTableProps {
  onRefresh: () => void;
  bookings: Booking[];
  users: User[];
  vehicles: Vehicle[];
  parkingLots: ParkingLot[];
  parkingSlots: ParkingSlot[];
  headers: Header[];
}

export default function BookingStatusDataTable({ onRefresh, headers, bookings, users, vehicles: initialVehicles, parkingLots, parkingSlots: initialParkingSlots }: BookingStatusDataTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateBookingDto | UpdateBookingDto>({
    userId: 0,
    vehicleId: 0,
    parkingLotId: 0,
    slotId: 0,
    checkinTime: "",
    checkoutTime: "",
    status: BookingStatus.Pending,
    paymentStatus: BookingPaymentStatus.Unpaid
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(initialParkingSlots);
  const { isOpen, openModal, closeModal } = useModal();
  const [isPaying, setIsPaying] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.userRoles?.some(ur => ur.role.name === UserRole.Student)) {
        setFormData(prev => ({
          ...prev,
          userId: parsedUser.id.toString()
        }));
      }
    }
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedBooking(null);
      setFormData({
        userId: 0,
        vehicleId: 0,
        parkingLotId: 0,
        slotId: 0,
        checkinTime: "",
        checkoutTime: "",
      });
      setVehicles(initialVehicles);
      setParkingSlots(initialParkingSlots);
    }
  }, [isOpen, initialVehicles, initialParkingSlots]);

  // Update form data and fetch related data when selected Booking changes
  useEffect(() => {
    if (selectedBooking) {
      setFormData({
        userId: selectedBooking.userId,
        vehicleId: selectedBooking.vehicleId,
        parkingLotId: selectedBooking.parkingLotId,
        slotId: selectedBooking.slotId,
        checkinTime: selectedBooking.checkinTime,
        checkoutTime: selectedBooking.checkoutTime ?? "",
        status: selectedBooking.status,
        paymentStatus: selectedBooking.paymentStatus
      });

      // Fetch vehicles for selected user
      const fetchUserVehicles = async () => {
        try {
          const userVehicles = await getVehiclesByUser(selectedBooking.userId);
          setVehicles(userVehicles);
        } catch (error) {
          console.log(error);
          alert("Không thể lấy danh sách phương tiện");
          setVehicles([]);
        }
      };

      // Fetch parking slots for selected parking lot
      const fetchParkingSlots = async () => {
        try {
          const slots = await getParkingSlotByParkingLotId(selectedBooking.parkingLotId);
          setParkingSlots(slots);
        } catch (error) {
          console.log(error);
          alert("Không thể lấy danh sách chỗ đỗ");
          setParkingSlots([]);
        }
      };

      fetchUserVehicles();
      fetchParkingSlots();
    }
  }, [selectedBooking]);


  const handleSelectUserChange = async (value: string) => {
    const userId = parseInt(value);
    setFormData({ ...formData, userId, vehicleId: 0 }); // Reset vehicleId when user changes

    try {
      const userVehicles = await getVehiclesByUser(userId);
      setVehicles([
        {
          id: 0,
          licensePlate: "Chọn phương tiện",
        },
        ...userVehicles,
      ]);
    } catch (error) {
      console.log(error);
      alert("Không thể lấy danh sách phương tiện");
      setVehicles([]);
    }
  };

  const handleSelectVehicleChange = (value: string) => {
    setFormData({ ...formData, vehicleId: parseInt(value) });
  };

  const handleSelectStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as BookingStatusType });
  };

  const handleSelectPaymentStatusChange = (value: string) => {
    setFormData({ ...formData, paymentStatus: value as BookingPaymentStatusType });
  };

  const handleSelectParkingLotChange = async (value: string) => {
    const parkingLotId = parseInt(value);
    setFormData({ ...formData, parkingLotId, slotId: 0 }); // Reset slotId when parking lot changes

    try {
      const slots = await getParkingSlotByParkingLotId(parkingLotId);
      setParkingSlots([
        {
          id: 0,
          name: "Chọn vị trí đỗ xe",
        },
        ...slots,
      ]);
    } catch (error) {
      console.log(error);
      alert("Không thể lấy danh sách chỗ đỗ");
      setParkingSlots([]);
    }
  };

  const handleSelectParkingSlotChange = (value: string) => {
    setFormData({ ...formData, slotId: parseInt(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedBooking?.id) {
        await updateBooking(selectedBooking.id, formData as UpdateBookingDto);
      } else {
        await createBooking(formData as CreateBookingDto);
      }
      closeModal();
      onRefresh();
    } catch {
      alert(selectedBooking?.id ? "Không thể cập nhật đặt chỗ" : "Không thể Đặt chỗ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const booking = await getBookingById(id);
      if (booking) {
        setSelectedBooking(booking);
        setFormData({
          userId: booking.userId,
          vehicleId: booking.vehicleId,
          parkingLotId: booking.parkingLotId,
          slotId: booking.slotId,
          checkinTime: moment(booking.checkinTime).format("YYYY-MM-DD HH:mm:00"),
          checkoutTime: booking.checkoutTime ? moment(booking.checkoutTime).format("YYYY-MM-DD HH:mm:00") : "",
        });
        openModal();
      }
    } catch (error) {
      console.log(error);
      alert("Không thể lấy thông tin đặt chỗ");
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa đặt chỗ này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteBooking(id);
      closeModal();
      onRefresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverError = error.response.data;
        alert(serverError.message || "Không thể xóa đặt chỗ");
      } else {
        alert("Không thể xóa đặt chỗ");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getBookingPaymentStatusLabel = (paymentStatus: BookingPaymentStatusType) => {
    switch (paymentStatus) {
      case BookingPaymentStatus.Paid:
        return "Đã thanh toán";
      case BookingPaymentStatus.Unpaid:
        return "Chưa thanh toán";
      default:
        return "Không xác định";
    }
  };

  const getBookingStatusLabel = (status: BookingStatusType) => {
    switch (status) {
      case BookingStatus.Pending:
        return "Đang chờ";
      case BookingStatus.Booked:
        return "Đã đặt chỗ";
      case BookingStatus.CheckedIn:
        return "Đã check-in";
      case BookingStatus.CheckedOut:
        return "Đã check-out";
      case BookingStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };
  const handlePay = async (booking: Booking) => {
    if (isPaying) return;

    try {
      setIsPaying(true);

      if (!booking?.id || !booking.totalPrice) {
        alert("Thiếu thông tin thanh toán");
        return;
      }

      const paymentUrl = await createVNPayPaymentUrl(booking.id, Number(booking.totalPrice) * 100);
      console.log("paymentUrl =", paymentUrl);

      window.location.href = paymentUrl;
    } catch (error) {
      console.error(error);
      alert('Không thể thanh toán');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {
        user?.userRoles?.some(ur => ur.role.name !== UserRole.Student) && (
          <div className="mb-6 px-5 flex items-center gap-3 modal-footer sm:justify-start">
            <button
              onClick={openModal}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Đặt chỗ
            </button>
          </div>
        )
      }

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {(user?.userRoles?.some(ur => ur.role.name === UserRole.Student) ? headers.slice(0, -1) : headers).map((header, index) => (
                  <TableCell
                    key={header.key}
                    isHeader
                    className={
                      index === 0
                        ? "px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400"
                        : "px-5 py-3 font-medium text-center text-theme-sm dark:text-gray-400"
                    }
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {bookings.map((item: Booking) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item?.parkingLot?.name ?? ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item?.slot?.name ?? ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item?.vehicle?.licensePlate ?? ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item?.checkinTime ? moment(item?.checkinTime).format("DD/MM/YYYY HH:mm") : ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item?.checkoutTime ? moment(item?.checkoutTime).format("DD/MM/YYYY HH:mm") : ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        item.status === BookingStatus.Pending
                          ? "warning"
                          : item.status === BookingStatus.Booked
                            ? "success"
                            : item.status === BookingStatus.CheckedIn
                              ? "info"
                              : item.status === BookingStatus.CheckedOut
                                ? "success"
                                : "error"
                      }
                    >
                      {getBookingStatusLabel(item.status as BookingStatusType)}
                    </Badge>
                    <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {item?.note ?? ""}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item?.totalPrice ? formatCurrency(Number(item.totalPrice)) : ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        item.paymentStatus === BookingPaymentStatus.Paid
                          ? "success"
                          : "error"
                      }
                    >
                      {getBookingPaymentStatusLabel(item.paymentStatus as BookingPaymentStatusType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    {user?.userRoles?.some(ur => ur.role.name !== UserRole.Student) && (
                      <div className="flex items-center gap-3">
                        {item.paymentStatus === BookingPaymentStatus.Unpaid && item.status !== BookingStatus.Cancelled && (
                          <button
                            onClick={() => handlePay(item)}
                            type="button"
                            disabled={isPaying}
                            className="btn btn-warning btn-update-event flex w-full justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 sm:w-auto"
                          >
                            T.Toán
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(item.id)}
                          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                          C.Nhật
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedBooking ? "Chi tiết đặt chỗ" : "Đặt chỗ"}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nền tảng quản lý đề tài & hợp tác nghiên cứu trong trường đại học
                </p>
              </div>
              <div className="mt-8">
                <div className="mt-1">
                  <div className="relative">
                    <DatePicker
                      id="date-picker-checkin"
                      placeholder="Thời gian vào"
                      onChange={(dates, currentDateString) => {
                        console.log({ dates, currentDateString });
                        if (dates && dates[0]) {
                          const date = dates[0];
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:00`;
                          setFormData(prev => ({
                            ...prev,
                            checkinTime: formattedDate
                          }));
                        }
                      }}
                      defaultDate={moment(formData.checkinTime).format("YYYY-MM-DD HH:mm")}
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <div className="mt-1">
                    <div className="relative">
                      <DatePicker
                        id="date-picker-checkout"
                        placeholder="Thời gian ra"
                        onChange={(dates, currentDateString) => {
                          console.log({ dates, currentDateString });
                          if (dates && dates[0]) {
                            const date = dates[0];
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:00`;
                            setFormData(prev => ({
                              ...prev,
                              checkoutTime: formattedDate
                            }));
                          }
                        }}
                        defaultDate={moment(formData.checkoutTime).format("YYYY-MM-DD HH:mm")}
                      />
                    </div>
                  </div>
                  <div className="mb-8 mt-12">
                    <div className="relative">
                      <Select
                        value={formData.userId?.toString() || "0"}
                        onChange={handleSelectUserChange}
                        options={[
                          {
                            value: "0",
                            label: "Tên người gửi",
                          },
                          ...(user?.userRoles?.some(ur => ur.role.name === UserRole.Student)
                            ? users
                              .filter(u => u.id === user?.id)
                              .map(u => ({
                                value: u.id.toString(),
                                label: u.name,
                              }))
                            : users
                              .filter(u => u.userRoles?.some(ur => ur.role.name === UserRole.Student))
                              .map(u => ({
                                value: u.id.toString(),
                                label: u.name,
                              })))
                        ]}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="relative">
                      <Select
                        value={formData.vehicleId?.toString() || ""}
                        options={vehicles.map((vehicle) => ({
                          value: vehicle.id.toString(),
                          label: vehicle.licensePlate,
                        }))}
                        onChange={handleSelectVehicleChange}
                        className="dark:bg-dark-900"
                        disabled={!formData.userId}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="relative">
                      <Select
                        value={formData.parkingLotId?.toString() || ""}
                        options={[
                          {
                            value: "0",
                            label: "Chọn bãi xe",
                          },
                          ...parkingLots.map((lot) => ({
                            value: lot.id.toString(),
                            label: lot.name,
                          })),
                        ]}
                        onChange={handleSelectParkingLotChange}
                        className="dark:bg-dark-900"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="relative">
                      <Select
                        value={formData.slotId?.toString() || ""}
                        options={parkingSlots.map((slot) => ({
                          value: slot.id.toString(),
                          label: slot.name,
                        }))}
                        onChange={handleSelectParkingSlotChange}
                        className="dark:bg-dark-900"
                        disabled={!formData.parkingLotId}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </div>
                  {
                    user?.userRoles?.some(ur => ur.role.name !== UserRole.Student) && (
                      <div className="mb-8">
                        <div className="relative">
                          <Select
                            value={formData.status?.toString() || ""}
                            options={[
                              {
                                value: "",
                                label: "Trạng thái",
                              },
                              ...BookingStatusOptions
                            ]}
                            onChange={handleSelectStatusChange}
                            className="dark:bg-dark-900"
                          />
                          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <ChevronDownIcon />
                          </span>
                        </div>
                      </div>
                    )
                  }
                  {
                    user?.userRoles?.some(ur => ur.role.name !== UserRole.Student) && (
                      <div className="mb-8">
                        <div className="relative">
                          <Select
                            value={formData.paymentStatus?.toString() || ""}
                            options={[
                              {
                                value: "",
                                label: "Trạng thái thanh toán",
                              },
                              ...BookingPaymentStatusOptions
                            ]}
                            onChange={handleSelectPaymentStatusChange}
                            className="dark:bg-dark-900"
                          />
                          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <ChevronDownIcon />
                          </span>
                        </div>
                      </div>
                    )
                  }
                </div>
                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                  <button
                    onClick={closeModal}
                    type="button"
                    className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                  >
                    Đóng
                  </button>

                  {selectedBooking && selectedBooking.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(selectedBooking.id)}
                        type="button"
                        disabled={isSubmitting}
                        className="btn btn-danger btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={handleSubmit}
                        type="button"
                        disabled={isSubmitting}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                      >
                        {isSubmitting ? "Đang xử lý..." : selectedBooking ? "Cập nhật" : "Thêm mới"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      type="button"
                      disabled={isSubmitting}
                      className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                    >
                      {isSubmitting ? "Đang xử lý..." : selectedBooking ? "Cập nhật" : "Thêm mới"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

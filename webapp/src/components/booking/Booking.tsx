"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Select from "../form/Select";
import { CreateBookingDto, UpdateBookingDto, createBooking, updateBooking, deleteBooking, getBookingById } from "@/services/bookingService";
import { ParkingLot } from "@/services/parkingLotService";
import { ChevronDownIcon } from "@/icons";
import { getParkingSlotByParkingLotId, ParkingSlot } from "@/services/parkingSlotService";
import DatePicker from "../form/date-picker";
import { IUserRole, User } from "@/types/common";
import { Vehicle } from "@/services/vehicleService";
import { getVehiclesByUser } from "@/services/vehicleService";
import { Booking } from "@/services/bookingService";
import { BookingPaymentStatus, BookingPaymentStatusOptions, BookingPaymentStatusType, BookingStatus, BookingStatusOptions, BookingStatusType } from "@/constants/booking.constant";
import moment from "moment";
import axios from "axios";
import { UserRole } from "@/constants/user.constant";
import { createVNPayPaymentUrl, handleVNPayWebhook } from "@/services/paymentService";
import { useSearchParams } from 'next/navigation';

interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  extendedProps: {
    calendar: string;
  };
}

const mapBookingToEvent = (booking: Booking): CalendarEvent => ({
  id: booking.id.toString(),
  title: booking.vehicle?.licensePlate || "Không có biển số",
  start: moment(booking.checkinTime).format("YYYY-MM-DD"),
  extendedProps: {
    calendar: getBookingStatusColor(booking.status || "")
  }
});

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

interface BookingProps {
  onRefresh: () => void;
  bookings: Booking[];
  users: User[];
  vehicles: Vehicle[];
  parkingLots: ParkingLot[];
  parkingSlots: ParkingSlot[];
}

const getBookingStatusColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    [BookingStatus.Booked]: "Success",
    [BookingStatus.CheckedIn]: "Success",
    [BookingStatus.CheckedOut]: "Primary",
    [BookingStatus.Cancelled]: "Danger",
    [BookingStatus.Pending]: "Warning"
  };

  return statusColorMap[status] || "Primary";
};

export default function BookingDataTable({ onRefresh, bookings, users, vehicles: initialVehicles, parkingLots, parkingSlots: initialParkingSlots }: BookingProps) {
  const searchParams = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateBookingDto | UpdateBookingDto>({
    userId: 0,
    vehicleId: 0,
    parkingLotId: 0,
    slotId: 0,
    checkinTime: "",
    status: BookingStatus.Pending,
    paymentStatus: BookingPaymentStatus.Unpaid
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(initialParkingSlots);
  const { isOpen, openModal, closeModal } = useModal();
  const [isPaying, setIsPaying] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(bookings.map(mapBookingToEvent));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Student)) {
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

  // Update events when bookings change
  useEffect(() => {
    setEvents(bookings.map(mapBookingToEvent));
  }, [bookings]);

  // Handle VNPay webhook
  useEffect(() => {
    const queryParams = Object.fromEntries(searchParams.entries());
    const isVNPayCallback =
      queryParams['vnp_ResponseCode'] && queryParams['vnp_SecureHash'];

    if (!isVNPayCallback) return;

    const handlePaymentCallback = async () => {
      let message = '';
      let redirectUrl = window.location.pathname; // giữ nguyên path, không có query

      try {
        const result = await handleVNPayWebhook(queryParams);
        message = result.message;
        if (result.success && result.redirectUrl) {
          redirectUrl = result.redirectUrl;
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        alert('Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        alert(message);

        // Redirect to same URL without query params
        window.location.replace(redirectUrl);
      }
    };

    handlePaymentCallback();
  }, [searchParams]);


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
      console.log("error", error);
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
      console.log("error", error);
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
        alert("Cập nhật đặt chỗ thành công");
      } else {
        await createBooking(formData as CreateBookingDto);
        // alert("Đặt chỗ thành công");
      }
      closeModal();
      onRefresh();
    } catch {
      alert(selectedBooking?.id ? "Không thể cập nhật đặt chỗ" : "Không thể Đặt chỗ");
    } finally {
      setIsSubmitting(false);
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


  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa đặt chỗ này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteBooking(id);
      alert("Xóa đặt chỗ thành công");
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

  const calendarRef = useRef<FullCalendar>(null);

  const handleEventClick = async (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const bookingId = parseInt(event.id);

    try {
      const booking = await getBookingById(bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setFormData({
          userId: booking.userId,
          vehicleId: booking.vehicleId,
          parkingLotId: booking.parkingLotId,
          slotId: booking.slotId,
          checkinTime: moment(booking.checkinTime).format("YYYY-MM-DD HH:mm:00"),
        });
        openModal();
      }
    } catch (error) {
      console.log("error", error);
      alert("Không thể lấy thông tin đặt chỗ");
    }
  };

  return (
    <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "",
          }}
          events={events}
          selectable={true}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Đặt chỗ +",
              click: openModal,
            },
          }}
        />
      </div>
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
                  id="date-picker"
                  placeholder="Chọn ngày đặt"
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
                    ...(user?.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Student)
                      ? users
                        .filter(u => u.id === user?.id)
                        .map(u => ({
                          value: u.id.toString(),
                          label: u.name,
                        }))
                      : users
                        .filter(u => u.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Student))
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
              user?.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Admin) && (
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
              user?.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Admin) && (
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

            {selectedBooking && selectedBooking.id && selectedBooking.paymentStatus === BookingPaymentStatus.Unpaid && selectedBooking.status !== BookingStatus.Cancelled && (
              <button
                onClick={() => handlePay(selectedBooking)}
                type="button"
                disabled={isPaying}
                className="btn btn-warning btn-update-event flex w-full justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 sm:w-auto"
              >
                Thanh toán
              </button>
            )}

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
      </Modal>
    </div>
  );
}


export const BookingStatus = {
  Booked: "Booked",
  CheckedIn: "CheckedIn",
  CheckedOut: "CheckedOut",
  Cancelled: "Cancelled",
  Pending: "Pending",
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

export const BookingStatusOptions = [
  { value: BookingStatus.Pending, label: "Đang chờ" },
  { value: BookingStatus.Booked, label: "Đã đặt chỗ" },
  { value: BookingStatus.CheckedIn, label: "Đã check-in" },
  { value: BookingStatus.CheckedOut, label: "Đã check-out" },
  { value: BookingStatus.Cancelled, label: "Đã hủy" },
];

export const BookingPaymentStatus = {
  Unpaid: "Unpaid",
  Paid: "Paid",
};

export const BookingPaymentStatusOptions = [
  { value: BookingPaymentStatus.Unpaid, label: "Chưa thanh toán" },
  { value: BookingPaymentStatus.Paid, label: "Đã thanh toán" },
];

export type BookingPaymentStatusType = typeof BookingPaymentStatus[keyof typeof BookingPaymentStatus];
  
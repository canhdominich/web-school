import { httpClient } from "@/lib/httpClient";

export const createVNPayPaymentUrl = async (bookingId: number, amount: number) => {
    const res = await httpClient.post(`/payments/create-payment-url`, { bookingId, amount });
    return res.data;
}

export const verifyVNPayReturn = async (vnpParams: Record<string, string>) => {
    const res = await httpClient.get(`/payments/vnpay-return`, { params: vnpParams });
    return res.data;
}

export const getPaymentHistory = async (userId: number) => {
    const res = await httpClient.get(`/payments/history/${userId}`);
    return res.data;
}

export const getPaymentHistoryByBookingId = async (bookingId: number) => {
    const res = await httpClient.get(`/payments/history/booking/${bookingId}`);
    return res.data;
}

export const getPaymentHistoryByUserId = async (userId: number) => {
    const res = await httpClient.get(`/payments/history/user/${userId}`);
    return res.data;
}

export const getPaymentHistoryByBookingIdAndUserId = async (bookingId: number, userId: number) => {
    const res = await httpClient.get(`/payments/history/booking/${bookingId}/user/${userId}`);
    return res.data;
}

export const handleVNPayWebhook = async (queryParams: Record<string, string>) => {
    const res = await httpClient.post(`/payments/vnpay/payment-return`, {
        params: queryParams
    });
    return res.data;
}



"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BasicTableProps, Header } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateParkingLotDto, createParkingLot, deleteParkingLot, updateParkingLot, ParkingLot, UpdateParkingLotDto } from "@/services/parkingLotService";

interface ParkingLotDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: (ParkingLot & { checkedInCount: number; totalEmptySlots: number })[];
  headers: Header[];
}

export default function ParkingLotDataTable({ headers, items, onRefresh }: ParkingLotDataTableProps) {
  const [selectedParkingLot, setSelectedParkingLot] = useState<ParkingLot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateParkingLotDto | UpdateParkingLotDto>({
    name: "",
    location: "",
    openTime: "",
    closeTime: "",
    totalSlots: 0,
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedParkingLot(null);
      setFormData({
        name: "",
        location: "",
        openTime: "",
        closeTime: "",
        totalSlots: 0,
      });
    }
  }, [isOpen]);

  // Update form data when selected ParkingLot changes
  useEffect(() => {
    if (selectedParkingLot) {
      setFormData({
        name: selectedParkingLot.name,
        location: selectedParkingLot.location,
        openTime: selectedParkingLot.openTime,
        closeTime: selectedParkingLot.closeTime,
        totalSlots: selectedParkingLot.totalSlots,
      });
    }
  }, [selectedParkingLot]);

  const handleEdit = (ParkingLot: ParkingLot) => {
    setSelectedParkingLot(ParkingLot);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedParkingLot?.id) {
        await updateParkingLot(selectedParkingLot.id.toString(), formData as UpdateParkingLotDto);
        alert("Cập nhật bãi xe thành công");
      } else {
        await createParkingLot(formData as CreateParkingLotDto);
        alert("Thêm bãi xe thành công");
      }
      closeModal();
      onRefresh();
    } catch {
      alert(selectedParkingLot?.id ? "Không thể cập nhật bãi xe" : "Không thể thêm bãi xe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa bãi xe này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteParkingLot(id.toString());
      alert("Xóa bãi xe thành công");
      onRefresh();
    } catch {
      alert("Không thể xóa bãi xe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-center gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm bãi xe
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell
                    key={header.key}
                    isHeader
                    className={index === 0 ? "px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400" : "px-5 py-3 font-medium text-center text-theme-sm dark:text-gray-400"}
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: ParkingLot & { checkedInCount: number; totalEmptySlots: number }) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-center">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.location}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.openTime}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.closeTime}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.totalSlots}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.checkedInCount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.totalEmptySlots}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                      >
                        Cập nhật
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                      >
                        Xóa
                      </button>
                    </div>
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
                  {selectedParkingLot ? "Chỉnh sửa bãi xe" : "Thêm bãi xe"}
                </h5>
              </div>
              <div className="mt-8">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Tên bãi xe
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Vị trí
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Giờ mở cửa
                  </label>
                  <input
                    id="openTime"
                    type="text"
                    value={formData.openTime}
                    placeholder="HH:MM"
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Giờ đóng cửa
                  </label>
                  <input
                    id="closeTime"
                    type="text"
                    value={formData.closeTime}
                    placeholder="HH:MM"
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Số lượng chỗ đỗ
                  </label>
                  <input
                    id="totalSlots"
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({ ...formData, totalSlots: parseInt(e.target.value) })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmit}
                  type="button"
                  disabled={isSubmitting}
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {isSubmitting ? "Đang xử lý..." : selectedParkingLot ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

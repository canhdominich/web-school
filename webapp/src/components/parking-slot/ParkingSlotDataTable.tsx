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
import { CreateParkingSlotDto, createParkingSlot, deleteParkingSlot, updateParkingSlot, ParkingSlot, UpdateParkingSlotDto } from "@/services/parkingSlotService";
import Badge from "../ui/badge/Badge";
import { ParkingSlotStatus, ParkingSlotStatusOptions } from "@/constants/common";
import { VehicleType, VehicleTypeOptions } from "@/constants/vehicle.constant";
import Select from "../form/Select";
import { ChevronDownIcon } from "@/icons";
import { ParkingLot } from "@/services/parkingLotService";
interface ParkingSlotDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: ParkingSlot[];
  headers: Header[];
  parkingLots: ParkingLot[];
}

const getStatusLabel = (status: ParkingSlotStatus): string => {
  const statusOption = ParkingSlotStatusOptions.find(option => option.value === status);
  return statusOption ? statusOption.label : status;
};

const getVehicleTypeLabel = (vehicleType: VehicleType): string => {
  const vehicleTypeOption = VehicleTypeOptions.find(option => option.value === vehicleType);
  return vehicleTypeOption ? vehicleTypeOption.label : vehicleType;
};


export default function ParkingSlotDataTable({ headers, items, onRefresh, parkingLots }: ParkingSlotDataTableProps) {
  const [selectedParkingSlot, setSelectedParkingSlot] = useState<ParkingSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateParkingSlotDto | UpdateParkingSlotDto>({
    name: "",
    parkingLotId: 0,
    vehicleType: "",
    status: "",
  });
  const { isOpen, openModal, closeModal } = useModal();

  const handleSelectVehicleTypeChange = (value: string) => {
    setFormData({ ...formData, vehicleType: value as VehicleType });
  };

  const handleSelectParkingLotChange = (value: string) => {
    setFormData({ ...formData, parkingLotId: parseInt(value) });
  };

  const handleSelectStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as ParkingSlotStatus });
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedParkingSlot(null);
      setFormData({
        name: "",
        parkingLotId: 0,
        vehicleType: "",
        status: "",
      });
    }
  }, [isOpen]);

  // Update form data when selected ParkingSlot changes
  useEffect(() => {
    if (selectedParkingSlot) {
      setFormData({
        name: selectedParkingSlot.name,
        parkingLotId: selectedParkingSlot.parkingLotId,
        vehicleType: selectedParkingSlot.vehicleType,
        status: selectedParkingSlot.status,
      });
    }
  }, [selectedParkingSlot]);

  const handleEdit = (ParkingSlot: ParkingSlot) => {
    setSelectedParkingSlot(ParkingSlot);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedParkingSlot?.id) {
        await updateParkingSlot(selectedParkingSlot.id.toString(), formData as UpdateParkingSlotDto);
        alert("Cập nhật chỗ đỗ thành công");
      } else {
        await createParkingSlot(formData as CreateParkingSlotDto);
        alert("Thêm chỗ đỗ thành công");
      }
      closeModal();
      onRefresh();
    } catch {
      alert(selectedParkingSlot?.id ? "Không thể cập nhật chỗ đỗ" : "Không thể thêm chỗ đỗ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa chỗ đỗ này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteParkingSlot(id.toString());
      alert("Xóa chỗ đỗ thành công");
      onRefresh();
    } catch {
      alert("Không thể xóa chỗ đỗ");
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
          Thêm chỗ đỗ
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {headers.map((header) => (
                  <TableCell
                    key={header.key}
                    isHeader
                    className="px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400"
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: ParkingSlot) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {getVehicleTypeLabel(item.vehicleType as VehicleType)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        item.status === ParkingSlotStatus.Available
                          ? "success"
                          : "error"
                      }
                    >
                      {getStatusLabel(item.status as ParkingSlotStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item?.booking?.vehicle?.licensePlate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {parkingLots.find(lot => lot.id === item.parkingLotId)?.name} ({parkingLots.find(lot => lot.id === item.parkingLotId)?.totalSlots} chỗ)
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {parkingLots.find(lot => lot.id === item.parkingLotId)?.location}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                  {selectedParkingSlot ? "Chỉnh sửa chỗ đỗ" : "Thêm chỗ đỗ"}
                </h5>
              </div>
              <div className="mt-8">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Tên chỗ đỗ
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
                  <div className="relative">
                    <Select
                      value={formData.parkingLotId?.toString() || ""}
                      options={parkingLots.map((lot) => ({
                        value: lot.id.toString(),
                        label: lot.name,
                      }))}
                      placeholder="Chọn bãi xe"
                      onChange={handleSelectParkingLotChange}
                      className="dark:bg-dark-900"
                      disabled={!!selectedParkingSlot && !!selectedParkingSlot.id}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="relative">
                    <Select
                      value={formData.vehicleType}
                      options={[{
                        value: "",
                        label: "Loại phương tiện",
                      }, ...VehicleTypeOptions]}
                      onChange={handleSelectVehicleTypeChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="relative">
                    <Select
                      value={formData.status}
                      options={[{
                        value: "",
                        label: "Trạng thái chỗ đỗ",
                      }, ...ParkingSlotStatusOptions]}
                      onChange={handleSelectStatusChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
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
                  {isSubmitting ? "Đang xử lý..." : selectedParkingSlot ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

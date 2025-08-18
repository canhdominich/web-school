/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { BasicTableProps } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import Select from "../form/Select";
import { VehicleStatus, VehicleStatusOptions, VehicleType, VehicleTypeOptions } from "@/constants/vehicle.constant";
import { ChevronDownIcon } from "@/icons";
import { CreateVehicleDto, deleteVehicle, updateVehicle, Vehicle } from "@/services/vehicleService";
import { createVehicle } from "@/services/vehicleService";
import toast from "react-hot-toast";

interface VehicleDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Vehicle[];
}

export default function VehicleDataTable({ headers, items, onRefresh }: VehicleDataTableProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleDto>({
    licensePlate: "",
    vehicleType: VehicleType.Car,
    model: "",
    color: "",
    status: VehicleStatus.Active,
    userId: 2,
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVehicle(null);
      setFormData({
        licensePlate: "",
        vehicleType: VehicleType.Car,
        model: "",
        color: "",
        status: VehicleStatus.Active,
        userId: 2,
      });
    }
  }, [isOpen]);

  // Update form data when selected vehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      setFormData({
        licensePlate: selectedVehicle.licensePlate,
        vehicleType: selectedVehicle.vehicleType as VehicleType,
        model: selectedVehicle.model,
        color: selectedVehicle.color,
        status: selectedVehicle.status as VehicleStatus,
        userId: selectedVehicle.userId,
      });
    }
  }, [selectedVehicle]);

  const handleSelectVehicleTypeChange = (value: string) => {
    setFormData({ ...formData, vehicleType: value as VehicleType });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedVehicle?.id) {
        await updateVehicle(selectedVehicle.id, formData);
        toast.success("Cập nhật phương tiện thành công");
      } else {
        await createVehicle(formData);
        toast.success("Thêm phương tiện thành công");
      }
      closeModal();
      onRefresh();
    } catch {
      toast.error(selectedVehicle?.id ? "Không thể cập nhật phương tiện" : "Không thể thêm phương tiện");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa phương tiện này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteVehicle(id);
      toast.success("Xóa phương tiện thành công");
      onRefresh(); // Refresh data after successful deletion
    } catch {
      toast.error("Không thể xóa phương tiện");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVehicleTypeLabel = (vehicleType: VehicleType): string => {
    const vehicleTypeOption = VehicleTypeOptions.find(option => option.value === vehicleType);
    return vehicleTypeOption ? vehicleTypeOption.label : vehicleType;
  };

  const getVehicleStatusLabel = (status: VehicleStatus): string => {
    const vehicleStatusOption = VehicleStatusOptions.find(option => option.value === status);
    return vehicleStatusOption ? vehicleStatusOption.label : status;
  };
  
  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-start gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm phương tiện
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
                    className={index === 0 || index === headers.length - 1 ? "px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400" : "px-5 py-3 font-medium text-center text-theme-sm dark:text-gray-400"}
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: Vehicle) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-center">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          {/* @ts-expect-error */}
                          {item.user?.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {getVehicleTypeLabel(item.vehicleType)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.licensePlate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.model}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {item.color}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        item.status === VehicleStatus.Active
                          ? "success"
                          : "error"
                      }
                    >
                      {getVehicleStatusLabel(item.status as VehicleStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                    <div className="flex items-end gap-3">
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
                  {selectedVehicle ? "Chỉnh sửa phương tiện" : "Thêm phương tiện"}
            </h5>
          </div>
          <div className="mt-8">
                <div className="mb-3">
                  <div className="relative">
                    <Select
                      value={formData.vehicleType}
                      options={VehicleTypeOptions}
                      placeholder="Chọn loại phương tiện"
                      onChange={handleSelectVehicleTypeChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Biển số xe
                </label>
                <input
                    id="license-plate"
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Mẫu xe
                  </label>
                  <input
                    id="model"
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Màu sắc
                  </label>
                  <input
                    id="color"
                  type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                  {isSubmitting ? "Đang xử lý..." : selectedVehicle ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}

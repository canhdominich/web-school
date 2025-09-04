"use client";
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import { BasicTableProps, Header, AcademicYear } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateAcademicYearDto, createAcademicYear, deleteAcademicYear, updateAcademicYear, UpdateAcademicYearDto } from "@/services/academicYearService";
import { toast } from "react-hot-toast";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface AcademicYearDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: AcademicYear[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function AcademicYearDataTable({ 
  headers, 
  items, 
  onRefresh, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: AcademicYearDataTableProps) {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAcademicYearDto | UpdateAcademicYearDto>({
    name: "",
    code: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAcademicYear(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [isOpen]);

  // Update form data when selected AcademicYear changes
  useEffect(() => {
    if (selectedAcademicYear) {
      setFormData({
        name: selectedAcademicYear.name,
        code: selectedAcademicYear.code,
        description: selectedAcademicYear.description || "",
        startDate: selectedAcademicYear.startDate,
        endDate: selectedAcademicYear.endDate,
      });
    }
  }, [selectedAcademicYear]);

  const handleEdit = (academicYear: AcademicYear) => {
    setSelectedAcademicYear(academicYear);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedAcademicYear?.id) {
        await updateAcademicYear(selectedAcademicYear.id.toString(), formData as UpdateAcademicYearDto);
        toast.success("Cập nhật năm học thành công");
      } else {
        await createAcademicYear(formData as CreateAcademicYearDto);
        toast.success("Thêm năm học thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedAcademicYear?.id ? "Không thể cập nhật năm học" : "Không thể thêm năm học";
      
      if (error instanceof Error && error.message) {
        toast.error(`${errorMessage}: ${error.message}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa năm học này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteAcademicYear(id.toString());
      toast.success("Xóa năm học thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = "Không thể xóa năm học";
      
      if (error instanceof Error && error.message) {
        if (error.message.includes("Không thể xóa năm học này vì đang được sử dụng trong:")) {
          errorMessage = error.message;
          toast.error(errorMessage, { duration: 6000 });
        } else {
          toast.error(`${errorMessage}: ${error.message}`);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Render row function
  const renderRow = (academicYear: AcademicYear) => (
    <TableRow key={academicYear.id}>
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
              {academicYear.name}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {academicYear.code}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {academicYear.description || "Không có mô tả"}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {formatDate(academicYear.startDate)}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {formatDate(academicYear.endDate)}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(academicYear.createdAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(academicYear.updatedAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(academicYear)}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(academicYear.id)}
            className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
          >
            Xóa
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Action button
  const actionButton = (
    <button
      onClick={openModal}
      type="button"
      className="btn btn-success btn-update-event flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
    >
      Thêm năm học
    </button>
  );

  return (
    <>
      <SearchableDataTable
        headers={headers}
        items={items}
        renderRow={renderRow}
        searchTerm={searchTerm}
        onSearch={onSearch}
        searchPlaceholder="Tìm kiếm theo tên năm học..."
        isSearching={isSearching}
        pagination={pagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        actionButton={actionButton}
      />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedAcademicYear ? "Chỉnh sửa năm học" : "Thêm năm học"}
            </h5>
          </div>
          <div className="mt-8">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tên năm học
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập tên năm học"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mã năm học
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập mã năm học (VD: AY-2024-2025)"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mô tả
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập mô tả năm học (không bắt buộc)"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Ngày bắt đầu
              </label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Ngày kết thúc
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="dark:bg-gray-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
              {isSubmitting ? "Đang xử lý..." : selectedAcademicYear ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

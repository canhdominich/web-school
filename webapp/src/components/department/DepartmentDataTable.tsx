"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BasicTableProps, Header, Department, Faculty } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateDepartmentDto, createDepartment, deleteDepartment, updateDepartment, UpdateDepartmentDto } from "@/services/departmentService";
import { getFaculties } from "@/services/facultyService";
import { toast } from "react-hot-toast";

interface DepartmentDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Department[];
  headers: Header[];
}

export default function DepartmentDataTable({ headers, items, onRefresh }: DepartmentDataTableProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [formData, setFormData] = useState<CreateDepartmentDto | UpdateDepartmentDto>({
    name: "",
    code: "",
    description: "",
    facultyId: 0,
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch faculties for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await getFaculties();
        setFaculties(data);
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };
    fetchFaculties();
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDepartment(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        facultyId: 0,
      });
    }
  }, [isOpen]);

  // Update form data when selected Department changes
  useEffect(() => {
    if (selectedDepartment) {
      setFormData({
        name: selectedDepartment.name,
        code: selectedDepartment.code,
        description: selectedDepartment.description || "",
        facultyId: selectedDepartment.facultyId,
      });
    }
  }, [selectedDepartment]);

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.facultyId) {
      toast.error("Vui lòng chọn khoa");
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedDepartment?.id) {
        await updateDepartment(selectedDepartment.id.toString(), formData as UpdateDepartmentDto);
        toast.success("Cập nhật bộ môn thành công");
      } else {
        await createDepartment(formData as CreateDepartmentDto);
        toast.success("Thêm bộ môn thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedDepartment?.id ? "Không thể cập nhật bộ môn" : "Không thể thêm bộ môn";
      
      // Try to get specific error message
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

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa bộ môn này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteDepartment(id.toString());
      toast.success("Xóa bộ môn thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = "Không thể xóa bộ môn";
      
      // Handle constraint violation error
      if (error instanceof Error && error.message) {
        if (error.message.includes("Không thể xóa bộ môn này vì đang được sử dụng trong:")) {
          errorMessage = error.message;
          toast.error(errorMessage, {
            duration: 6000, // Show longer for constraint errors
          });
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

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-center gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm bộ môn
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
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
              {items.map((item: Department) => (
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
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {item.code}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.description || "Không có mô tả"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.faculty?.name || "Không xác định"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(item.updatedAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                      >
                        Sửa
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
            className="max-w-[600px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedDepartment ? "Chỉnh sửa bộ môn" : "Thêm bộ môn"}
                </h5>
              </div>
              <div className="mt-8">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Tên bộ môn
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập tên bộ môn"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Mã bộ môn
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập mã bộ môn"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Khoa
                  </label>
                  <select
                    id="facultyId"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: Number(e.target.value) })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  >
                    <option value={0}>Chọn khoa</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
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
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập mô tả bộ môn (không bắt buộc)"
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
                  {isSubmitting ? "Đang xử lý..." : selectedDepartment ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
} 
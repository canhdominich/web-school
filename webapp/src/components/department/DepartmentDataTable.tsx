"use client";
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import { BasicTableProps, Header, Department, Faculty, School } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateDepartmentDto, createDepartment, deleteDepartment, updateDepartment, UpdateDepartmentDto } from "@/services/departmentService";
import { getFaculties } from "@/services/facultyService";
import { getSchools } from "@/services/schoolService";
import { toast } from "react-hot-toast";
import { VERY_BIG_NUMBER } from "@/constants/common";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface DepartmentDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Department[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function DepartmentDataTable({ 
  headers, 
  items, 
  onRefresh, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: DepartmentDataTableProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [formData, setFormData] = useState<CreateDepartmentDto | UpdateDepartmentDto>({
    name: "",
    code: "",
    description: "",
    facultyId: undefined,
    schoolId: undefined,
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Load schools when component mounts
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setIsLoadingSchools(true);
        const response = await getSchools({ limit: VERY_BIG_NUMBER });
        setSchools(response.data);
      } catch (error) {
        console.error('Error loading schools:', error);
        toast.error('Không thể tải danh sách trường');
      } finally {
        setIsLoadingSchools(false);
      }
    };
    
    loadSchools();
  }, []);

  // Fetch faculties when school changes
  const fetchFacultiesBySchool = async (schoolId: number) => {
    try {
      setIsLoadingFaculties(true);
      const data = await getFaculties({ schoolId, limit: VERY_BIG_NUMBER });
      setFaculties(data.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFaculties([]);
    } finally {
      setIsLoadingFaculties(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDepartment(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        facultyId: undefined,
        schoolId: undefined,
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
        schoolId: selectedDepartment.schoolId,
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

    // Validation
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên bộ môn");
      return;
    }
    if (!formData.code?.trim()) {
      toast.error("Vui lòng nhập mã bộ môn");
      return;
    }
    if (!formData.schoolId) {
      toast.error("Vui lòng chọn trường");
      return;
    }
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

  // Render row function
  const renderRow = (department: Department) => (
    <TableRow key={department.id}>
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
              {department.name}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {department.code}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {department.description || "Không có mô tả"}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {department.faculty?.name || "Không xác định"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {department.school?.name || "Chưa có trường"}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(department.createdAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(department.updatedAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(department)}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(department.id)}
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
      Thêm bộ môn
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
        searchPlaceholder="Tìm kiếm theo tên bộ môn..."
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
              {selectedDepartment ? "Chỉnh sửa bộ môn" : "Thêm bộ môn"}
            </h5>
          </div>
          <div className="mt-8">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tên bộ môn <span className="text-red-500">*</span>
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
                Mã bộ môn <span className="text-red-500">*</span>
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
                Trường <span className="text-red-500">*</span>
              </label>
              <select
                id="schoolId"
                value={formData.schoolId || ""}
                onChange={(e) => {
                  const schoolId = e.target.value ? Number(e.target.value) : undefined;
                  setFormData({ ...formData, schoolId, facultyId: undefined });
                  if (schoolId) {
                    fetchFacultiesBySchool(schoolId);
                  } else {
                    setFaculties([]);
                  }
                }}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={isLoadingSchools}
              >
                <option value="">Chọn trường</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Khoa <span className="text-red-500">*</span>
              </label>
              <select
                id="facultyId"
                value={formData.facultyId || ""}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value ? Number(e.target.value) : undefined })}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={!formData.schoolId || isLoadingFaculties}
              >
                <option value="">Chọn khoa</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
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
    </>
  );
} 
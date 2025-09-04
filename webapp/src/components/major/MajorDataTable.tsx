"use client";
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import { BasicTableProps, Header, Major, Department, Faculty, School } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateMajorDto, createMajor, deleteMajor, updateMajor, UpdateMajorDto } from "@/services/majorService";
import { getDepartments } from "@/services/departmentService";
import { getFaculties } from "@/services/facultyService";
import { getSchools } from "@/services/schoolService";
import { toast } from "react-hot-toast";
import { VERY_BIG_NUMBER } from "@/constants/common";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface MajorDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Major[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function MajorDataTable({ 
  headers, 
  items, 
  onRefresh, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: MajorDataTableProps) {
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [formData, setFormData] = useState<CreateMajorDto | UpdateMajorDto>({
    name: "",
    code: "",
    description: "",
    departmentId: undefined,
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

  // Fetch departments when faculty changes
  const fetchDepartmentsByFaculty = async (facultyId: number) => {
    try {
      setIsLoadingDepartments(true);
      const data = await getDepartments({ facultyId, limit: VERY_BIG_NUMBER });
      setDepartments(data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMajor(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        departmentId: undefined,
        facultyId: undefined,
        schoolId: undefined,
      });
    }
  }, [isOpen]);

  // Update form data when selected Major changes
  useEffect(() => {
    if (selectedMajor) {
      setFormData({
        name: selectedMajor.name,
        code: selectedMajor.code,
        description: selectedMajor.description || "",
        departmentId: selectedMajor.departmentId,
        facultyId: selectedMajor.facultyId,
        schoolId: selectedMajor.schoolId,
      });
      // Load faculties và departments theo thứ tự
      if (selectedMajor.schoolId) {
        fetchFacultiesBySchool(selectedMajor.schoolId);
      }
      if (selectedMajor.facultyId) {
        fetchDepartmentsByFaculty(selectedMajor.facultyId);
      }
    }
  }, [selectedMajor]);

  const handleEdit = (major: Major) => {
    setSelectedMajor(major);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên ngành học");
      return;
    }
    if (!formData.code?.trim()) {
      toast.error("Vui lòng nhập mã ngành học");
      return;
    }
    // Chỉ validate khi thêm mới ngành học
    if (!selectedMajor) {
      if (!formData.schoolId) {
        toast.error("Vui lòng chọn trường");
        return;
      }
      if (!formData.facultyId) {
        toast.error("Vui lòng chọn khoa");
        return;
      }
      if (!formData.departmentId) {
        toast.error("Vui lòng chọn bộ môn");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (selectedMajor?.id) {
        // Khi chỉnh sửa, đảm bảo schoolId, facultyId, departmentId được giữ nguyên
        const updateData = {
          ...formData,
          schoolId: selectedMajor.schoolId,
          facultyId: selectedMajor.facultyId,
          departmentId: selectedMajor.departmentId,
        } as UpdateMajorDto;
        await updateMajor(selectedMajor.id.toString(), updateData);
        toast.success("Cập nhật ngành học thành công");
      } else {
        await createMajor(formData as CreateMajorDto);
        toast.success("Thêm ngành học thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedMajor?.id ? "Không thể cập nhật ngành học" : "Không thể thêm ngành học";
      
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

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa ngành học này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteMajor(id.toString());
      toast.success("Xóa ngành học thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = "Không thể xóa ngành học";
      
      // Handle constraint violation error
      if (error instanceof Error && error.message) {
        if (error.message.includes("Không thể xóa ngành học này vì đang được sử dụng trong:")) {
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
  const renderRow = (major: Major) => (
    <TableRow key={major.id}>
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
              {major.name}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {major.code}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {major.description || "Không có mô tả"}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {major.department?.name || "Không xác định"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {major.faculty?.name || "Chưa có khoa"} / {major.school?.name || "Chưa có trường"}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(major.createdAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {new Date(major.updatedAt).toLocaleString('vi-VN')}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(major)}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(major.id)}
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
      Thêm ngành học
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
        searchPlaceholder="Tìm kiếm theo tên ngành học..."
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
              {selectedMajor ? "Chỉnh sửa ngành học" : "Thêm ngành học"}
            </h5>
          </div>
          <div className="mt-8">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tên ngành học <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập tên ngành học"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mã ngành học <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Nhập mã ngành học"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Trường {!selectedMajor && <span className="text-red-500">*</span>}
              </label>
              <select
                id="schoolId"
                value={formData.schoolId || ""}
                onChange={(e) => {
                  const schoolId = e.target.value ? Number(e.target.value) : undefined;
                  setFormData({ ...formData, schoolId, facultyId: undefined, departmentId: undefined });
                  if (schoolId) {
                    fetchFacultiesBySchool(schoolId);
                  } else {
                    setFaculties([]);
                    setDepartments([]);
                  }
                }}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={isLoadingSchools || !!selectedMajor}
              >
                <option value="">Chọn trường</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.code})
                  </option>
                ))}
              </select>
              {selectedMajor && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Không thể thay đổi trường khi chỉnh sửa ngành học
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Khoa {!selectedMajor && <span className="text-red-500">*</span>}
              </label>
              <select
                id="facultyId"
                value={formData.facultyId || ""}
                onChange={(e) => {
                  const facultyId = e.target.value ? Number(e.target.value) : undefined;
                  setFormData({ ...formData, facultyId, departmentId: undefined });
                  if (facultyId) {
                    fetchDepartmentsByFaculty(facultyId);
                  } else {
                    setDepartments([]);
                  }
                }}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={!formData.schoolId || isLoadingFaculties || !!selectedMajor}
              >
                <option value="">Chọn khoa</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} ({faculty.code})
                  </option>
                ))}
              </select>
              {selectedMajor && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Không thể thay đổi khoa khi chỉnh sửa ngành học
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Bộ môn {!selectedMajor && <span className="text-red-500">*</span>}
              </label>
              <select
                id="departmentId"
                value={formData.departmentId || ""}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value ? Number(e.target.value) : undefined })}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={!formData.facultyId || isLoadingDepartments || !!selectedMajor}
              >
                <option value="">Chọn bộ môn</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
              {selectedMajor && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Không thể thay đổi bộ môn khi chỉnh sửa ngành học
                </p>
              )}
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
                placeholder="Nhập mô tả ngành học (không bắt buộc)"
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
              {isSubmitting ? "Đang xử lý..." : selectedMajor ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
} 
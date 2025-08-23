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
import { BasicTableProps, Header, User, Faculty, Department, Major } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import MultiSelect from "../form/MultiSelect";
import { CreateUserDto, createUser, deleteUser, updateUser, UpdateUserDto, getFaculties, getDepartments, getMajors } from "@/services/userService";
import { toast } from "react-hot-toast";
import { UserRole, UserRoleOptions } from "@/constants/user.constant";

interface UserDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: User[];
  headers: Header[];
}

// Function to get Vietnamese label for role
const getRoleLabel = (role: UserRole): string => {
  const roleOption = UserRoleOptions.find(option => option.value === role);
  return roleOption ? roleOption.label : role;
};

// Function to get all role labels for a user
const getAllRoleLabels = (user: User): string[] => {
  if (!user.userRoles || user.userRoles.length === 0) {
    return [getRoleLabel(UserRole.Student)];
  }
  return user.userRoles.map(userRole => getRoleLabel(userRole.role.name as UserRole));
};

// Function to check if user has student role
const hasStudentRole = (user: User): boolean | undefined => {
  return user.userRoles && user.userRoles.some(userRole => userRole.role.name === UserRole.Student);
};

export default function UserDataTable({ headers, items, onRefresh }: UserDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    name: "",
    phone: "",
    email: "",
    roles: [UserRole.Student],
    password: "",
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Academic data states
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  // Load academic data
  useEffect(() => {
    const loadAcademicData = async () => {
      try {
        const [facultiesData, departmentsData, majorsData] = await Promise.all([
          getFaculties(),
          getDepartments(),
          getMajors(),
        ]);
        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setMajors(majorsData);
      } catch (error) {
        console.error('Error loading academic data:', error);
      }
    };

    loadAcademicData();
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        roles: [UserRole.Student],
        password: "",
        facultyId: undefined,
        departmentId: undefined,
        majorId: undefined,
      });
    }
  }, [isOpen]);

  // Update form data when selected User changes
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        phone: selectedUser.phone,
        email: selectedUser.email,
        roles: selectedUser.userRoles?.map(userRole => userRole.role.name) || [UserRole.Student],
        facultyId: selectedUser.facultyId,
        departmentId: selectedUser.departmentId,
        majorId: selectedUser.majorId,
      });
    }
  }, [selectedUser]);

  const handleSelectUserRoleChange = (values: string[]) => {
    setFormData({ ...formData, roles: values as UserRole[] });
  };

  const handleFacultyChange = async (facultyId: number) => {
    setFormData({ 
      ...formData, 
      facultyId,
      departmentId: undefined, // Reset department when faculty changes
      majorId: undefined, // Reset major when faculty changes
    });
    
    // Load departments for selected faculty
    try {
      const departmentsData = await getDepartments(facultyId);
      setDepartments(departmentsData);
      setMajors([]); // Reset majors
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleDepartmentChange = async (departmentId: number) => {
    setFormData({ 
      ...formData, 
      departmentId,
      majorId: undefined, // Reset major when department changes
    });
    
    // Load majors for selected department
    try {
      const majorsData = await getMajors(departmentId);
      setMajors(majorsData);
    } catch (error) {
      console.error('Error loading majors:', error);
    }
  };

  const handleMajorChange = (majorId: number) => {
    setFormData({ ...formData, majorId });
  };

  const handleEdit = (User: User) => {
    setSelectedUser(User);
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedUser?.id) {
        await updateUser(selectedUser.id.toString(), formData as UpdateUserDto);
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await createUser(formData as CreateUserDto);
        toast.success("Thêm tài khoản thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedUser?.id ? "Không thể cập nhật tài khoản" : "Không thể thêm tài khoản";
      
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

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteUser(id.toString());
      toast.success("Xóa tài khoản thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = "Không thể xóa tài khoản";
      
      // Handle constraint violation error
      if (error instanceof Error && error.message) {
        if (error.message.includes("Không thể xóa tài khoản này vì đang được sử dụng trong:")) {
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
          Thêm tài khoản
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1400px]">
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
              {items.map((item: User) => (
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
                    {item.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {getAllRoleLabels(item).map((roleLabel, index) => (
                        <Badge
                          key={index}
                          size="sm"
                          color={hasStudentRole(item) ? "success" : "error"}
                        >
                          {roleLabel}
                        </Badge>
                      ))}
                    </div>
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
            className="max-w-[700px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
                </h5>
              </div>
              <div className="mt-8">
                <div className="mb-3">
                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Loại tài khoản
                    </label>
                    <MultiSelect
                      value={formData.roles}
                      options={UserRoleOptions}
                      placeholder="Loại tài khoản"
                      onChange={handleSelectUserRoleChange}
                      className="dark:bg-dark-900"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Tên tài khoản
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
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Email
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Khoa
                  </label>
                  <select
                    id="faculty"
                    value={formData.facultyId || ''}
                    onChange={(e) => handleFacultyChange(parseInt(e.target.value))}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  >
                    <option value="">Chọn khoa</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Bộ môn
                  </label>
                  <select
                    id="department"
                    value={formData.departmentId || ''}
                    onChange={(e) => handleDepartmentChange(parseInt(e.target.value))}
                    disabled={!formData.facultyId}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50"
                  >
                    <option value="">Chọn bộ môn</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Ngành
                  </label>
                  <select
                    id="major"
                    value={formData.majorId || ''}
                    onChange={(e) => handleMajorChange(parseInt(e.target.value))}
                    disabled={!formData.departmentId}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50"
                  >
                    <option value="">Chọn ngành</option>
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUser && selectedUser?.id ?
                  null
                  : (<div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Mật khẩu
                    </label>
                    <input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>)}
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
                  {isSubmitting ? "Đang xử lý..." : selectedUser ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

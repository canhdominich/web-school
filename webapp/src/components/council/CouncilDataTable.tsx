"use client";
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import { BasicTableProps, Header, Faculty, User } from "@/types/common";
import { Council, CreateCouncilDto, UpdateCouncilDto, CouncilStatus } from "@/types/common";
import { Modal } from "../ui/modal";
import MultiSelect from "../form/MultiSelect";
import { useModal } from "@/hooks/useModal";
import { 
  createCouncil, 
  deleteCouncil, 
  updateCouncil, 
  addCouncilMembers, 
  removeCouncilMembers,
  addCouncilProjects,
  removeCouncilProjects,
  getCouncilProjects,
} from "@/services/councilService";
import { getProjects, type ProjectEntity } from "@/services/projectService";
import { getFaculties } from "@/services/facultyService";
import { getLecturers } from "@/services/userService";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import Badge from "../ui/badge/Badge";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface CouncilDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Council[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function CouncilDataTable({ 
  headers, 
  items, 
  onRefresh, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: CouncilDataTableProps) {
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [formData, setFormData] = useState<CreateCouncilDto | UpdateCouncilDto>({
    name: "",
    description: "",
    status: 'active',
    facultyId: undefined,
    memberIds: [],
  });
  const [memberFormData, setMemberFormData] = useState<{
    action: 'add' | 'remove';
    memberIds: number[];
  }>({
    action: 'add',
    memberIds: [],
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [projectFormData, setProjectFormData] = useState<{
    action: 'add' | 'remove';
    projectIds: number[];
  }>({ action: 'add', projectIds: [] });
  const [projectsByCouncil, setProjectsByCouncil] = useState<Record<number, ProjectEntity[]>>({});
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch faculties, lecturers, projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultiesData, lecturersData, projectsData] = await Promise.all([
          getFaculties(),
          getLecturers(),
          getProjects(),
        ]);
        
        // Handle different response types
        setFaculties(facultiesData.data || []);
        setLecturers(lecturersData || []); // getLecturers returns User[]
        
        // Handle both array and paginated response for projects
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          setProjects(projectsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error to prevent undefined issues
        setFaculties([]);
        setLecturers([]);
        setProjects([]);
      }
    };
    fetchData();
  }, []);

  // Load assigned projects for each council when list changes
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const entries = await Promise.all(
          (items || []).map(async (c) => {
            try {
              const list = await getCouncilProjects(c.id.toString());
              return [c.id, list as ProjectEntity[]] as const;
            } catch {
              return [c.id, []] as const;
            }
          })
        );
        const map: Record<number, ProjectEntity[]> = {};
        entries.forEach(([id, list]) => { map[id] = list as ProjectEntity[]; });
        setProjectsByCouncil(map);
      } catch (e) {
        console.error('Error loading projects:', e);
      }
    };
    if (items && items.length > 0) {
      loadProjects();
    } else {
      setProjectsByCouncil({});
    }
  }, [items]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCouncil(null);
      setFormData({
        name: "",
        description: "",
        status: 'active',
        facultyId: undefined,
        memberIds: [],
      });
    }
  }, [isOpen]);

  // Update form data when selected Council changes
  useEffect(() => {
    if (selectedCouncil) {
      setFormData({
        name: selectedCouncil.name,
        description: selectedCouncil.description || "",
        status: selectedCouncil.status,
        facultyId: selectedCouncil.facultyId,
        memberIds: (selectedCouncil.members || []).map(m => m.id),
      });
    }
  }, [selectedCouncil]);

  const handleEdit = (council: Council) => {
    setSelectedCouncil(council);
    openModal();
  };

  const handleManageMembers = (council: Council, action: 'add' | 'remove') => {
    setSelectedCouncil(council);
    setMemberFormData({
      action,
      memberIds: [],
    });
    setShowMemberModal(true);
  };

  const handleManageProjects = async (council: Council, action: 'add' | 'remove') => {
    setSelectedCouncil(council);
    setProjectFormData({ action, projectIds: [] });
    setShowProjectModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedCouncil?.id) {
        await updateCouncil(selectedCouncil.id.toString(), formData as UpdateCouncilDto);
        toast.success("Cập nhật hội đồng thành công");
      } else {
        await createCouncil(formData as CreateCouncilDto);
        toast.success("Thêm hội đồng thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedCouncil?.id ? "Không thể cập nhật hội đồng" : "Không thể thêm hội đồng";
      toast.error(getErrorMessage(error, errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedCouncil) return;

    try {
      setIsSubmitting(true);
      if (memberFormData.action === 'add') {
        await addCouncilMembers(selectedCouncil.id.toString(), memberFormData.memberIds);
        toast.success("Thêm giảng viên thành công");
      } else {
        await removeCouncilMembers(selectedCouncil.id.toString(), memberFormData.memberIds);
        toast.success("Xóa giảng viên thành công");
      }
      setShowMemberModal(false);
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleMemberSubmit:', error);
      const errorMessage = memberFormData.action === 'add' ? "Không thể thêm giảng viên" : "Không thể xóa giảng viên";
      toast.error(getErrorMessage(error, errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa hội đồng này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteCouncil(id.toString());
      toast.success("Xóa hội đồng thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      const errorMessage = "Không thể xóa hội đồng";
      toast.error(getErrorMessage(error, errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedCouncil) return;

    try {
      setIsSubmitting(true);
      if (projectFormData.action === 'add') {
        await addCouncilProjects(selectedCouncil.id.toString(), projectFormData.projectIds);
        toast.success("Gán dự án thành công");
      } else {
        await removeCouncilProjects(selectedCouncil.id.toString(), projectFormData.projectIds);
        toast.success("Gỡ dự án thành công");
      }
      setShowProjectModal(false);
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleProjectSubmit:', error);
      const errorMessage = projectFormData.action === 'add' ? "Không thể gán dự án" : "Không thể gỡ dự án";
      toast.error(getErrorMessage(error, errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: CouncilStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'light';
      default:
        return 'light';
    }
  };

  const getStatusText = (status: CouncilStatus) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Tạm ngưng';
      case 'archived':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  // Render row function
  const renderRow = (council: Council) => (
    <TableRow key={council.id}>
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
              {council.name}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {council.description || "Không có mô tả"}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {council.faculty?.name || "Không thuộc khoa"}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <Badge
          size="sm"
          color={getStatusColor(council.status)}
        >
          {getStatusText(council.status)}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="space-y-2">
          <div className="text-sm font-medium">Giảng viên ({council.members?.length || 0})</div>
          {council.members && council.members.length > 0 && (
            <div className="space-y-1">
              {council.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span>{member.name}</span>
                    <span className="text-gray-500">({member.code})</span>
                    <span className="text-gray-500">({member.email})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              title="Thêm giảng viên"
              onClick={() => handleManageMembers(council, 'add')}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-success-500 px-4 py-0.5 text-sm font-medium text-white hover:bg-success-600 sm:w-auto"
            >
              <span className="text-xl">+</span>
            </button>
            <button
              title="Xóa giảng viên"
              onClick={() => handleManageMembers(council, 'remove')}
              className="btn btn-warning btn-update-event flex w-full justify-center rounded-lg bg-warning-500 px-4 py-0.5 text-sm font-medium text-white hover:bg-warning-600 sm:w-auto"
            >
              <span className="text-xl">-</span>
            </button>
          </div>
          <div className="pt-3 space-y-1">
            <div className="text-sm font-medium">Dự án ({(projectsByCouncil[council.id] || []).length})</div>
            {(projectsByCouncil[council.id] || []).length > 0 && (
              <div className="space-y-1">
                {(projectsByCouncil[council.id] || []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span>{p.title}</span>
                      <span className="text-gray-500">({p.code})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {formatDate(council.createdAt)}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <div className="flex items-center gap-3">
          <button
            title="Gán dự án"
            onClick={() => handleManageProjects(council, 'add')}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-success-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-success-600 sm:w-auto"
          >
            Gán dự án
          </button>
          <button
            title="Gỡ dự án"
            onClick={() => handleManageProjects(council, 'remove')}
            className="btn btn-warning btn-update-event flex w-full justify-center rounded-lg bg-warning-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-warning-600 sm:w-auto"
          >
            Gỡ dự án
          </button>
          <button
            onClick={() => handleEdit(council)}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(council.id)}
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
      Thêm hội đồng
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
        searchPlaceholder="Tìm kiếm theo tên hội đồng..."
        isSearching={isSearching}
        pagination={pagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        actionButton={actionButton}
      />

      {/* Council Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedCouncil ? "Chỉnh sửa hội đồng" : "Thêm hội đồng"}
            </h5>
          </div>
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tên hội đồng
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="Nhập tên hội đồng"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Khoa
                </label>
                <select
                  id="facultyId"
                  value={formData.facultyId || ''}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value ? Number(e.target.value) : undefined })}
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
                placeholder="Nhập mô tả hội đồng (không bắt buộc)"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Giảng viên (chỉ giảng viên)
              </label>
              <MultiSelect
                value={formData.memberIds?.map(String) || []}
                onChange={(values) => setFormData({ ...formData, memberIds: values.map(v => Number(v)) })}
                options={lecturers.map(l => ({ value: l.id.toString(), label: `${l.name} (${l.code}) - ${l.email}` }))}
                placeholder="Chọn giảng viên"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Trạng thái
              </label>
              <select
                id="status"
                value={formData?.status as CouncilStatus}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CouncilStatus })}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
                <option value="archived">Lưu trữ</option>
              </select>
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
              {isSubmitting ? "Đang xử lý..." : selectedCouncil ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Project Management Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {projectFormData.action === 'add' ? 'Gán dự án cho hội đồng' : 'Gỡ dự án khỏi hội đồng'}
            </h5>
            {selectedCouncil && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                Hội đồng: {selectedCouncil.name}
              </p>
            )}
          </div>
          <div className="mt-8">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {projectFormData.action === 'add' ? 'Chọn dự án để gán' : 'Chọn dự án để gỡ'}
              </label>
              <MultiSelect
                value={projectFormData.projectIds.map(String)}
                onChange={(values) => setProjectFormData({ ...projectFormData, projectIds: values.map(v => Number(v)) })}
                options={(projectFormData.action === 'add'
                  ? projects.filter(p => !selectedCouncil?.facultyId || Number(p.facultyId) === Number(selectedCouncil?.facultyId))
                  : projects.filter(p => !selectedCouncil?.facultyId || Number(p.facultyId) === Number(selectedCouncil?.facultyId))
                ).map(p => ({ value: p.id.toString(), label: `${p.title} (${p.code})` }))}
                placeholder={projectFormData.action === 'add' ? 'Chọn dự án để gán' : 'Chọn dự án để gỡ'}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={() => setShowProjectModal(false)}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Đóng
            </button>
            <button
              onClick={handleProjectSubmit}
              type="button"
              disabled={isSubmitting}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {isSubmitting ? "Đang xử lý..." : projectFormData.action === 'add' ? "Gán dự án" : "Gỡ dự án"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Member Management Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {memberFormData.action === 'add' ? 'Thêm giảng viên' : 'Xóa giảng viên'}
            </h5>
            {selectedCouncil && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                Hội đồng: {selectedCouncil.name}
              </p>
            )}
          </div>
          <div className="mt-8">
            <div className="mb-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {memberFormData.action === 'add' ? 'Chọn giảng viên để thêm' : 'Chọn giảng viên để xóa'}
              </label>
              <MultiSelect
                value={memberFormData.memberIds.map(String)}
                onChange={(values) => setMemberFormData({ ...memberFormData, memberIds: values.map(v => Number(v)) })}
                options={(memberFormData.action === 'add' 
                  ? lecturers.filter(lecturer => !((selectedCouncil?.members || []).some(m => m.id === lecturer.id)))
                    .map(lecturer => ({ value: lecturer.id.toString(), label: `${lecturer.name} (${lecturer.code}) - ${lecturer.email}` }))
                  : (selectedCouncil?.members || []).map(member => ({ value: member.id.toString(), label: `${member.name} (${member.code}) - ${member.email}` }))
                )}
                placeholder={memberFormData.action === 'add' ? 'Chọn giảng viên để thêm' : 'Chọn giảng viên để xóa'}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={() => setShowMemberModal(false)}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Đóng
            </button>
            <button
              onClick={handleMemberSubmit}
              type="button"
              disabled={isSubmitting}
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {isSubmitting ? "Đang xử lý..." : memberFormData.action === 'add' ? "Thêm giảng viên" : "Xóa giảng viên"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

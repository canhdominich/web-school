"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { BasicTableProps, Header, Term, Major, Faculty, Department, User, IUserRole } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import Badge from "../ui/badge/Badge";
import { toast } from "react-hot-toast";
import { UserRole } from "@/constants/user.constant";
import { getUsers } from "@/services/userService";
import { getTerms } from "@/services/termService";
import { getMajors } from "@/services/majorService";
import { getFaculties } from "@/services/facultyService";
import { getDepartments } from "@/services/departmentService";
import {
  createProject,
  updateProject,
  deleteProject,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectEntity,
  ProjectStatus,
  ProjectLevel,
  ProjectMemberDto,
} from "@/services/projectService";
import { getRolesObject } from "@/utils/user.utils";
import { EyeIcon } from "@/icons";

interface ProjectDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: ProjectEntity[];
  headers: Header[];
}

export default function ProjectDataTable({ headers, items, onRefresh }: ProjectDataTableProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProjectDto | UpdateProjectDto>({
    code: "",
    title: "",
    abstract: "",
    objectives: "",
    scope: "",
    method: "",
    expectedOutputs: "",
    startDate: "",
    endDate: "",
    status: "draft",
    level: "undergraduate",
    budget: 0,
    facultyId: 0,
    departmentId: 0,
    majorId: 0,
    createdBy: 0,
    supervisorId: 0,
    termId: 0,
    members: [],
  });

  const [terms, setTerms] = useState<Term[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rolesObject, setRolesObject] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setRolesObject(getRolesObject(parsed.userRoles || []));
      setCurrentUser(parsed);
      setFormData((prev) => ({
        ...prev,
        createdBy: parsed.id,
      }));
    }
  }, []);

  useEffect(() => {
    // fetch options
    (async () => {
      try {
        const [termList, majorList, facultyList, departmentList, userList] = await Promise.all([
          getTerms(),
          getMajors(),
          getFaculties(),
          getDepartments(),
          getUsers(),
        ]);
        setTerms(termList);
        setMajors(majorList);
        setFaculties(facultyList);
        setDepartments(departmentList);
        setUsers(userList);
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải dữ liệu chọn");
      }
    })();
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
      setFormData(() => ({
        code: "",
        title: "",
        abstract: "",
        objectives: "",
        scope: "",
        method: "",
        expectedOutputs: "",
        startDate: "",
        endDate: "",
        status: "draft",
        level: "undergraduate",
        budget: 0,
        facultyId: 0,
        departmentId: 0,
        majorId: 0,
        createdBy: currentUser?.id || 0,
        supervisorId: 0,
        termId: 0,
        members: [],
      }));
    }
  }, [isOpen, currentUser?.id]);

  // Update form data when selected changes
  useEffect(() => {
    if (selectedProject) {
      setFormData({
        code: selectedProject.code,
        title: selectedProject.title,
        abstract: selectedProject.abstract,
        objectives: selectedProject.objectives,
        scope: selectedProject.scope,
        method: selectedProject.method,
        expectedOutputs: selectedProject.expectedOutputs,
        startDate: selectedProject.startDate?.slice(0, 10) || "",
        endDate: selectedProject.endDate?.slice(0, 10) || "",
        status: selectedProject.status as ProjectStatus,
        level: selectedProject.level as ProjectLevel,
        budget: selectedProject.budget,
        facultyId: selectedProject.facultyId,
        departmentId: selectedProject.departmentId,
        majorId: selectedProject.majorId,
        createdBy: selectedProject.createdBy,
        supervisorId: selectedProject.supervisorId,
        termId: selectedProject.termId,
        members: (selectedProject.members || []).map(m => ({ studentId: m.studentId, roleInTeam: m.roleInTeam })),
      });
    }
  }, [selectedProject]);

  const handleEdit = (project: ProjectEntity) => {
    setSelectedProject(project);
    openModal();
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa dự án này?");
    if (!isConfirmed) return;
    try {
      setIsSubmitting(true);
      await deleteProject(id.toString());
      toast.success("Xóa dự án thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error("Error in handleDelete:", error);
      toast.error("Không thể xóa dự án");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const transformCreatePayload = (data: CreateProjectDto): CreateProjectDto => {
      return {
        code: (data.code || "").trim(),
        title: (data.title || "").trim(),
        abstract: (data.abstract || "").trim(),
        objectives: (data.objectives || "").trim(),
        scope: (data.scope || "").trim(),
        method: (data.method || "").trim(),
        expectedOutputs: (data.expectedOutputs || "").trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        level: data.level,
        budget: typeof data.budget === "number" ? data.budget : 0,
        facultyId: Number(data.facultyId),
        departmentId: Number(data.departmentId),
        majorId: Number(data.majorId),
        createdBy: Number(data.createdBy),
        supervisorId: Number(data.supervisorId),
        termId: Number(data.termId),
        members: (data.members || []).map((m) => ({
          studentId: Number(m.studentId),
          roleInTeam: (m.roleInTeam || "Member").trim(),
        })),
      };
    };

    const transformUpdatePayload = (data: UpdateProjectDto): UpdateProjectDto => {
      const base: UpdateProjectDto = {
        code: (data.code || "").trim() || undefined,
        title: (data.title || "").trim() || undefined,
        abstract: (data.abstract || "").trim() || undefined,
        objectives: (data.objectives || "").trim() || undefined,
        scope: (data.scope || "").trim() || undefined,
        method: (data.method || "").trim() || undefined,
        expectedOutputs: (data.expectedOutputs || "").trim() || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        status: data.status,
        level: data.level,
        budget: typeof data.budget === "number" ? data.budget : undefined,
        facultyId: typeof data.facultyId === "number" ? data.facultyId : data.facultyId ? Number(data.facultyId) : undefined,
        departmentId: typeof data.departmentId === "number" ? data.departmentId : data.departmentId ? Number(data.departmentId) : undefined,
        majorId: typeof data.majorId === "number" ? data.majorId : data.majorId ? Number(data.majorId) : undefined,
        createdBy: typeof data.createdBy === "number" ? data.createdBy : data.createdBy ? Number(data.createdBy) : undefined,
        supervisorId: typeof data.supervisorId === "number" ? data.supervisorId : data.supervisorId ? Number(data.supervisorId) : undefined,
        termId: typeof data.termId === "number" ? data.termId : data.termId ? Number(data.termId) : undefined,
        members: data.members?.map((m) => ({
          studentId: Number(m.studentId),
          roleInTeam: (m.roleInTeam || "Member").trim(),
        })),
      };

      // Remove undefined keys
      const cleaned: Record<string, unknown> = {};
      Object.entries(base).forEach(([k, v]) => {
        if (v !== undefined) cleaned[k] = v;
      });
      return cleaned as UpdateProjectDto;
    };

    try {
      setIsSubmitting(true);
      if (selectedProject?.id) {
        const payload: UpdateProjectDto = transformUpdatePayload(formData as UpdateProjectDto);
        await updateProject(selectedProject.id.toString(), payload);
        toast.success("Cập nhật dự án thành công");
      } else {
        const payload: CreateProjectDto = transformCreatePayload(formData as CreateProjectDto);
        await createProject(payload);
        toast.success("Thêm dự án thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error("Error in handleSubmit:", error);
      toast.error(selectedProject?.id ? "Không thể cập nhật dự án" : "Không thể thêm dự án");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEducationLevelLabel = (value: string): string => {
    switch (value) {
      case "undergraduate":
        return "Đại học";
      case "graduate":
        return "Sau đại học";
      case "research":
        return "Nghiên cứu";
      default:
        return "Không xác định";
    }
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      approved: "Đã duyệt",
      pending: "Chờ duyệt",
      draft: "Nháp"
    };
  
    return statusMap[status] ?? "Không xác định";
  };
  
  const studentOptions = users
    .filter(u =>
      u.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Student) &&
      !u.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Admin)
  )
  .map(u => ({ value: u.id.toString(), label: u.name }));

  const handleMembersChange = (values: string[]) => {
    const updatedMembers: ProjectMemberDto[] = values.map(v => {
      const existing = (formData.members || []).find(m => m.studentId.toString() === v);
      return {
        studentId: parseInt(v, 10),
        roleInTeam: existing?.roleInTeam || "Member",
      };
    });
    setFormData({ ...formData, members: updatedMembers });
  };

  const handleMemberRoleChange = (studentId: number, role: string) => {
    const updated = (formData.members || []).map(m =>
      m.studentId === studentId ? { ...m, roleInTeam: role } : m
    );
    setFormData({ ...formData, members: updated });
  };

  const statusColorMap: Record<string, 
    "success" | "primary" | "error" | "info" | "warning" | "light"> = {
    in_progress: "success",
    completed: "primary",
    cancelled: "error",
    approved: "info",
    pending: "warning",
  };

  const getStatusColor = (status: string) => statusColorMap[status] || "light";

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-center gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm dự án
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1100px]">
          <Table>
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

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: ProjectEntity) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-200">
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" color="success">
                        {item.code}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" color="warning">
                        {item.term?.name}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" color="info">
                        {item.faculty?.name}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" color="primary">
                        {item.department?.name}
                      </Badge>
                      <Badge size="sm" color="light">
                        {item.major?.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.supervisorUser?.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Milestones ({item.projectMilestones?.length || 0})</div>
                      {item.projectMilestones && item.projectMilestones.length > 0 && (
                        <div className="space-y-1">
                          {item.projectMilestones
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((milestone) => (
                              <div key={milestone.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="lg:text-sm">{milestone.title}</span>
                                  {milestone.isRequired && (
                                    <Badge size="sm" color="error">Bắt buộc</Badge>
                                  )}
                                  <Badge
                                    size="sm"
                                    color={milestone.status === 'active' ? "success" : "light"}
                                  >
                                    {milestone.status === 'active' ? "Đang áp dụng" : "Chưa áp dụng"}
                                  </Badge>
                                  <Badge size="sm" color="warning">{milestone.dueDate}</Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {getEducationLevelLabel(item.level)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="space-y-1">
                      {(item.members || []).map(m => (
                        <div key={`${item.id}-${m.studentId}`} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded flex justify-between">
                          <span>{m.student?.name || m.studentId}</span>
                          <span>{m.roleInTeam}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      {rolesObject[UserRole.Admin] && (
                        <>
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
                        </>
                      )}
                      <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                        >
                          <EyeIcon />
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
            className="max-w-[900px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar max-h-[80vh]">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedProject
                    ? rolesObject[UserRole.Admin]
                      ? "Chỉnh sửa dự án"
                      : "Thông tin dự án"
                    : "Thêm dự án"}
                </h5>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Mã dự án</label>
                  <input
                    id="code"
                    type="text"
                    value={formData?.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập mã dự án"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tên dự án</label>
                  <input
                    id="title"
                    type="text"
                    value={formData?.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập tên dự án"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tóm tắt</label>
                  <textarea
                    id="abstract"
                    rows={3}
                    value={formData?.abstract || ""}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập tóm tắt dự án"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Mục tiêu</label>
                  <textarea
                    id="objectives"
                    rows={3}
                    value={formData?.objectives || ""}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập mục tiêu"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Phạm vi</label>
                  <textarea
                    id="scope"
                    rows={3}
                    value={formData?.scope || ""}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập phạm vi"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Phương pháp</label>
                  <textarea
                    id="method"
                    rows={3}
                    value={formData?.method || ""}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập phương pháp"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kết quả kỳ vọng</label>
                  <textarea
                    id="expectedOutputs"
                    rows={3}
                    value={formData?.expectedOutputs || ""}
                    onChange={(e) => setFormData({ ...formData, expectedOutputs: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập kết quả kỳ vọng"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ngày bắt đầu</label>
                    <input
                      id="startDate"
                      type="date"
                      value={formData?.startDate || ""}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ngày kết thúc</label>
                    <input
                      id="endDate"
                      type="date"
                      value={formData?.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 col-span-2">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Khoa</label>
                    <Select
                      value={formData?.facultyId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, facultyId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn khoa" }, ...faculties.map(f => ({ value: f.id.toString(), label: f.name }))]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Bộ môn</label>
                    <Select
                      value={formData?.departmentId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, departmentId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn bộ môn" }, ...departments.map(d => ({ value: d.id.toString(), label: d.name }))]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ngành</label>
                    <Select
                      value={formData?.majorId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, majorId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn ngành" }, ...majors.map(m => ({ value: m.id.toString(), label: m.name }))]}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 col-span-2">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Sự kiện</label>
                    <Select
                      value={formData?.termId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, termId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn sự kiện" }, ...terms.map(t => ({ value: t.id.toString(), label: t.name }))]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Giảng viên hướng dẫn</label>
                    <Select
                      value={formData?.supervisorId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, supervisorId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn giảng viên" }, ...users.filter(u => u.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Lecturer) &&
                        !u.userRoles?.some((ur: IUserRole) => ur.role.name === UserRole.Admin)).map(u => ({ value: u.id.toString(), label: u.name }))]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Trạng thái</label>
                    <Select
                      value={formData?.status as string}
                      onChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}
                      options={[
                        { value: "draft", label: "Nháp" },
                        { value: "pending", label: "Chờ duyệt" },
                        { value: "approved", label: "Đã duyệt" },
                        { value: "in_progress", label: "Đang thực hiện" },
                        { value: "completed", label: "Hoàn thành" },
                        { value: "cancelled", label: "Hủy" },
                      ]}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 col-span-2">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Cấp độ</label>
                    <Select
                      value={formData?.level as string}
                      onChange={(v) => setFormData({ ...formData, level: v as ProjectLevel })}
                      options={[
                        { value: "undergraduate", label: "Đại học" },
                        { value: "graduate", label: "Sau đại học" },
                        { value: "research", label: "Nghiên cứu" },
                      ]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ngân sách</label>
                    <input
                      id="budget"
                      type="number"
                      min="0"
                      value={formData?.budget?.toString() || "0"}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Thành viên</label>
                    <MultiSelect
                      value={(formData.members || []).map(m => m.studentId.toString())}
                      onChange={handleMembersChange}
                      options={studentOptions}
                      placeholder="Chọn thành viên"
                    />
                  </div>
                </div>
                {(formData.members || []).length > 0 && (
                  <div className="col-span-2">
                    <div className="rounded border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                      {(formData.members || []).map(member => (
                        <div key={member.studentId} className="grid grid-cols-3 gap-3 items-center">
                          <div className="text-sm text-gray-700 dark:text-gray-400">
                            {(users.find(u => u.id === member.studentId)?.name) || member.studentId}
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={member.roleInTeam}
                              onChange={(e) => handleMemberRoleChange(member.studentId, e.target.value)}
                              className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                              placeholder="Vai trò trong nhóm (VD: Leader, Member)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Đóng
                </button>
                {rolesObject[UserRole.Admin] && (
                  <button
                    onClick={handleSubmit}
                    type="button"
                  disabled={isSubmitting}
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                  >
                    {isSubmitting ? "Đang xử lý..." : selectedProject ? "Cập nhật" : "Thêm mới"}
                  </button>
                )}
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
} 
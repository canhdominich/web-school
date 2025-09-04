"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TableCell, TableRow } from "../ui/table";
import { Header, Term, Major, Faculty, Department, User, IUserRole, IMilestoneSubmissions } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import Badge from "../ui/badge/Badge";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { UserRole } from "@/constants/user.constant";
import { getUsers } from "@/services/userService";
import { getTerms } from "@/services/termService";
import { getMajors } from "@/services/majorService";
import { getFaculties } from "@/services/facultyService";
import { getDepartments } from "@/services/departmentService";
import { VERY_BIG_NUMBER } from "@/constants/common";
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
import { PencilIcon } from "@/icons";
import { createMilestoneSubmissionSimple, getMilestoneSubmissionsByMilestoneId } from "@/services/milestoneSubmissionService";
import { gradeProject, getProjectGrades, getCouncilsForProjectGrading } from "@/services/councilService";
import { Council } from "@/types/common";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";

interface ProjectDataTableProps {
  onRefresh: () => void;
  items: ProjectEntity[];
  headers: Header[];
  searchTerm?: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export default function ProjectDataTable({ 
  headers, 
  items, 
  onRefresh, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: ProjectDataTableProps) {
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
    status: "pending",
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
  const [isSubmittingMilestoneId, setIsSubmittingMilestoneId] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState<{ fileUrl: string; note: string }>({ fileUrl: "", note: "" });
  const [submitEmails, setSubmitEmails] = useState<string[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMilestoneForHistory, setSelectedMilestoneForHistory] = useState<{ id: string; title: string } | null>(null);
  const [milestoneSubmissions, setMilestoneSubmissions] = useState<IMilestoneSubmissions[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedProjectForGrading, setSelectedProjectForGrading] = useState<ProjectEntity | null>(null);
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
  const [gradingForm, setGradingForm] = useState({
    score: '',
    comment: '',
  });
  const [isGrading, setIsGrading] = useState(false);
  const [projectGrades, setProjectGrades] = useState<Array<{
    id: number;
    lecturerId: number;
    lecturerName: string;
    score: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
  }>>([]);

  // Add state to store council information for each project
  const [projectCouncils, setProjectCouncils] = useState<Record<number, Council | null>>({});


  // Helper function để kiểm tra quyền chỉnh sửa project
  const canEditProject = (project: ProjectEntity | null): boolean => {
    if (!project) return true; // Cho phép tạo mới
    if (rolesObject[UserRole.Admin]) return true; // Admin luôn được chỉnh sửa
    if (rolesObject[UserRole.Student]) {
      // Sinh viên chỉ được chỉnh sửa khi trạng thái là draft hoặc pending
      return project.status === 'draft' || project.status === 'pending';
    }
    return true; // Các role khác được chỉnh sửa
  };

  // Helper function để kiểm tra quyền xóa project (chỉ Admin)
  const canDeleteProject = (): boolean => {
    return rolesObject[UserRole.Admin];
  };

  // Load council information for all projects
  const loadProjectCouncils = useCallback(async () => {
    if (items.length === 0) return;
    
    try {
      const councilsData: Record<number, Council | null> = {};
      
      // Load council for each project
      for (const project of items) {
        try {
          const councils = await getCouncilsForProjectGrading(project.id.toString());
          councilsData[project.id] = councils.length > 0 ? councils[0] : null;
        } catch (error) {
          console.error(`Error loading council for project ${project.id}:`, error);
          councilsData[project.id] = null;
        }
      }
      
      setProjectCouncils(councilsData);
    } catch (error) {
      console.error('Error loading project councils:', error);
    }
  }, [items]);

  const canChangeProjectStatus = (): boolean => {
    return rolesObject[UserRole.Admin] || 
      !rolesObject[UserRole.Student] || 
      !selectedProject || 
      selectedProject.status === 'draft' 
      || selectedProject.status === 'pending';
  };

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
          getTerms({ limit: VERY_BIG_NUMBER }),
          getMajors({ limit: VERY_BIG_NUMBER }),
          getFaculties({ limit: VERY_BIG_NUMBER }),
          getDepartments({ limit: VERY_BIG_NUMBER }),
          getUsers({ limit: VERY_BIG_NUMBER }),
        ]);
        
        // Handle both array and paginated response
        setTerms(Array.isArray(termList) ? termList : termList.data);
        setMajors(Array.isArray(majorList) ? majorList : majorList.data);
        setFaculties(Array.isArray(facultyList) ? facultyList : facultyList.data);
        setDepartments(Array.isArray(departmentList) ? departmentList : departmentList.data);
        setUsers(Array.isArray(userList) ? userList : userList.data);
      } catch (e) {
        console.error(e);
        toast.error(getErrorMessage(e, "Không thể tải dữ liệu chọn"));
      }
    })();
  }, []);

  // Load project councils when items change
  useEffect(() => {
    loadProjectCouncils();
  }, [loadProjectCouncils]);

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
        status: "pending",
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
    
    // Kiểm tra quyền xóa trước khi thực hiện
    if (!canDeleteProject()) {
      toast.error("Bạn không có quyền xóa đề tài");
      return;
    }
    
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa đề tài này?");
    if (!isConfirmed) return;
    try {
      setIsSubmitting(true);
      await deleteProject(id.toString());
      toast.success("Xóa đề tài thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error("Error in handleDelete:", error);
      toast.error(getErrorMessage(error, "Không thể xóa đề tài"));
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
        toast.success("Cập nhật đề tài thành công");
      } else {
        const payload: CreateProjectDto = transformCreatePayload(formData as CreateProjectDto);
        await createProject(payload);
        toast.success("Thêm đề tài thành công");
      }
      closeModal();
      onRefresh();
      // Refresh project council information after creating/updating project
      setTimeout(() => loadProjectCouncils(), 100);
    } catch (error: unknown) {
      console.error("Error in handleSubmit:", error);
      toast.error(getErrorMessage(error, selectedProject?.id ? "Không thể cập nhật đề tài" : "Không thể thêm đề tài"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmitModal = (project: ProjectEntity, milestoneId: string) => {
    const emailsSet = new Set<string>();
    if (project.supervisorUser?.email) emailsSet.add(project.supervisorUser.email);
    (project.members || []).forEach(m => {
      const email = m.student?.email;
      if (email) emailsSet.add(email);
    });
    setSubmitEmails(Array.from(emailsSet));
    setSelectedMilestoneId(milestoneId);
    setSubmitForm({ fileUrl: "", note: "" });
    setIsSubmitModalOpen(true);
  };

  const openHistoryModal = async (milestone: { id: string; title: string }) => {
    setSelectedMilestoneForHistory(milestone);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const submissions = await getMilestoneSubmissionsByMilestoneId(milestone.id);
      setMilestoneSubmissions(submissions.sort((a, b) => b.version - a.version));
    } catch (error) {
      console.error("Error loading milestone submissions:", error);
      toast.error(getErrorMessage(error, "Không thể tải lịch sử nộp tài liệu"));
      setMilestoneSubmissions([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const submitMilestone = async () => {
    if (!selectedMilestoneId) return;
    if (isSubmittingMilestoneId) return;
    try {
      setIsSubmittingMilestoneId(selectedMilestoneId);
      await createMilestoneSubmissionSimple({
        milestoneId: Number(selectedMilestoneId),
        note: submitForm.note || undefined,
        fileUrl: submitForm.fileUrl || undefined,
      });
      toast.success("Nộp tài liệu thành công");
      setIsSubmitModalOpen(false);
    } catch (error: unknown) {
      console.error("Error submitting milestone:", error);
      toast.error(getErrorMessage(error, "Không thể nộp tài liệu"));
    } finally {
      setIsSubmittingMilestoneId(null);
    }
  };

  const openGradingModal = async (project: ProjectEntity) => {
    setSelectedProjectForGrading(project);
    setGradingForm({ score: '', comment: '' });
    setSelectedCouncil(null);
    setProjectGrades([]);
    
    // Fetch the single council assigned to this project
    try {
      const councilsData = await getCouncilsForProjectGrading(project.id.toString());
      if (councilsData.length > 0) {
        // Since each project belongs to only one council, take the first one
        const projectCouncil = councilsData[0];
        setSelectedCouncil(projectCouncil);
        
        // Load existing grades for this council and project
        const grades = await getProjectGrades(projectCouncil.id.toString(), project.id.toString());
        setProjectGrades(grades);
      } else {
        toast.error('Đề tài này chưa được gán cho hội đồng nào');
        return;
      }
    } catch (error) {
      console.error('Error fetching council for grading:', error);
      toast.error(getErrorMessage(error, 'Không thể tải thông tin hội đồng'));
      return;
    }
    
    setShowGradingModal(true);
  };

  const handleGradingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForGrading || !gradingForm.score) return;

    try {
      setIsGrading(true);
      const score = parseFloat(gradingForm.score);
      if (isNaN(score) || score < 0 || score > 10) {
        toast.error('Điểm phải trong khoảng 0-10');
        return;
      }

      // Get current user ID from context or localStorage
      let currentUserId: number | null = null;
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        currentUserId = parsedUser.id;
      }
      
      if (!currentUserId) {
        toast.error('Không thể xác định người dùng hiện tại');
        return;
      }

      await gradeProject(
        selectedCouncil!.id.toString(),
        selectedProjectForGrading.id.toString(),
        score,
        gradingForm.comment || undefined,
        currentUserId
      );

      toast.success('Chấm điểm thành công');
      setShowGradingModal(false);
      onRefresh(); // Refresh to get updated average score
      // Refresh project council information after grading
      setTimeout(() => loadProjectCouncils(), 100);
    } catch (error: unknown) {
      console.error('Error in grading:', error);
      toast.error(getErrorMessage(error, 'Không thể chấm điểm'));
    } finally {
      setIsGrading(false);
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
      u.userRoles?.some((ur: IUserRole) => ur?.role?.name === UserRole.Student) &&
      !u.userRoles?.some((ur: IUserRole) => ur?.role?.name === UserRole.Admin)
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

  // Render row function
  const renderRow = (item: ProjectEntity) => (
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
      <TableCell className="px-4 py-3 text-gray-800 text-center text-theme-sm dark:text-gray-200">
        {item.averageScore ? (parseFloat(item.averageScore.toString())?.toFixed(1)) : '-'}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {projectCouncils[item.id] ? (
          <div className="flex items-center gap-2">
            <Badge size="sm" color="success">
              {projectCouncils[item.id]?.name}
            </Badge>
            {projectCouncils[item.id]?.faculty?.name && (
              <Badge size="sm" color="light">
                {projectCouncils[item.id]!.faculty!.name}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Chưa gán hội đồng</span>
        )}
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
                    <div className="flex items-center gap-2">
                      {rolesObject[UserRole.Student] && milestone.status === 'active' && (
                      <button
                        onClick={() => openSubmitModal(item, milestone.id)}
                        className="btn btn-success btn-update-event rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                        disabled={isSubmittingMilestoneId === milestone.id}
                      >
                        {isSubmittingMilestoneId === milestone.id ? "Đang nộp..." : "Nộp tài liệu"}
                      </button>
                      )}
                      <button
                        onClick={() =>
                          openHistoryModal({ id: milestone.id, title: milestone.title })
                        }
                        className="btn btn-info btn-update-event rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-700"
                      >
                        Lịch sử nộp
                      </button>
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
          <button
            onClick={() => handleEdit(item)}
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Sửa
          </button>
          {canDeleteProject() && (
            <button
              onClick={() => handleDelete(item.id)}
              className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
            >
              Xóa
            </button>
          )}
          <button
            onClick={() => openGradingModal(item)}
            className="btn btn-info btn-update-event flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto"
            title="Chấm điểm đề tài"
          >
            <PencilIcon />
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
      Thêm đề tài
    </button>
  );

  return (
    <>
      <SearchableDataTable<ProjectEntity>
        headers={headers}
        items={items}
        renderRow={renderRow}
        searchTerm={searchTerm}
        onSearch={onSearch}
        searchPlaceholder="Tìm kiếm theo tên đề tài..."
        isSearching={isSearching}
        pagination={pagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        actionButton={actionButton}
      />

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
                      ? "Chỉnh sửa đề tài"
                      : "Thông tin đề tài"
                    : "Thêm đề tài"}
                </h5>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Mã đề tài</label>
                  <input
                    id="code"
                    type="text"
                    value={formData?.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={!canEditProject(selectedProject)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50"
                    placeholder="Nhập mã đề tài"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tên đề tài</label>
                  <input
                    id="title"
                    type="text"
                    value={formData?.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={!canEditProject(selectedProject)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50"
                    placeholder="Nhập tên đề tài"
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
                    placeholder="Nhập tóm tắt đề tài"
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
                      disabled={!canChangeProjectStatus()}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Bộ môn</label>
                    <Select
                      value={formData?.departmentId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, departmentId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn bộ môn" }, ...departments.map(d => ({ value: d.id.toString(), label: d.name }))]}
                      disabled={!canChangeProjectStatus()}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ngành</label>
                    <Select
                      value={formData?.majorId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, majorId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn ngành" }, ...majors.map(m => ({ value: m.id.toString(), label: m.name }))]}
                      disabled={!canChangeProjectStatus()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 col-span-2">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tiến độ</label>
                    <Select
                      value={formData?.termId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, termId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn tiến độ" }, ...terms.map(t => ({ value: t.id.toString(), label: t.name }))]}
                      disabled={!canChangeProjectStatus()}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Giảng viên hướng dẫn</label>
                    <Select
                      value={formData?.supervisorId?.toString() || "0"}
                      onChange={(v) => setFormData({ ...formData, supervisorId: parseInt(v, 10) })}
                      options={[{ value: "0", label: "Chọn giảng viên" }, ...users.filter(u => u.userRoles?.some((ur: IUserRole) => ur?.role?.name === UserRole.Lecturer) &&
                        !u.userRoles?.some((ur: IUserRole) => ur?.role?.name === UserRole.Admin)).map(u => ({ value: u.id.toString(), label: u.name }))]}
                      disabled={!canChangeProjectStatus()}
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
                      disabled={!canChangeProjectStatus() || !selectedProject || (selectedProject && rolesObject[UserRole.Student])}
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
                      disabled={!canChangeProjectStatus()}
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
                      disabled={!canEditProject(selectedProject)}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Thành viên</label>
                    <MultiSelect
                      value={(formData.members || []).map(m => m.studentId.toString())}
                      onChange={handleMembersChange}
                      options={studentOptions}
                      placeholder="Chọn thành viên"
                      disabled={!canEditProject(selectedProject)}
                    />
                  </div>
                </div>
                {(formData.members || []).length > 0 && (
                  <div className="col-span-2">
                    <div className="rounded border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                      {(formData.members || []).map(member => (
                        <div key={member.studentId} className="grid grid-cols-3 gap-3 items-center">
                          <div className="text-sm text-gray-700 dark:text-gray-400">
                            {(users.find(u => Number(u.id) === Number(member.studentId))?.name) || member.studentId}
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={member.roleInTeam}
                              onChange={(e) => handleMemberRoleChange(member.studentId, e.target.value)}
                              disabled={!canEditProject(selectedProject)}
                              className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50"
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
                {/* Chỉ hiển thị nút Cập nhật khi:
                    1. Không phải sinh viên, HOẶC
                    2. Là sinh viên nhưng trạng thái project là draft/pending */}
                {(!rolesObject[UserRole.Student] || !selectedProject ||
                  (rolesObject[UserRole.Student] && selectedProject && 
                   (selectedProject.status === 'draft' || selectedProject.status === 'pending'))) && (
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
          <Modal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            className="max-w-[560px] p-6 lg:p-8"
          >
            <div className="flex flex-col gap-4">
              <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">Nộp tài liệu mốc</h5>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Yêu cầu share tài liệu cho các mail của các thành viên trong đề tài, giảng viên hướng dẫn:{" "}
                <span className="font-bold text-white">
                  {submitEmails.join(", ")}
                </span>
              </p>
              <div className="mb-3">
                <label className="mb-1.5 block text-base font-medium text-gray-700 dark:text-gray-400">Link tài liệu</label>
                <input
                  type="url"
                  value={submitForm.fileUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                  placeholder="Dán link tài liệu (Google Drive, OneDrive, v.v.)"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-base font-medium text-gray-700 dark:text-gray-400">Ghi chú</label>
                <textarea
                  rows={4}
                  value={submitForm.note}
                  onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
                  placeholder="Nhập ghi chú (tuỳ chọn)"
                  className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              <div className="flex items-center gap-3 mt-2 sm:justify-end">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Đóng
                </button>
                <button
                  onClick={submitMilestone}
                  type="button"
                  disabled={!selectedMilestoneId || isSubmittingMilestoneId === selectedMilestoneId}
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {isSubmittingMilestoneId === selectedMilestoneId ? "Đang nộp..." : "Nộp"}
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            className="max-w-[1000px] p-6 lg:p-8"
          >
            <div className="flex flex-col gap-4">
              <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-xl">
                Lịch sử nộp tài liệu: {selectedMilestoneForHistory?.title}
              </h5>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
                </div>
              ) : milestoneSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">Chưa có lịch sử nộp tài liệu</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-base font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                          Phiên bản
                        </th>
                        <th className="px-6 py-3 text-left text-base font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                          Người nộp
                        </th>
                        <th className="px-6 py-3 text-left text-base font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                          Thời gian nộp
                        </th>
                        <th className="px-6 py-3 text-left text-base font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                          Ghi chú
                        </th>
                        <th className="px-6 py-3 text-left text-base font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                          Link tài liệu
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {milestoneSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 dark:text-white">
                            v{submission.version}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                            {submission.submittedByUser?.name || submission.submittedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                            {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-base text-gray-500 dark:text-gray-400 max-w-xs">
                            {submission.note || '-'}
                          </td>
                          <td className="px-6 py-4 text-base text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {submission.fileUrl ? (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                              >
                                Xem tài liệu
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex items-center gap-3 mt-4 sm:justify-end">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Đóng
                </button>
              </div>
            </div>
          </Modal>

      {/* Grading Modal */}
      <Modal
        isOpen={showGradingModal}
        onClose={() => setShowGradingModal(false)}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Chấm điểm đề tài
            </h5>
            {selectedProjectForGrading && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                Đề tài: {selectedProjectForGrading.title} ({selectedProjectForGrading.code})
              </p>
            )}
          </div>

          <form onSubmit={handleGradingSubmit} className="mt-8 space-y-6">
            {selectedCouncil ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Hội đồng chấm điểm
                </label>
                <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {selectedCouncil.name} - {selectedCouncil.faculty?.name || 'N/A'}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-red-500 dark:text-red-400">Không tìm thấy hội đồng cho đề tài này</div>
              </div>
            )}

            {selectedCouncil && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Điểm (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={gradingForm.score}
                    onChange={(e) => setGradingForm({ ...gradingForm, score: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    placeholder="Nhập điểm từ 0-10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    value={gradingForm.comment}
                    onChange={(e) => setGradingForm({ ...gradingForm, comment: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    placeholder="Nhập nhận xét (nếu có)"
                    rows={3}
                  />
                </div>

                {projectGrades.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-base font-medium text-gray-700 dark:text-gray-400">
                      Điểm đã chấm
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {projectGrades.map(grade => (
                        <div key={grade.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <span>{grade.lecturerName}</span>
                          <span className="font-medium">{grade.score}</span>
                          {grade.comment && <span className="text-gray-500">({grade.comment})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-3 modal-footer sm:justify-end">
              <button
                onClick={() => setShowGradingModal(false)}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isGrading || !gradingForm.score}
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto disabled:opacity-50"
              >
                {isGrading ? "Đang chấm điểm..." : "Chấm điểm"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
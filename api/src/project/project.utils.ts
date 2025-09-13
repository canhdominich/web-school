import { ProjectStatus } from './project.entity';

export function getProjectStatusLabel(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    [ProjectStatus.DRAFT]: 'Nháp',
    [ProjectStatus.PENDING]: 'Chờ duyệt',
    [ProjectStatus.APPROVED_BY_LECTURER]: 'Giảng viên đã duyệt',
    [ProjectStatus.APPROVED_BY_FACULTY_DEAN]: 'Trưởng khoa đã duyệt',
    [ProjectStatus.APPROVED_BY_RECTOR]: 'Phòng NCKH duyệt',
    [ProjectStatus.IN_PROGRESS]: 'Đang thực hiện',
    [ProjectStatus.COMPLETED]: 'Hoàn thành',
    [ProjectStatus.CANCELLED]: 'Đã hủy',
  };
  return map[status] ?? 'Không xác định';
}

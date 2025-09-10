"use client";
import React, { useState, useCallback, useEffect } from "react";
import { TableCell, TableRow } from "../ui/table";
import { Header } from "@/types/common";
import Badge from "../ui/badge/Badge";
import {
  ProjectEntity,
} from "@/services/projectService";
import { getCouncilsForProjectGrading } from "@/services/councilService";
import { Council } from "@/types/common";
import SearchableDataTable from "../common/SearchableDataTable";
import { PaginationInfo } from "../common/Pagination";
import { PASS_SCORE } from "@/constants/common";

interface ArchiveDataTableProps {
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

export default function ArchiveDataTable({ 
  headers, 
  items, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: ArchiveDataTableProps) {
  // Add state to store council information for each project
  const [projectCouncils, setProjectCouncils] = useState<Record<number, Council | null>>({});
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

  // Load project councils when items change
  useEffect(() => {
    loadProjectCouncils();
  }, [loadProjectCouncils]);

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      approved_by_lecturer: "Giảng viên đã duyệt",
      approved_by_faculty_dean: "Trưởng khoa đã duyệt",
      approved_by_rector: "Trường đã duyệt",
      pending: "Chờ duyệt",
      draft: "Nháp"
    };
  
    return statusMap[status] ?? "Không xác định";
  };

  const statusColorMap: Record<string, 
    "success" | "primary" | "error" | "info" | "warning" | "light"> = {
    in_progress: "success",
    completed: "primary",
    cancelled: "error",
    approved_by_lecturer: "info",
    approved_by_faculty_dean: "info",
    approved_by_rector: "info",
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
      <TableCell className="px-4 py-3 text-red-800 text-center text-theme-base dark:text-red-200 font-bold">
        {item.averageScore ? (parseFloat(item.averageScore.toString())?.toFixed(1)) : '-'}
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-base dark:text-gray-400">
        <Badge size="sm" color={(item.averageScore ?? 0) >= PASS_SCORE ? 'success' : 'error'}>
          {(item.averageScore ?? 0) >= PASS_SCORE ? 'Đạt' : 'Không đạt'}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {projectCouncils[item.id] ? (
          <>
            <div className="flex items-center gap-2">
              <Badge size="sm" color="primary">
                {projectCouncils[item.id]?.name}
              </Badge>
            </div>
            <div className="mt-2">
              {projectCouncils[item.id]?.faculty?.name && (
                <Badge size="sm" color="warning">
                  {projectCouncils[item.id]!.faculty!.name}
                </Badge>
              )}
            </div>
          </>
        ) : (
          <span className="text-gray-400 text-xs">Chưa gán hội đồng</span>
        )}
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
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-base dark:text-gray-400">
        <div className="space-y-2">
          {item.lastMilestoneSubmission?.fileUrl ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(item?.lastMilestoneSubmission?.fileUrl || '', '_blank')}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Xem file
              </button>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          {item.lastMilestoneSubmission?.note && (
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-medium">Ghi chú:</span> {item.lastMilestoneSubmission.note}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        <Badge size="sm" color={getStatusColor(item.status)}>
          {getStatusLabel(item.status)}
        </Badge>
      </TableCell>
    </TableRow>
  );

  return (
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
    />
  );
}
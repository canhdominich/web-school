"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { getFaculties } from "@/services/facultyService";
import { getAcademicYears } from "@/services/academicYearService";
import type { Faculty, AcademicYear } from "@/types/common";
import { VERY_BIG_NUMBER } from "@/constants/common";

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
  onFilterChange?: (filters: { facultyId?: number; academicYearId?: number }) => void;
  facultyId?: number;
  academicYearId?: number;
}

export default function ArchiveDataTable({ 
  headers, 
  items, 
  searchTerm = "", 
  onSearch,
  isSearching = false,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onFilterChange,
  facultyId,
  academicYearId,
}: ArchiveDataTableProps) {
  // Add state to store council information for each project
  const [projectCouncils, setProjectCouncils] = useState<Record<number, Council | null>>({});
  // Filter sources
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  // Selected filters
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");

  // Sync internal state from controlled props
  useEffect(() => {
    if (facultyId !== undefined && facultyId !== null) {
      setSelectedFacultyId(String(facultyId));
    }
  }, [facultyId]);
  useEffect(() => {
    if (academicYearId !== undefined && academicYearId !== null) {
      setSelectedAcademicYearId(String(academicYearId));
    }
  }, [academicYearId]);
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

  // Load filter options (faculties, academic years)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [facRes, yearRes] = await Promise.all([
          getFaculties({ limit: VERY_BIG_NUMBER }),
          getAcademicYears({ limit: VERY_BIG_NUMBER }),
        ]);
        setFaculties(facRes?.data || []);
        setAcademicYears(yearRes?.data || []);
      } catch {
        // Fallback to empty lists on error
        setFaculties([]);
        setAcademicYears([]);
      }
    };
    fetchFilters();
  }, []);

  // Keep latest onFilterChange in a ref and emit only on real changes
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  const lastEmittedFiltersRef = useRef<{ facultyId?: number; academicYearId?: number }>({});
  useEffect(() => {
    const payload: { facultyId?: number; academicYearId?: number } = {};
    if (selectedFacultyId) payload.facultyId = Number(selectedFacultyId);
    if (selectedAcademicYearId) payload.academicYearId = Number(selectedAcademicYearId);

    // Do not emit if nothing selected (avoid refresh loop on initial render)
    if (Object.keys(payload).length === 0) return;

    const last = lastEmittedFiltersRef.current || {};
    const isSame = last.facultyId === payload.facultyId && last.academicYearId === payload.academicYearId;
    if (isSame) return;

    lastEmittedFiltersRef.current = payload;
    onFilterChangeRef.current?.(payload);
  }, [selectedFacultyId, selectedAcademicYearId]);

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      approved_by_lecturer: "Giảng viên đã duyệt",
      approved_by_faculty_dean: "Trưởng khoa đã duyệt",
      approved_by_rector: "Phòng NCKH duyệt",
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
      actionButton={(
        <div className="flex items-center gap-3">
          <div>
            <label className="sr-only">Khoa</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="dark:bg-dark-900 h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            >
              <option value="">Tất cả khoa</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only">Năm học</label>
            <select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
              className="dark:bg-dark-900 h-10 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            >
              <option value="">Tất cả năm học</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="button"
              onClick={() => { 
                setSelectedFacultyId(""); 
                setSelectedAcademicYearId(""); 
                // Gọi ngay để refresh dữ liệu toàn trang khi xóa bộ lọc
                onFilterChangeRef.current?.({});
              }}
              disabled={!selectedFacultyId && !selectedAcademicYearId}
              className="inline-flex items-center h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              title="Xóa bộ lọc"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}
    />
  );
}
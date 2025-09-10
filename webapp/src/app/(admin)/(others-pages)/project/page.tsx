"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProjectDataTable from "@/components/project/ProjectDataTable";
import { getProjects, ProjectEntity, SearchProjectDto } from "@/services/projectService";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function ProjectPage() {
  const headers = [
    { key: "title", title: "Tên đề tài" },
    { key: "lecturer", title: "Hướng dẫn" },
    { key: "averageScore", title: "Điểm TB" },
    { key: "council", title: "Hội đồng" },
    { key: "milestone", title: "Cột mốc" },
    { key: "level", title: "Cấp độ" },
    { key: "members", title: "Thành viên" },
    { key: "status", title: "Trạng thái" },
    { key: "action", title: "Hành động" },
  ];

  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use pagination hook
  const {
    currentPage,
    itemsPerPage,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    setTotalItems,
    setTotalPages,
    resetToFirstPage,
  } = usePagination();

  const fetchProjects = useCallback(async (params?: SearchProjectDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchProjectDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getProjects(searchParams);
      
      // API now always returns paginated response
      setProjects(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách đề tài"));
    } finally {
      if (isSearch) {
        setIsSearching(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [currentPage, itemsPerPage, setTotalItems, setTotalPages]);

  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setSearchTerm(trimmedQuery);
    resetToFirstPage(); // Reset to first page when searching
    
    if (trimmedQuery) {
      fetchProjects({ title: trimmedQuery }, true);
    } else {
      // If no search term, fetch all projects
      fetchProjects({}, true);
    }
  }, [fetchProjects, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
    if (searchTerm.trim()) {
      fetchProjects({ title: searchTerm.trim() }, true);
    } else {
      fetchProjects({}, true);
    }
  }, [searchTerm, fetchProjects]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchProjects({});
  }, [fetchProjects]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý đề tài" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <ProjectDataTable
              headers={headers}
              items={projects}
              onRefresh={handleRefresh}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              isSearching={isSearching}
              pagination={paginationInfo}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
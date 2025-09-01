"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProjectDataTable from "@/components/project/ProjectDataTable";
import { getProjects, ProjectEntity, SearchProjectDto, PaginatedProjectResponse } from "@/services/projectService";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

export default function ProjectPage() {
  const headers = [
    { key: "title", title: "Tên dự án" },
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

  const fetchProjects = useCallback(async (params?: SearchProjectDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getProjects(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        const paginatedData = data as PaginatedProjectResponse;
        setProjects(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách dự án"));
    } finally {
      if (isSearch) {
        setIsSearching(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setSearchTerm(trimmedQuery);
    
    if (trimmedQuery) {
      fetchProjects({ title: trimmedQuery }, true);
    } else {
      // If no search term, fetch all projects
      fetchProjects({}, true);
    }
  }, [fetchProjects]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      fetchProjects({ title: searchTerm.trim() }, true);
    } else {
      fetchProjects({}, true);
    }
  }, [searchTerm, fetchProjects]);

  // Initial load
  useEffect(() => {
    fetchProjects({});
  }, [fetchProjects]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý dự án" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách dự án...</p>
              </div>
            </div>
          ) : (
            <ProjectDataTable
              headers={headers}
              items={projects as unknown as ProjectEntity[]}
              onRefresh={handleRefresh}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
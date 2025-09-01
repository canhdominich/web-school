"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DepartmentDataTable from "@/components/department/DepartmentDataTable";
import { getDepartments, SearchDepartmentDto, PaginatedDepartmentResponse } from "@/services/departmentService";
import { Department } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

export default function DepartmentPage() {
  const headers = [
    { key: "name", title: "Tên bộ môn" },
    { key: "code", title: "Mã bộ môn" },
    { key: "description", title: "Mô tả" },
    { key: "faculty", title: "Khoa" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDepartments = useCallback(async (params?: SearchDepartmentDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getDepartments(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setDepartments(data);
      } else {
        const paginatedData = data as PaginatedDepartmentResponse;
        setDepartments(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách bộ môn"));
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
      fetchDepartments({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all departments
      fetchDepartments({}, true);
    }
  }, [fetchDepartments]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      fetchDepartments({ name: searchTerm.trim() }, true);
    } else {
      fetchDepartments({}, true);
    }
  }, [searchTerm, fetchDepartments]);

  // Initial load
  useEffect(() => {
    fetchDepartments({});
  }, [fetchDepartments]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý bộ môn" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <DepartmentDataTable 
              headers={headers} 
              items={departments} 
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
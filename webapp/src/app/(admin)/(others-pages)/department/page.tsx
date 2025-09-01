"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DepartmentDataTable from "@/components/department/DepartmentDataTable";
import { getDepartments, SearchDepartmentDto } from "@/services/departmentService";
import { Department } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

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

  const fetchDepartments = useCallback(async (params?: SearchDepartmentDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchDepartmentDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getDepartments(searchParams);
      
      // API now always returns paginated response
      setDepartments(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
      // Don't override currentPage from API response, let the pagination hook handle it
      // setCurrentPage(data.page); // Remove this line
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách bộ môn"));
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
      fetchDepartments({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all departments
      fetchDepartments({}, true);
    }
  }, [fetchDepartments, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
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

  // Fetch data when pagination changes
  useEffect(() => {
    if (!isLoading) {
      fetchDepartments({});
    }
  }, [currentPage, itemsPerPage, fetchDepartments, isLoading]);

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
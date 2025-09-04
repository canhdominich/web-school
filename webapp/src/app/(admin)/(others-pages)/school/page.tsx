"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SchoolDataTable from "@/components/school/SchoolDataTable";
import { getSchools, SearchSchoolDto } from "@/services/schoolService";
import { School } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function SchoolPage() {
  const headers = [
    { key: "name", title: "Tên trường" },
    { key: "code", title: "Mã trường" },
    { key: "description", title: "Mô tả" },
    { key: "address", title: "Địa chỉ" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [schools, setSchools] = useState<School[]>([]);
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

  const fetchSchools = useCallback(async (params?: SearchSchoolDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchSchoolDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getSchools(searchParams);
      
      // API now always returns paginated response
      setSchools(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách trường"));
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
      fetchSchools({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all schools
      fetchSchools({}, true);
    }
  }, [fetchSchools, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
    if (searchTerm.trim()) {
      fetchSchools({ name: searchTerm.trim() }, true);
    } else {
      fetchSchools({}, true);
    }
  }, [searchTerm, fetchSchools]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchSchools({});
  }, [fetchSchools]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý trường" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <SchoolDataTable 
              headers={headers} 
              items={schools} 
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

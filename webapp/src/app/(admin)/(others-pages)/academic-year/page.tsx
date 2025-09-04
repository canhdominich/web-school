"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AcademicYearDataTable from "@/components/academic-year/AcademicYearDataTable";
import { getAcademicYears, SearchAcademicYearDto } from "@/services/academicYearService";
import { AcademicYear } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function AcademicYearPage() {
  const headers = [
    { key: "name", title: "Tên năm học" },
    { key: "code", title: "Mã năm học" },
    { key: "description", title: "Mô tả" },
    { key: "startDate", title: "Ngày bắt đầu" },
    { key: "endDate", title: "Ngày kết thúc" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
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

  const fetchAcademicYears = useCallback(async (params?: SearchAcademicYearDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchAcademicYearDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getAcademicYears(searchParams);
      
      // API now always returns paginated response
      setAcademicYears(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách năm học"));
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
      fetchAcademicYears({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all academic years
      fetchAcademicYears({}, true);
    }
  }, [fetchAcademicYears, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
    if (searchTerm.trim()) {
      fetchAcademicYears({ name: searchTerm.trim() }, true);
    } else {
      fetchAcademicYears({}, true);
    }
  }, [searchTerm, fetchAcademicYears]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchAcademicYears({});
  }, [fetchAcademicYears]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý năm học" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <AcademicYearDataTable 
              headers={headers} 
              items={academicYears} 
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

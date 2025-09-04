"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MajorDataTable from "@/components/major/MajorDataTable";
import { getMajors, SearchMajorDto } from "@/services/majorService";
import { Major } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function MajorPage() {
  const headers = [
    { key: "name", title: "Tên ngành học" },
    { key: "code", title: "Mã ngành học" },
    { key: "description", title: "Mô tả" },
    { key: "department", title: "Bộ môn/Khoa/Trường" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [majors, setMajors] = useState<Major[]>([]);
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

  const fetchMajors = useCallback(async (params?: SearchMajorDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchMajorDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getMajors(searchParams);
      
      // API now always returns paginated response
      setMajors(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
      // Don't override currentPage from API response, let the pagination hook handle it
      // setCurrentPage(data.page); // Remove this line
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách ngành học"));
    } finally {
      if (isSearch) {
        setIsSearching(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [currentPage, itemsPerPage]);

  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setSearchTerm(trimmedQuery);
    resetToFirstPage(); // Reset to first page when searching
    
    if (trimmedQuery) {
      fetchMajors({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all majors
      fetchMajors({}, true);
    }
  }, [fetchMajors, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
    if (searchTerm.trim()) {
      fetchMajors({ name: searchTerm.trim() }, true);
    } else {
      fetchMajors({}, true);
    }
  }, [searchTerm, fetchMajors]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchMajors({});
  }, [fetchMajors]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý ngành học" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <MajorDataTable 
              headers={headers} 
              items={majors} 
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
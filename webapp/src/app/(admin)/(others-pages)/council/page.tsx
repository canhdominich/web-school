"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CouncilDataTable from "@/components/council/CouncilDataTable";
import { getCouncils, SearchCouncilDto } from "@/services/councilService";
import { Council } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function CouncilPage() {
  const headers = [
    { key: "name", title: "Tên hội đồng" },
    { key: "description", title: "Mô tả" },
    { key: "faculty", title: "Khoa" },
    { key: "status", title: "Trạng thái" },
    { key: "members", title: "Thông tin hội đồng" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "action", title: "Hành động" },
  ];

  const [councils, setCouncils] = useState<Council[]>([]);
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

  const fetchCouncils = useCallback(async (params?: SearchCouncilDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchCouncilDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getCouncils(searchParams);
      
      // API now always returns paginated response
      setCouncils(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách hội đồng"));
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
      fetchCouncils({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all councils
      fetchCouncils({}, true);
    }
  }, [fetchCouncils, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
    if (searchTerm.trim()) {
      fetchCouncils({ name: searchTerm.trim() }, true);
    } else {
      fetchCouncils({}, true);
    }
  }, [searchTerm, fetchCouncils]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchCouncils({});
  }, [fetchCouncils]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý hội đồng" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <CouncilDataTable 
              headers={headers} 
              items={councils} 
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

"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TermDataTable from "@/components/term/TermDataTable";
import { getTerms, SearchTermDto } from "@/services/termService";
import { Term } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function TermPage() {
  const headers = [
    { key: "name", title: "Tên sự kiện" },
    { key: "code", title: "Mã sự kiện" },
    { key: "description", title: "Mô tả" },
    { key: "dateRange", title: "Thời gian" },
    { key: "status", title: "Trạng thái" },
    { key: "milestones", title: "Cột mốc" },
    { key: "action", title: "Hành động" },
  ];

  const [terms, setTerms] = useState<Term[]>([]);
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

  const fetchTerms = useCallback(async (params?: SearchTermDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      // Always include pagination parameters
      const searchParams: SearchTermDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getTerms(searchParams);
      
      // API now always returns paginated response
      setTerms(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách sự kiện"));
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
      fetchTerms({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all terms
      fetchTerms({}, true);
    }
  }, [fetchTerms, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term and pagination
    if (searchTerm.trim()) {
      fetchTerms({ name: searchTerm.trim() }, true);
    } else {
      fetchTerms({}, true);
    }
  }, [searchTerm, fetchTerms]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchTerms({});
  }, [fetchTerms]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý sự kiện" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              </div>
            </div>
          ) : (
            <TermDataTable 
              headers={headers} 
              items={terms} 
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
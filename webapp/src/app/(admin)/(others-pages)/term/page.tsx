"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TermDataTable from "@/components/term/TermDataTable";
import { getTerms, SearchTermDto } from "@/services/termService";
import { getAcademicYears } from "@/services/academicYearService";
import { Term, AcademicYear } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";

export default function TermPage() {
  const headers = [
    { key: "name", title: "Tên kế hoạch NCKH" },
    { key: "code", title: "Mã kế hoạch NCKH" },
    { key: "description", title: "Mô tả" },
    { key: "academicYear", title: "Năm học" },
    { key: "dateRange", title: "Thời gian" },
    { key: "status", title: "Trạng thái" },
    { key: "milestones", title: "Cột mốc" },
    { key: "action", title: "Hành động" },
  ];

  const [terms, setTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(undefined);
  
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
      toast.error(getErrorMessage(e, "Không thể tải danh sách kế hoạch NCKH"));
    } finally {
      if (isSearch) {
        setIsSearching(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [currentPage, itemsPerPage, setTotalItems, setTotalPages]);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const data = await getAcademicYears({ limit: 100 }); // Get all academic years
      setAcademicYears(data.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách năm học"));
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setSearchTerm(trimmedQuery);
    resetToFirstPage(); // Reset to first page when searching
    
    const searchParams: SearchTermDto = {};
    if (trimmedQuery) {
      searchParams.name = trimmedQuery;
    }
    if (academicYearId) {
      searchParams.academicYearId = academicYearId;
    }
    
    fetchTerms(searchParams, true);
  }, [fetchTerms, resetToFirstPage, academicYearId]);

  const handleFilterChange = useCallback((filters: { academicYearId?: number }) => {
    setAcademicYearId(filters.academicYearId);
    resetToFirstPage(); // Reset to first page when filtering
    
    const searchParams: SearchTermDto = {};
    if (searchTerm.trim()) {
      searchParams.name = searchTerm.trim();
    }
    if (filters.academicYearId) {
      searchParams.academicYearId = filters.academicYearId;
    }
    
    fetchTerms(searchParams, true);
  }, [searchTerm, fetchTerms, resetToFirstPage]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term, filter and pagination
    const searchParams: SearchTermDto = {};
    if (searchTerm.trim()) {
      searchParams.name = searchTerm.trim();
    }
    if (academicYearId) {
      searchParams.academicYearId = academicYearId;
    }
    
    fetchTerms(searchParams, true);
  }, [searchTerm, academicYearId, fetchTerms]);

  // Initial load and fetch data when pagination changes
  useEffect(() => {
    fetchTerms({});
    fetchAcademicYears();
  }, [fetchTerms, fetchAcademicYears]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý kế hoạch NCKH" />
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
              academicYears={academicYears}
              onRefresh={handleRefresh}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              isSearching={isSearching}
              pagination={paginationInfo}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onFilterChange={handleFilterChange}
              academicYearId={academicYearId}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
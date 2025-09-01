"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TermDataTable from "@/components/term/TermDataTable";
import { getTerms, SearchTermDto, PaginatedTermResponse } from "@/services/termService";
import { Term } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

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

  const fetchTerms = useCallback(async (params?: SearchTermDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getTerms(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setTerms(data);
      } else {
        const paginatedData = data as PaginatedTermResponse;
        setTerms(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách sự kiện"));
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
      fetchTerms({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all terms
      fetchTerms({}, true);
    }
  }, [fetchTerms]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      fetchTerms({ name: searchTerm.trim() }, true);
    } else {
      fetchTerms({}, true);
    }
  }, [searchTerm, fetchTerms]);

  // Initial load
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
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
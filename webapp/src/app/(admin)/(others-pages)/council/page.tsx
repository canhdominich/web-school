"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CouncilDataTable from "@/components/council/CouncilDataTable";
import { getCouncils, SearchCouncilDto, PaginatedCouncilResponse } from "@/services/councilService";
import { Council } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

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

  const fetchCouncils = useCallback(async (params?: SearchCouncilDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getCouncils(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setCouncils(data);
      } else {
        const paginatedData = data as PaginatedCouncilResponse;
        setCouncils(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách hội đồng"));
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
      fetchCouncils({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all councils
      fetchCouncils({}, true);
    }
  }, [fetchCouncils]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      fetchCouncils({ name: searchTerm.trim() }, true);
    } else {
      fetchCouncils({}, true);
    }
  }, [searchTerm, fetchCouncils]);

  // Initial load
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
                <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách hội đồng...</p>
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
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}

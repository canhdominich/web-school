"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MajorDataTable from "@/components/major/MajorDataTable";
import { getMajors, SearchMajorDto, PaginatedMajorResponse } from "@/services/majorService";
import { Major } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

export default function MajorPage() {
  const headers = [
    { key: "name", title: "Tên ngành học" },
    { key: "code", title: "Mã ngành học" },
    { key: "description", title: "Mô tả" },
    { key: "department", title: "Bộ môn" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMajors = useCallback(async (params?: SearchMajorDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getMajors(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setMajors(data);
      } else {
        const paginatedData = data as PaginatedMajorResponse;
        setMajors(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách ngành học"));
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
      fetchMajors({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all majors
      fetchMajors({}, true);
    }
  }, [fetchMajors]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      fetchMajors({ name: searchTerm.trim() }, true);
    } else {
      fetchMajors({}, true);
    }
  }, [searchTerm, fetchMajors]);

  // Initial load
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
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
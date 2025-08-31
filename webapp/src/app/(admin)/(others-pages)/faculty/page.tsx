"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FacultyDataTable from "@/components/faculty/FacultyDataTable";
import { getFaculties, SearchFacultyDto, PaginatedFacultyResponse } from "@/services/facultyService";
import { Faculty } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

export default function FacultyPage() {
  const headers = [
    { key: "name", title: "Tên khoa" },
    { key: "code", title: "Mã khoa" },
    { key: "description", title: "Mô tả" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFaculties = useCallback(async (params?: SearchFacultyDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getFaculties(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setFaculties(data);
      } else {
        const paginatedData = data as PaginatedFacultyResponse;
        setFaculties(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách khoa"));
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
      fetchFaculties({ name: trimmedQuery }, true);
    } else {
      // If no search term, fetch all faculties
      fetchFaculties({}, true);
    }
  }, [fetchFaculties]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      fetchFaculties({ name: searchTerm.trim() }, true);
    } else {
      fetchFaculties({}, true);
    }
  }, [searchTerm, fetchFaculties]);

  // Initial load
  useEffect(() => {
    fetchFaculties({});
  }, [fetchFaculties]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý khoa" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách khoa...</p>
              </div>
            </div>
          ) : (
            <FacultyDataTable 
              headers={headers} 
              items={faculties} 
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
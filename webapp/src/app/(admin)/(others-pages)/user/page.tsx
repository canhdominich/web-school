"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserDataTable from "@/components/user/UserDataTable";
import { getUsers, SearchUserDto, PaginatedUserResponse } from "@/services/userService";
import { User } from "@/types/common";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

export default function UserPage() {
  const headers = [
    { key: "name", title: "Tên người dùng" },
    { key: "code", title: "Mã tài khoản" },
    { key: "phone", title: "Số điện thoại" },
    { key: "email", title: "Email" },
    { key: "role", title: "Vai trò" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async (params?: SearchUserDto, isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const data = await getUsers(params);
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        const paginatedData = data as PaginatedUserResponse;
        setUsers(paginatedData.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách tài khoản"));
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
      // Search by multiple fields
      fetchUsers({ 
        name: trimmedQuery,
      }, true);
    } else {
      // If no search term, fetch all users
      fetchUsers({}, true);
    }
  }, [fetchUsers]);

  const handleRefresh = useCallback(() => {
    // Refresh with current search term
    if (searchTerm.trim()) {
      // Search by multiple fields
      fetchUsers({ 
        name: searchTerm.trim(),
      }, true);
    } else {
      fetchUsers({}, true);
    }
  }, [searchTerm, fetchUsers]);

  // Initial load
  useEffect(() => {
    fetchUsers({});
  }, [fetchUsers]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý tài khoản" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách tài khoản...</p>
              </div>
            </div>
          ) : (
            <UserDataTable 
              headers={headers} 
              items={users} 
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

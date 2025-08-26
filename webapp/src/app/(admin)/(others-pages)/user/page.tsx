"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserDataTable from "@/components/user/UserDataTable";
import { getUsers } from "@/services/userService";
import { User } from "@/types/common";
import React, { useEffect, useState } from "react";
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

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data as User[]);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách tài khoản"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý tài khoản" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <UserDataTable 
              headers={headers} 
              items={users} 
              onRefresh={fetchUsers}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}

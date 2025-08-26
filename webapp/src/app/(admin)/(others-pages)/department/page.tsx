"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DepartmentDataTable from "@/components/department/DepartmentDataTable";
import { getDepartments } from "@/services/departmentService";
import { Department } from "@/types/common";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";

export default function DepartmentPage() {
  const headers = [
    { key: "name", title: "Tên bộ môn" },
    { key: "code", title: "Mã bộ môn" },
    { key: "description", title: "Mô tả" },
    { key: "faculty", title: "Khoa" },
    { key: "createdAt", title: "Ngày tạo" },
    { key: "updatedAt", title: "Ngày cập nhật" },
    { key: "action", title: "Hành động" },
  ];

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách bộ môn"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý bộ môn" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DepartmentDataTable 
              headers={headers} 
              items={departments} 
              onRefresh={fetchDepartments}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
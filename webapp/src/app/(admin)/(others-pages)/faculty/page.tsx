"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FacultyDataTable from "@/components/faculty/FacultyDataTable";
import { getFaculties } from "@/services/facultyService";
import { Faculty } from "@/types/common";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

  const fetchFaculties = async () => {
    try {
      setIsLoading(true);
      const data = await getFaculties();
      setFaculties(data);
    } catch {
      toast.error("Không thể tải danh sách khoa");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý khoa" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <FacultyDataTable 
              headers={headers} 
              items={faculties} 
              onRefresh={fetchFaculties}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MajorDataTable from "@/components/major/MajorDataTable";
import { getMajors } from "@/services/majorService";
import { Major } from "@/types/common";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

  const fetchMajors = async () => {
    try {
      setIsLoading(true);
      const data = await getMajors();
      setMajors(data);
    } catch {
      toast.error("Không thể tải danh sách ngành học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý ngành học" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <MajorDataTable 
              headers={headers} 
              items={majors} 
              onRefresh={fetchMajors}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
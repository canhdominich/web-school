"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CouncilDataTable from "@/components/council/CouncilDataTable";
import { getCouncils } from "@/services/councilService";
import { Council } from "@/types/common";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

  const fetchCouncils = async () => {
    try {
      setIsLoading(true);
      const data = await getCouncils();
      setCouncils(data);
    } catch {
      toast.error("Không thể tải danh sách hội đồng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCouncils();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý hội đồng" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <CouncilDataTable 
              headers={headers} 
              items={councils} 
              onRefresh={fetchCouncils}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
}

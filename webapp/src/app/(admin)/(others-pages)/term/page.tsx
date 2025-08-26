"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TermDataTable from "@/components/term/TermDataTable";
import { getTerms } from "@/services/termService";
import { Term } from "@/types/common";
import React, { useEffect, useState } from "react";
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

  const fetchTerms = async () => {
    try {
      setIsLoading(true);
      const data = await getTerms();
      setTerms(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải danh sách sự kiện"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý sự kiện" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <TermDataTable 
              headers={headers} 
              items={terms} 
              onRefresh={fetchTerms}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
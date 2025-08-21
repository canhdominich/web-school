"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProjectDataTable from "@/components/project/ProjectDataTable";
import { getProjects } from "@/services/projectService";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ProjectPage() {
  const headers = [
    { key: "code", title: "Mã dự án" },
    { key: "term", title: "Sự kiện" },
    { key: "major", title: "Ngành" },
    { key: "title", title: "Tên dự án" },
    { key: "lecturer", title: "Giảng viên hướng dẫn" },
    { key: "level", title: "Cấp độ" },
    { key: "status", title: "Trạng thái" },
    { key: "members", title: "Thành viên" },
    { key: "action", title: "Hành động" },
  ];

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch {
      toast.error("Không thể tải danh sách dự án");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý dự án" />
      <div className="space-y-6">
        <ComponentCard title="">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <ProjectDataTable
              headers={headers}
              items={projects as any}
              onRefresh={fetchProjects}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 
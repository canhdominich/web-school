import type { Metadata } from "next";
import React from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";

export const metadata: Metadata = {
  title:
    "EduResearch Hub",
  description: "Nền tảng quản lý đề tài & hợp tác nghiên cứu trong trường đại học",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>

      <div className="col-span-12">
        <MonthlySalesChart />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>
    </div>
  );
}

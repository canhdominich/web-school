import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { BasicTableProps } from "@/types/common";

interface CommonDataTableProps extends BasicTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderRow: (item: any) => React.ReactNode;
}

export default function DataTable({
    headers,
    items,
    renderRow,
}: CommonDataTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1102px]">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                {headers.map((header) => (
                                    <TableCell
                                        key={header.key}
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        {header.title}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    {renderRow(item)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

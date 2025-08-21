"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BasicTableProps, Header, Term, TermMilestone, TermStatus, TermMilestoneStatus } from "@/types/common";
import { Modal } from "../ui/modal";
import { useModal } from "@/hooks/useModal";
import { CreateTermDto, createTerm, deleteTerm, updateTerm, UpdateTermDto } from "@/services/termService";
import { createTermMilestone, updateTermMilestone, deleteTermMilestone, CreateTermMilestoneDto, UpdateTermMilestoneDto } from "@/services/termMilestoneService";
import { toast } from "react-hot-toast";
import Badge from "../ui/badge/Badge";
import { PlusIcon } from "@/icons";

interface TermDataTableProps extends BasicTableProps {
  onRefresh: () => void;
  items: Term[];
  headers: Header[];
}

export default function TermDataTable({ headers, items, onRefresh }: TermDataTableProps) {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<TermMilestone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [formData, setFormData] = useState<CreateTermDto | UpdateTermDto>({
    name: "",
    code: "",
    description: "",
    startDate: "",
    endDate: "",
    status: 'open',
  });
  const [milestoneFormData, setMilestoneFormData] = useState<CreateTermMilestoneDto | UpdateTermMilestoneDto>({
    title: "",
    description: "",
    dueDate: "",
    termId: "",
    orderIndex: 0,
    isRequired: false,
    status: 'active',
  });
  const { isOpen, openModal, closeModal } = useModal();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTerm(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        startDate: "",
        endDate: "",
        status: 'open',
      });
    }
  }, [isOpen]);

  // Update form data when selected Term changes
  useEffect(() => {
    if (selectedTerm) {
      setFormData({
        name: selectedTerm.name,
        code: selectedTerm.code,
        description: selectedTerm.description || "",
        startDate: selectedTerm.startDate,
        endDate: selectedTerm.endDate,
        status: selectedTerm.status as TermStatus,
      });
    }
  }, [selectedTerm]);

  const handleEdit = (term: Term) => {
    setSelectedTerm(term);
    openModal();
  };

  const handleAddMilestone = (term: Term) => {
    setSelectedTerm(term);
    setSelectedMilestone(null);
    setMilestoneFormData({
      title: "",
      description: "",
      dueDate: "",
      termId: term.id.toString(),
      orderIndex: (term.termMilestones?.length || 0) + 1,
      isRequired: false,
      status: 'active',
    });
    setShowMilestoneModal(true);
  };

  const handleEditMilestone = (term: Term, milestone: TermMilestone) => {
    setSelectedTerm(term);
    setSelectedMilestone(milestone);
    setMilestoneFormData({
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      termId: milestone.termId,
      orderIndex: milestone.orderIndex,
      isRequired: milestone.isRequired,
      status: milestone.status as TermMilestoneStatus,
    });
    setShowMilestoneModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedTerm?.id) {
        await updateTerm(selectedTerm.id.toString(), formData as UpdateTermDto);
        toast.success("Cập nhật sự kiện thành công");
      } else {
        await createTerm(formData as CreateTermDto);
        toast.success("Thêm sự kiện thành công");
      }
      closeModal();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = selectedTerm?.id ? "Không thể cập nhật sự kiện" : "Không thể thêm sự kiện";
      
      if (error instanceof Error && error.message) {
        toast.error(`${errorMessage}: ${error.message}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedTerm) return;

    try {
      setIsSubmitting(true);
      if (selectedMilestone?.id) {
        await updateTermMilestone(selectedMilestone.id, milestoneFormData as UpdateTermMilestoneDto);
        toast.success("Cập nhật cột mốc thành công");
      } else {
        await createTermMilestone(milestoneFormData as CreateTermMilestoneDto);
        toast.success("Thêm cột mốc thành công");
      }
      setShowMilestoneModal(false);
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleMilestoneSubmit:', error);
      const errorMessage = selectedMilestone?.id ? "Không thể cập nhật cột mốc" : "Không thể thêm cột mốc";
      
      if (error instanceof Error && error.message) {
        toast.error(`${errorMessage}: ${error.message}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteTerm(id.toString());
      toast.success("Xóa sự kiện thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = "Không thể xóa sự kiện";
      
      if (error instanceof Error && error.message) {
        if (error.message.includes("Không thể xóa sự kiện này vì đang được sử dụng trong:")) {
          errorMessage = error.message;
          toast.error(errorMessage, { duration: 6000 });
        } else {
          toast.error(`${errorMessage}: ${error.message}`);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (isSubmitting) return;

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa cột mốc này?");
    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      await deleteTermMilestone(milestoneId);
      toast.success("Xóa cột mốc thành công");
      onRefresh();
    } catch (error: unknown) {
      console.error('Error in handleDeleteMilestone:', error);
      toast.error("Không thể xóa cột mốc");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-6 px-5 flex items-center gap-3 modal-footer sm:justify-start">
        <button
          onClick={openModal}
          type="button"
          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
        >
          Thêm sự kiện
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {headers.map((header) => (
                  <TableCell
                    key={header.key}
                    isHeader
                    className="px-5 py-3 font-medium text-start text-theme-sm dark:text-gray-400"
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.map((item: Term) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {item.code}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.description || "Không có mô tả"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="text-sm">
                      <div>Từ: {formatDate(item.startDate)}</div>
                      <div>Đến: {formatDate(item.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={item.status === 'open' ? "success" : item.status === 'closed' ? "warning" : "light"}
                    >
                      {item.status === 'open' ? "Đang mở" : item.status === 'closed' ? "Đã đóng" : "Đã lưu trữ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Milestones ({item.termMilestones?.length || 0})</div>
                      {item.termMilestones && item.termMilestones.length > 0 && (
                        <div className="space-y-1">
                          {item.termMilestones
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((milestone) => (
                              <div key={milestone.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span>{milestone.title}</span>
                                  {milestone.isRequired && (
                                    <Badge size="sm" color="error">Bắt buộc</Badge>
                                  )}
                                  <Badge
                                    size="sm"
                                    color={milestone.status === 'active' ? "success" : "light"}
                                  >
                                    {milestone.status === 'active' ? "Đang áp dụng" : "Chưa áp dụng"}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditMilestone(item, milestone)}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMilestone(milestone.id)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        title="Thêm cột mốc"
                        onClick={() => handleAddMilestone(item)}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-warning-500 px-6 py-1.5 text-sm font-medium text-white hover:bg-warning-600 sm:w-auto"
                      >
                        <span className="text-xl">+</span>
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-error btn-delete-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                      >
                        Xóa
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Term Modal */}
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedTerm ? "Chỉnh sửa sự kiện" : "Thêm sự kiện"}
                </h5>
              </div>
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Tên sự kiện
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="Nhập tên sự kiện"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Mã sự kiện
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="Nhập mã sự kiện"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Ngày bắt đầu
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Ngày kết thúc
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập mô tả sự kiện (không bắt buộc)"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    value={(formData as any).status as TermStatus}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TermStatus })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  >
                    <option value="open">Mở</option>
                    <option value="closed">Đóng</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmit}
                  type="button"
                  disabled={isSubmitting}
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {isSubmitting ? "Đang xử lý..." : selectedTerm ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </Modal>

          {/* Milestone Modal */}
          <Modal
            isOpen={showMilestoneModal}
            onClose={() => setShowMilestoneModal(false)}
            className="max-w-[600px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedMilestone ? "Chỉnh sửa cột mốc" : "Thêm cột mốc"}
                </h5>
                {selectedTerm && (
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Sự kiện: {selectedTerm.name}
                  </p>
                )}
              </div>
              <div className="mt-8">
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Tiêu đề cột mốc
                  </label>
                  <input
                    id="milestoneTitle"
                    type="text"
                    value={milestoneFormData.title}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập tiêu đề cột mốc"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Hạn chót
                  </label>
                  <input
                    id="milestoneDueDate"
                    type="date"
                    value={milestoneFormData.dueDate}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Thứ tự
                  </label>
                  <input
                    id="milestoneOrder"
                    type="number"
                    min="1"
                    value={milestoneFormData.orderIndex}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, orderIndex: Number(e.target.value) })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập thứ tự"
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Mô tả
                  </label>
                  <textarea
                    id="milestoneDescription"
                    rows={3}
                    value={milestoneFormData.description}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                    className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    placeholder="Nhập mô tả cột mốc"
                  />
                </div>
                <div className="mb-3">
                  <label className="flex items-center">
                    <input
                      id="milestoneIsRequired"
                      type="checkbox"
                      checked={milestoneFormData.isRequired}
                      onChange={(e) => setMilestoneFormData({ ...milestoneFormData, isRequired: e.target.checked })}
                      className="mr-2 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400 pt-1">
                      Bắt buộc
                    </span>
                  </label>
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    value={(milestoneFormData as any).status as TermMilestoneStatus}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, status: e.target.value as TermMilestoneStatus })}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  >
                    <option value="active">Đang áp dụng</option>
                    <option value="inactive">Chưa áp dụng</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                <button
                  onClick={() => setShowMilestoneModal(false)}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Đóng
                </button>
                <button
                  onClick={handleMilestoneSubmit}
                  type="button"
                  disabled={isSubmitting}
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {isSubmitting ? "Đang xử lý..." : selectedMilestone ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
} 
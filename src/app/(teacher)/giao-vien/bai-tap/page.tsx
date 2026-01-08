'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Users,
  CheckCircle,
  FileCheck,
  BookOpen,
  Trash2,
  Edit,
  Copy,
  Eye,
  Loader2,
  AlertCircle,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/header';
import { ProgressRing } from '@/components/ui/progress';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import {
  fetchAssignments,
  deleteAssignment,
  duplicateAssignment,
} from '@/lib/apiClient';
import { AssignmentWithStats, AssignmentStatus } from '@/types/domain';
import { useToast } from '@/components/ui/toast';

// Filter types
type AssignmentType = 'homework' | 'quiz' | 'test';
type DeadlineFilter = 'all' | 'upcoming' | 'overdue' | 'no-deadline';

interface Filters {
  types: AssignmentType[];
  classes: string[];
  deadline: DeadlineFilter;
}

const typeLabels = {
  homework: 'Bài tập',
  quiz: 'Kiểm tra',
  test: 'Thi',
};

const typeColors = {
  homework: 'default' as const,
  quiz: 'primary' as const,
  test: 'warning' as const,
};

const defaultFilters: Filters = {
  types: [],
  classes: [],
  deadline: 'all',
};

export default function AssignmentsPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);

  // API state
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Get unique class names from assignments
  const availableClasses = useMemo(() => {
    const classes = new Set(assignments.map((a) => a.className));
    return Array.from(classes).sort();
  }, [assignments]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.classes.length > 0) count += filters.classes.length;
    if (filters.deadline !== 'all') count += 1;
    return count;
  }, [filters]);

  // Fetch assignments from API
  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build filter based on active tab
      const statusFilter: AssignmentStatus | undefined =
        activeTab === 'published'
          ? 'published'
          : activeTab === 'draft'
          ? 'draft'
          : undefined;

      const response = await fetchAssignments({
        status: statusFilter,
        search: searchQuery || undefined,
      });

      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        setError(response.error || 'Không thể tải danh sách bài tập');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      console.error('Error loading assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  // Load assignments on mount and when filters change
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Filter assignments (client-side)
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!assignment.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(assignment.type)) {
        return false;
      }

      // Class filter
      if (filters.classes.length > 0 && !filters.classes.includes(assignment.className)) {
        return false;
      }

      // Deadline filter
      if (filters.deadline !== 'all') {
        const now = new Date();
        const dueDate = assignment.dueAt ? new Date(assignment.dueAt) : null;

        switch (filters.deadline) {
          case 'upcoming':
            if (!dueDate || dueDate <= now) return false;
            break;
          case 'overdue':
            if (!dueDate || dueDate > now) return false;
            break;
          case 'no-deadline':
            if (dueDate) return false;
            break;
        }
      }

      return true;
    });
  }, [assignments, searchQuery, filters]);

  // Calculate counts for tabs
  const allCount = assignments.length;
  const publishedCount = assignments.filter((a) => a.status === 'published').length;
  const draftCount = assignments.filter((a) => a.status === 'draft').length;

  // Filter handlers
  const openFilterModal = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
  };

  const removeFilter = (type: 'type' | 'class' | 'deadline', value?: string) => {
    if (type === 'type' && value) {
      setFilters((prev) => ({
        ...prev,
        types: prev.types.filter((t) => t !== value),
      }));
    } else if (type === 'class' && value) {
      setFilters((prev) => ({
        ...prev,
        classes: prev.classes.filter((c) => c !== value),
      }));
    } else if (type === 'deadline') {
      setFilters((prev) => ({ ...prev, deadline: 'all' }));
    }
  };

  const toggleTempType = (type: AssignmentType) => {
    setTempFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleTempClass = (className: string) => {
    setTempFilters((prev) => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter((c) => c !== className)
        : [...prev.classes, className],
    }));
  };

  const handleDelete = (id: string) => {
    setSelectedAssignment(id);
    setShowDeleteModal(true);
    setShowMenu(null);
  };

  const confirmDelete = async () => {
    if (!selectedAssignment) return;

    setIsDeleting(true);
    try {
      const response = await deleteAssignment(selectedAssignment);
      if (response.success) {
        // Remove from local state
        setAssignments((prev) => prev.filter((a) => a.id !== selectedAssignment));
        setShowDeleteModal(false);
        setSelectedAssignment(null);
        showToast('success', 'Đã xóa bài tập');
      } else {
        showToast('error', 'Lỗi', response.error || 'Không thể xóa bài tập');
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Đã xảy ra lỗi khi xóa bài tập');
      console.error('Error deleting assignment:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    setShowMenu(null);

    try {
      const response = await duplicateAssignment(id);
      if (response.success && response.data) {
        // Reload assignments to get updated list with proper stats
        loadAssignments();
        showToast('success', 'Đã nhân bản bài tập', 'Bản sao đã được tạo dưới dạng nháp');
      } else {
        showToast('error', 'Lỗi', response.error || 'Không thể nhân bản bài tập');
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Đã xảy ra lỗi khi nhân bản bài tập');
      console.error('Error duplicating assignment:', err);
    } finally {
      setIsDuplicating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Bài tập & Kiểm tra"
        subtitle="Quản lý tất cả bài tập và bài kiểm tra"
        action={
          <Link href="/giao-vien/bai-tap/tao-moi">
            <Button leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}>
              Tạo bài tập
            </Button>
          </Link>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm text-error flex-1">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            Đóng
          </Button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" strokeWidth={1.75} />}
          />
        </div>
        <Button
          variant="secondary"
          onClick={openFilterModal}
          leftIcon={<SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} />}
          className="relative"
        >
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-tertiary)]">Đang lọc:</span>
          {filters.types.map((type) => (
            <Badge
              key={type}
              variant="default"
              className="flex items-center gap-1 pr-1"
            >
              {typeLabels[type]}
              <button
                onClick={() => removeFilter('type', type)}
                className="ml-1 p-0.5 rounded hover:bg-mono-200 dark:hover:bg-mono-600"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </Badge>
          ))}
          {filters.classes.map((cls) => (
            <Badge
              key={cls}
              variant="primary"
              className="flex items-center gap-1 pr-1"
            >
              {cls}
              <button
                onClick={() => removeFilter('class', cls)}
                className="ml-1 p-0.5 rounded hover:bg-mono-600/30"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </Badge>
          ))}
          {filters.deadline !== 'all' && (
            <Badge
              variant="warning"
              className="flex items-center gap-1 pr-1"
            >
              {filters.deadline === 'upcoming'
                ? 'Sắp đến hạn'
                : filters.deadline === 'overdue'
                ? 'Quá hạn'
                : 'Không có hạn'}
              <button
                onClick={() => removeFilter('deadline')}
                className="ml-1 p-0.5 rounded hover:bg-warning/30"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả ({allCount})</TabsTrigger>
          <TabsTrigger value="published">Đã phát ({publishedCount})</TabsTrigger>
          <TabsTrigger value="draft">Bản nháp ({draftCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-mono-600 dark:text-mono-400 animate-spin mb-4" strokeWidth={1.75} />
              <p className="text-[var(--text-tertiary)]">Đang tải danh sách bài tập...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <EmptyState
              icon={<FileCheck className="h-8 w-8" strokeWidth={1.75} />}
              title="Chưa có bài tập nào"
              description="Bắt đầu tạo bài tập đầu tiên cho học sinh của bạn"
              action={{
                label: 'Tạo bài tập',
                onClick: () => (window.location.href = '/giao-vien/bai-tap/tao-moi'),
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const progress =
                  assignment.totalStudents > 0
                    ? (assignment.submittedCount / assignment.totalStudents) * 100
                    : 0;
                const isOverdue =
                  assignment.dueAt && new Date(assignment.dueAt) < new Date();

                return (
                  <Card key={assignment.id} className="relative">
                    <div className="flex items-start gap-4">
                      {/* Progress Ring */}
                      <div className="hidden sm:block">
                        <ProgressRing value={progress} size={56} strokeWidth={5}>
                          <span className="text-xs font-medium">
                            {Math.round(progress)}%
                          </span>
                        </ProgressRing>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/giao-vien/bai-tap/${assignment.id}/preview`}
                              className="font-semibold text-[var(--text-primary)] hover:text-mono-600 dark:text-mono-400 transition-colors"
                            >
                              {assignment.title}
                            </Link>
                            {assignment.description && (
                              <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">
                                {assignment.description}
                              </p>
                            )}
                          </div>

                          {/* Menu */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setShowMenu(showMenu === assignment.id ? null : assignment.id)
                              }
                            >
                              <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
                            </Button>

                            {showMenu === assignment.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setShowMenu(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl bg-white dark:bg-mono-800 shadow-apple-lg overflow-hidden">
                                  <Link
                                    href={`/giao-vien/bai-tap/${assignment.id}/preview`}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700"
                                  >
                                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                                    Xem chi tiết
                                  </Link>
                                  <Link
                                    href={`/giao-vien/bai-tap/tao-moi?edit=${assignment.id}`}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700"
                                  >
                                    <Edit className="h-4 w-4" strokeWidth={1.75} />
                                    Chỉnh sửa
                                  </Link>
                                  <button
                                    onClick={() => handleDuplicate(assignment.id)}
                                    disabled={isDuplicating === assignment.id}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700 disabled:opacity-50"
                                  >
                                    {isDuplicating === assignment.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                                    ) : (
                                      <Copy className="h-4 w-4" strokeWidth={1.75} />
                                    )}
                                    Nhân bản
                                  </button>
                                  <div className="h-px bg-mono-200 dark:bg-mono-600 mx-2" />
                                  <button
                                    onClick={() => handleDelete(assignment.id)}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10"
                                  >
                                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                                    Xóa
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant={typeColors[assignment.type]}>
                            {typeLabels[assignment.type]}
                          </Badge>
                          <Badge variant="default">{assignment.className}</Badge>
                          {assignment.status === 'draft' && (
                            <Badge variant="warning">Bản nháp</Badge>
                          )}
                          {isOverdue && assignment.status === 'published' && (
                            <Badge variant="error">Quá hạn</Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                            {assignment.questionCount} câu
                          </span>
                          {assignment.durationMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" strokeWidth={1.75} />
                              {assignment.durationMinutes} phút
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" strokeWidth={1.75} />
                            {assignment.submittedCount}/{assignment.totalStudents} đã nộp
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" strokeWidth={1.75} />
                            {assignment.gradedCount} đã chấm
                          </span>
                        </div>

                        {/* Deadline */}
                        {assignment.dueAt && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-2">
                            Hạn nộp: {formatDate(assignment.dueAt)}{' '}
                            <span className="text-[var(--text-tertiary)]">
                              ({formatRelativeTime(assignment.dueAt)})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Bộ lọc bài tập"
      >
        <div className="py-4 space-y-6">
          {/* Filter by Type */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Loại bài tập
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['homework', 'quiz', 'test'] as AssignmentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTempType(type)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2',
                    tempFilters.types.includes(type)
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30'
                  )}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by Class */}
          {availableClasses.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
                Lớp học
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => toggleTempClass(cls)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2',
                      tempFilters.classes.includes(cls)
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30'
                    )}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter by Deadline */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Thời hạn
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'upcoming', label: 'Sắp đến hạn' },
                { value: 'overdue', label: 'Quá hạn' },
                { value: 'no-deadline', label: 'Không có hạn' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setTempFilters((prev) => ({
                      ...prev,
                      deadline: option.value as DeadlineFilter,
                    }))
                  }
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2',
                    tempFilters.deadline === option.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setTempFilters(defaultFilters)}
          >
            Đặt lại
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Hủy
          </Button>
          <Button onClick={applyFilters}>
            Áp dụng
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
      >
        <div className="py-4">
          <p className="text-[var(--text-secondary)]">
            Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={confirmDelete} isLoading={isDeleting}>
            Xóa
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/header';
import { cn, formatRelativeTime } from '@/lib/utils';
import { fetchSubmissions } from '@/lib/apiClient';
import { SubmissionListItem, SubmissionStatus } from '@/types/domain';

const typeLabels = {
  homework: 'Bài tập',
  quiz: 'Kiểm tra',
  test: 'Thi',
};

// Filter types
type AssignmentType = 'homework' | 'quiz' | 'test';

interface Filters {
  types: AssignmentType[];
  classes: string[];
  hasEssay: boolean | null;
}

const defaultFilters: Filters = {
  types: [],
  classes: [],
  hasEssay: null,
};

export default function GradingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'submitted' | 'graded'>('submitted');

  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);

  // API state
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions from API
  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSubmissions({
        status: activeTab as SubmissionStatus,
      });

      if (response.success && response.data) {
        setSubmissions(response.data);
      } else {
        setError(response.error || 'Không thể tải danh sách bài chấm');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      console.error('Error loading submissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // Load submissions on mount and when tab changes
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Get available classes from submissions
  const availableClasses = useMemo(() => {
    const classNames = submissions.map((s) => s.className);
    return Array.from(new Set(classNames)).sort();
  }, [submissions]);

  // Filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.classes.length > 0) count += filters.classes.length;
    if (filters.hasEssay !== null) count += 1;
    return count;
  }, [filters]);

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
    setShowFilterModal(false);
  };

  const removeFilter = (type: 'type' | 'class' | 'hasEssay', value?: string) => {
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
    } else if (type === 'hasEssay') {
      setFilters((prev) => ({ ...prev, hasEssay: null }));
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

  // Filter submissions by search and filters
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      // Search filter
      const matchesSearch =
        submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(submission.assignmentType as AssignmentType)) {
        return false;
      }

      // Class filter
      if (filters.classes.length > 0 && !filters.classes.includes(submission.className)) {
        return false;
      }

      // Has essay filter
      if (filters.hasEssay !== null && submission.hasEssay !== filters.hasEssay) {
        return false;
      }

      return true;
    });
  }, [submissions, searchQuery, filters]);

  // Stats
  const pendingCount = activeTab === 'submitted' ? submissions.length : 0;
  const gradedCount = activeTab === 'graded' ? submissions.length : 0;
  const pendingEssayCount = submissions
    .filter((s) => s.status === 'submitted')
    .reduce((sum, s) => sum + s.essayCount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Chấm bài"
        subtitle="Xem và chấm điểm bài làm của học sinh"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="h-5 w-5 text-warning" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{pendingCount}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Chờ chấm</p>
        </Card>

        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{pendingEssayCount}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Câu tự luận</p>
        </Card>

        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
            <span className="text-2xl font-bold text-[var(--text-primary)]">{gradedCount}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Đã chấm</p>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm theo tên học sinh hoặc bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" strokeWidth={1.75} />}
          />
        </div>
        <Button
          variant="secondary"
          onClick={openFilterModal}
          leftIcon={<Filter className="h-5 w-5" strokeWidth={1.75} />}
        >
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.types.map((type) => (
            <Badge
              key={type}
              variant="default"
              className="cursor-pointer"
              onClick={() => removeFilter('type', type)}
            >
              {typeLabels[type]}
              <X className="h-3 w-3 ml-1" strokeWidth={2} />
            </Badge>
          ))}
          {filters.classes.map((cls) => (
            <Badge
              key={cls}
              variant="default"
              className="cursor-pointer"
              onClick={() => removeFilter('class', cls)}
            >
              {cls}
              <X className="h-3 w-3 ml-1" strokeWidth={2} />
            </Badge>
          ))}
          {filters.hasEssay !== null && (
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => removeFilter('hasEssay')}
            >
              {filters.hasEssay ? 'Có tự luận' : 'Không có tự luận'}
              <X className="h-3 w-3 ml-1" strokeWidth={2} />
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        defaultValue="submitted"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'submitted' | 'graded')}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="submitted">Chờ chấm</TabsTrigger>
          <TabsTrigger value="graded">Đã chấm</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-mono-600 dark:text-mono-400 animate-spin mb-4" strokeWidth={1.75} />
              <p className="text-[var(--text-tertiary)]">Đang tải danh sách...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="h-8 w-8" strokeWidth={1.75} />}
              title={activeTab === 'submitted' ? 'Không có bài chờ chấm' : 'Chưa có bài đã chấm'}
              description={
                activeTab === 'submitted'
                  ? 'Tất cả bài làm đã được chấm điểm'
                  : 'Các bài làm đã chấm sẽ hiển thị ở đây'
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => (
                <Link key={submission.id} href={`/giao-vien/cham-bai/${submission.id}`}>
                  <Card hover className="group">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mono-200 dark:bg-mono-700 text-[var(--text-secondary)] font-semibold text-lg">
                        {submission.studentName.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">
                              {submission.studentName}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] truncate">
                              {submission.assignmentTitle}
                            </p>
                          </div>

                          {/* Score / Status */}
                          <div className="text-right ml-4">
                            {submission.status === 'graded' ? (
                              <div>
                                <p className="text-lg font-bold text-success">
                                  {submission.totalScore}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">
                                  /{submission.maxScore} điểm
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-warning">
                                <Clock className="h-4 w-4" strokeWidth={1.75} />
                                <span className="text-sm font-medium">Chờ chấm</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="default">{submission.className}</Badge>
                          <Badge
                            variant={
                              submission.assignmentType === 'test'
                                ? 'warning'
                                : submission.assignmentType === 'quiz'
                                ? 'primary'
                                : 'default'
                            }
                          >
                            {typeLabels[submission.assignmentType as keyof typeof typeLabels]}
                          </Badge>

                          {submission.hasEssay && (
                            <Badge
                              variant="primary"
                              icon={<Sparkles className="h-3 w-3" strokeWidth={1.75} />}
                            >
                              {submission.essayCount} tự luận
                            </Badge>
                          )}

                          {submission.mcqScore !== null && (
                            <span className="text-xs text-[var(--text-tertiary)]">
                              Trắc nghiệm: {submission.mcqScore}/{submission.mcqMaxScore}
                            </span>
                          )}

                          <span className="text-xs text-[var(--text-tertiary)]">•</span>

                          {submission.submittedAt && (
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {formatRelativeTime(submission.submittedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-mono-600 dark:text-mono-400 transition-colors"
                        strokeWidth={1.75}
                      />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Bộ lọc"
      >
        <div className="space-y-6 py-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Loại bài tập
            </label>
            <div className="flex flex-wrap gap-2">
              {(['homework', 'quiz', 'test'] as AssignmentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTempType(type)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    tempFilters.types.includes(type)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                  )}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Lớp học
            </label>
            <div className="flex flex-wrap gap-2">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => toggleTempClass(cls)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    tempFilters.classes.includes(cls)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                  )}
                >
                  {cls}
                </button>
              ))}
              {availableClasses.length === 0 && (
                <p className="text-sm text-[var(--text-tertiary)]">Chưa có lớp nào</p>
              )}
            </div>
          </div>

          {/* Has Essay Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Câu tự luận
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTempFilters((prev) => ({ ...prev, hasEssay: prev.hasEssay === true ? null : true }))}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  tempFilters.hasEssay === true
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                )}
              >
                Có tự luận
              </button>
              <button
                onClick={() => setTempFilters((prev) => ({ ...prev, hasEssay: prev.hasEssay === false ? null : false }))}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  tempFilters.hasEssay === false
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                )}
              >
                Không có tự luận
              </button>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={clearFilters}>
            Đặt lại
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
              Hủy
            </Button>
            <Button onClick={applyFilters}>Áp dụng</Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

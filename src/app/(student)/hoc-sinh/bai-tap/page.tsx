'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Filter,
  X,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/header';
import { cn } from '@/lib/utils';

// Types
type AssignmentType = 'homework' | 'quiz' | 'test';
type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  deadline: string;
  type: AssignmentType;
  status: AssignmentStatus;
  duration: number | null;
  questionCount: number;
  score?: number;
  maxScore?: number;
}

interface Filters {
  types: AssignmentType[];
  statuses: AssignmentStatus[];
  subjects: string[];
}

// Mock data
const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Bài kiểm tra Chương 3: Hàm số',
    subject: 'Toán học',
    className: 'Lớp 8A',
    deadline: '2024-12-20T23:59:00',
    type: 'test',
    status: 'pending',
    duration: 45,
    questionCount: 20,
  },
  {
    id: '2',
    title: 'Bài tập về nhà: Phương trình',
    subject: 'Toán học',
    className: 'Lớp 8A',
    deadline: '2024-12-18T23:59:00',
    type: 'homework',
    status: 'pending',
    duration: null,
    questionCount: 10,
  },
  {
    id: '3',
    title: 'Ôn tập từ vựng Unit 5',
    subject: 'Tiếng Anh',
    className: 'Lớp 8A',
    deadline: '2024-12-19T23:59:00',
    type: 'homework',
    status: 'in_progress',
    duration: null,
    questionCount: 15,
  },
  {
    id: '4',
    title: 'Quiz ngữ pháp Unit 4',
    subject: 'Tiếng Anh',
    className: 'Lớp 8A',
    deadline: '2024-12-15T23:59:00',
    type: 'quiz',
    status: 'completed',
    duration: 15,
    questionCount: 10,
    score: 9,
    maxScore: 10,
  },
  {
    id: '5',
    title: 'Bài tập Chương 2: Phương trình',
    subject: 'Toán học',
    className: 'Lớp 8A',
    deadline: '2024-12-10T23:59:00',
    type: 'homework',
    status: 'overdue',
    duration: null,
    questionCount: 8,
  },
  {
    id: '6',
    title: 'Kiểm tra giữa kỳ',
    subject: 'Vật lý',
    className: 'Lớp 8A',
    deadline: '2024-12-08T23:59:00',
    type: 'test',
    status: 'completed',
    duration: 60,
    questionCount: 30,
    score: 7.5,
    maxScore: 10,
  },
];

const typeLabels: Record<AssignmentType, string> = {
  homework: 'Bài tập',
  quiz: 'Quiz',
  test: 'Kiểm tra',
};

const statusLabels: Record<AssignmentStatus, string> = {
  pending: 'Chưa làm',
  in_progress: 'Đang làm',
  completed: 'Hoàn thành',
  overdue: 'Quá hạn',
};

const statusVariants: Record<AssignmentStatus, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'default',
  in_progress: 'warning',
  completed: 'success',
  overdue: 'error',
};

const defaultFilters: Filters = {
  types: [],
  statuses: [],
  subjects: [],
};

function getDeadlineText(deadline: string, status: AssignmentStatus) {
  if (status === 'completed') return 'Đã hoàn thành';
  if (status === 'overdue') return 'Đã quá hạn';

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return 'Đã quá hạn';
  if (diffHours < 24) return 'Hết hạn hôm nay';
  if (diffHours < 48) return 'Hết hạn ngày mai';

  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays < 7) return `Còn ${diffDays} ngày`;

  return deadlineDate.toLocaleDateString('vi-VN');
}

function getTypeIcon(type: AssignmentType) {
  switch (type) {
    case 'homework':
      return <FileText className="h-4 w-4" strokeWidth={1.75} />;
    case 'quiz':
      return <HelpCircle className="h-4 w-4" strokeWidth={1.75} />;
    case 'test':
      return <BookOpen className="h-4 w-4" strokeWidth={1.75} />;
  }
}

export default function StudentAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);

  // Available subjects for filter
  const availableSubjects = useMemo(() => {
    const subjects = mockAssignments.map((a) => a.subject);
    return Array.from(new Set(subjects)).sort();
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.statuses.length > 0) count += filters.statuses.length;
    if (filters.subjects.length > 0) count += filters.subjects.length;
    return count;
  }, [filters]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return mockAssignments.filter((assignment) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !assignment.title.toLowerCase().includes(query) &&
          !assignment.subject.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'pending') {
        if (assignment.status === 'completed') return false;
      } else if (activeTab === 'completed') {
        if (assignment.status !== 'completed') return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(assignment.type)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(assignment.status)) {
        return false;
      }

      // Subject filter
      if (filters.subjects.length > 0 && !filters.subjects.includes(assignment.subject)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, activeTab, filters]);

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

  const removeFilter = (type: 'types' | 'statuses' | 'subjects', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
  };

  const toggleTempType = (type: AssignmentType) => {
    setTempFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleTempStatus = (status: AssignmentStatus) => {
    setTempFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const toggleTempSubject = (subject: string) => {
    setTempFilters((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  // Stats
  const stats = useMemo(() => {
    const pending = mockAssignments.filter(
      (a) => a.status === 'pending' || a.status === 'in_progress'
    ).length;
    const completed = mockAssignments.filter((a) => a.status === 'completed').length;
    const overdue = mockAssignments.filter((a) => a.status === 'overdue').length;
    return { pending, completed, overdue, total: mockAssignments.length };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Bài tập"
        subtitle={`${stats.pending} bài cần làm • ${stats.completed} đã hoàn thành`}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={activeTab === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          Tất cả ({stats.total})
        </Button>
        <Button
          variant={activeTab === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('pending')}
        >
          Cần làm ({stats.pending + stats.overdue})
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('completed')}
        >
          Đã hoàn thành ({stats.completed})
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
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
          leftIcon={<Filter className="h-5 w-5" strokeWidth={1.75} />}
        >
          Lọc
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.types.map((type) => (
            <Badge
              key={type}
              variant="default"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter('types', type)}
            >
              {typeLabels[type]}
              <X className="h-3 w-3" strokeWidth={2} />
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge
              key={status}
              variant={statusVariants[status]}
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter('statuses', status)}
            >
              {statusLabels[status]}
              <X className="h-3 w-3" strokeWidth={2} />
            </Badge>
          ))}
          {filters.subjects.map((subject) => (
            <Badge
              key={subject}
              variant="default"
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => removeFilter('subjects', subject)}
            >
              {subject}
              <X className="h-3 w-3" strokeWidth={2} />
            </Badge>
          ))}
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" strokeWidth={1.75} />}
          title="Không tìm thấy bài tập"
          description={
            searchQuery || activeFilterCount > 0
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Chưa có bài tập nào được giao'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <Link key={assignment.id} href={`/hoc-sinh/bai-tap/${assignment.id}`}>
              <Card hover className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[var(--text-tertiary)]">
                        {getTypeIcon(assignment.type)}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {typeLabels[assignment.type]}
                      </span>
                    </div>
                    <h3 className="font-medium text-[var(--text-primary)] truncate">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default">{assignment.subject}</Badge>
                      <Badge variant={statusVariants[assignment.status]}>
                        {statusLabels[assignment.status]}
                      </Badge>
                    </div>
                  </div>
                  {assignment.status === 'completed' && assignment.score !== undefined && (
                    <div className="text-right ml-4">
                      <p
                        className={cn(
                          'text-xl font-bold',
                          (assignment.score / (assignment.maxScore || 10)) >= 0.8
                            ? 'text-success'
                            : (assignment.score / (assignment.maxScore || 10)) >= 0.6
                            ? 'text-warning'
                            : 'text-error'
                        )}
                      >
                        {assignment.score}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        /{assignment.maxScore} điểm
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      {assignment.status === 'overdue' ? (
                        <AlertCircle className="h-4 w-4 text-error" strokeWidth={1.75} />
                      ) : assignment.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-success" strokeWidth={1.75} />
                      ) : (
                        <Clock className="h-4 w-4" strokeWidth={1.75} />
                      )}
                      {getDeadlineText(assignment.deadline, assignment.status)}
                    </span>
                    {assignment.duration && <span>{assignment.duration} phút</span>}
                    <span>{assignment.questionCount} câu</span>
                  </div>
                  {assignment.status !== 'completed' && assignment.status !== 'overdue' && (
                    <Button size="sm" variant="primary">
                      {assignment.status === 'in_progress' ? 'Tiếp tục' : 'Làm bài'}
                    </Button>
                  )}
                  {assignment.status === 'completed' && (
                    <Button size="sm" variant="secondary">
                      Xem kết quả
                    </Button>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Bộ lọc"
      >
        <div className="space-y-6 py-4">
          {/* Type Filter */}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Loại bài</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(typeLabels) as AssignmentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTempType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    tempFilters.types.includes(type)
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Trạng thái</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabels) as AssignmentStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleTempStatus(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    tempFilters.statuses.includes(status)
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Môn học</p>
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => toggleTempSubject(subject)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    tempFilters.subjects.includes(subject)
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
          <Button onClick={applyFilters}>Áp dụng</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

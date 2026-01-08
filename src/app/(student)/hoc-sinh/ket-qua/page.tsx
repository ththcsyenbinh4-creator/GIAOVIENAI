'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  X,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/header';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
type ResultType = 'homework' | 'quiz' | 'test';

interface Result {
  id: string;
  title: string;
  subject: string;
  type: ResultType;
  score: number;
  maxScore: number;
  completedAt: string;
  duration?: number;
  questionCount: number;
  correctCount: number;
}

interface Filters {
  types: ResultType[];
  subjects: string[];
  scoreRange: 'all' | 'high' | 'medium' | 'low';
}

// Mock data
const mockResults: Result[] = [
  {
    id: '1',
    title: 'Bài kiểm tra Chương 2',
    subject: 'Toán học',
    type: 'test',
    score: 8.5,
    maxScore: 10,
    completedAt: '2024-12-14T10:30:00',
    duration: 45,
    questionCount: 20,
    correctCount: 17,
  },
  {
    id: '2',
    title: 'Bài tập Unit 4',
    subject: 'Tiếng Anh',
    type: 'homework',
    score: 9,
    maxScore: 10,
    completedAt: '2024-12-13T15:45:00',
    questionCount: 15,
    correctCount: 14,
  },
  {
    id: '3',
    title: 'Kiểm tra giữa kỳ',
    subject: 'Vật lý',
    type: 'test',
    score: 7.5,
    maxScore: 10,
    completedAt: '2024-12-10T09:00:00',
    duration: 60,
    questionCount: 30,
    correctCount: 23,
  },
  {
    id: '4',
    title: 'Quiz ngữ pháp Unit 3',
    subject: 'Tiếng Anh',
    type: 'quiz',
    score: 8,
    maxScore: 10,
    completedAt: '2024-12-08T14:00:00',
    duration: 15,
    questionCount: 10,
    correctCount: 8,
  },
  {
    id: '5',
    title: 'Bài tập Chương 1',
    subject: 'Toán học',
    type: 'homework',
    score: 9.5,
    maxScore: 10,
    completedAt: '2024-12-05T16:30:00',
    questionCount: 12,
    correctCount: 11,
  },
  {
    id: '6',
    title: 'Kiểm tra 15 phút',
    subject: 'Vật lý',
    type: 'quiz',
    score: 6,
    maxScore: 10,
    completedAt: '2024-12-03T08:30:00',
    duration: 15,
    questionCount: 10,
    correctCount: 6,
  },
];

const typeLabels: Record<ResultType, string> = {
  homework: 'Bài tập',
  quiz: 'Quiz',
  test: 'Kiểm tra',
};

const defaultFilters: Filters = {
  types: [],
  subjects: [],
  scoreRange: 'all',
};

function getScoreColor(score: number, maxScore: number) {
  const percent = (score / maxScore) * 100;
  if (percent >= 80) return 'text-success';
  if (percent >= 60) return 'text-warning';
  return 'text-error';
}

function getTrendIcon(currentScore: number, previousScore?: number) {
  if (!previousScore) return null;
  if (currentScore > previousScore) {
    return <TrendingUp className="h-4 w-4 text-success" strokeWidth={1.75} />;
  }
  if (currentScore < previousScore) {
    return <TrendingDown className="h-4 w-4 text-error" strokeWidth={1.75} />;
  }
  return <Minus className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />;
}

export default function StudentResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);

  // Available subjects for filter
  const availableSubjects = useMemo(() => {
    const subjects = mockResults.map((r) => r.subject);
    return Array.from(new Set(subjects)).sort();
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.subjects.length > 0) count += filters.subjects.length;
    if (filters.scoreRange !== 'all') count += 1;
    return count;
  }, [filters]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return mockResults.filter((result) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !result.title.toLowerCase().includes(query) &&
          !result.subject.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(result.type)) {
        return false;
      }

      // Subject filter
      if (filters.subjects.length > 0 && !filters.subjects.includes(result.subject)) {
        return false;
      }

      // Score range filter
      const scorePercent = (result.score / result.maxScore) * 100;
      if (filters.scoreRange === 'high' && scorePercent < 80) return false;
      if (filters.scoreRange === 'medium' && (scorePercent < 60 || scorePercent >= 80)) return false;
      if (filters.scoreRange === 'low' && scorePercent >= 60) return false;

      return true;
    });
  }, [searchQuery, filters]);

  // Stats
  const stats = useMemo(() => {
    const scores = mockResults.map((r) => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highScores = mockResults.filter((r) => (r.score / r.maxScore) >= 0.8).length;
    const totalCorrect = mockResults.reduce((a, r) => a + r.correctCount, 0);
    const totalQuestions = mockResults.reduce((a, r) => a + r.questionCount, 0);

    return {
      avgScore: avgScore.toFixed(1),
      highScores,
      total: mockResults.length,
      accuracy: Math.round((totalCorrect / totalQuestions) * 100),
    };
  }, []);

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

  const removeFilter = (type: 'types' | 'subjects', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
  };

  const toggleTempType = (type: ResultType) => {
    setTempFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
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

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Kết quả học tập"
        subtitle={`${stats.total} bài đã hoàn thành`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center py-4">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-warning" strokeWidth={1.75} />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.avgScore}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Điểm TB</p>
        </Card>

        <Card className="text-center py-4">
          <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" strokeWidth={1.75} />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.highScores}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Điểm cao</p>
        </Card>

        <Card className="text-center py-4">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-[var(--btn-primary-bg)]" strokeWidth={1.75} />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.accuracy}%</p>
          <p className="text-xs text-[var(--text-tertiary)]">Độ chính xác</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm kết quả..."
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
          {filters.scoreRange !== 'all' && (
            <Badge
              variant={
                filters.scoreRange === 'high'
                  ? 'success'
                  : filters.scoreRange === 'medium'
                  ? 'warning'
                  : 'error'
              }
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setFilters((prev) => ({ ...prev, scoreRange: 'all' }))}
            >
              {filters.scoreRange === 'high'
                ? 'Điểm cao (≥8)'
                : filters.scoreRange === 'medium'
                ? 'Trung bình (6-8)'
                : 'Điểm thấp (<6)'}
              <X className="h-3 w-3" strokeWidth={2} />
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

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8" strokeWidth={1.75} />}
          title="Không tìm thấy kết quả"
          description={
            searchQuery || activeFilterCount > 0
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Chưa có kết quả học tập nào'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredResults.map((result, index) => {
            const previousScore = index < filteredResults.length - 1
              ? filteredResults[index + 1].score
              : undefined;

            return (
              <Link key={result.id} href={`/hoc-sinh/ket-qua/${result.id}`}>
                <Card hover className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">
                        {result.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{result.subject}</Badge>
                        <Badge variant="default">{typeLabels[result.type]}</Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-2xl font-bold', getScoreColor(result.score, result.maxScore))}>
                          {result.score}
                        </p>
                        {getTrendIcon(result.score, previousScore)}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        /{result.maxScore} điểm
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
                      <span>Số câu đúng: {result.correctCount}/{result.questionCount}</span>
                      <span>{Math.round((result.correctCount / result.questionCount) * 100)}%</span>
                    </div>
                    <ProgressBar
                      value={(result.correctCount / result.questionCount) * 100}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" strokeWidth={1.75} />
                      {new Date(result.completedAt).toLocaleDateString('vi-VN')}
                    </div>
                    {result.duration && <span>{result.duration} phút</span>}
                  </div>
                </Card>
              </Link>
            );
          })}
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
              {(Object.keys(typeLabels) as ResultType[]).map((type) => (
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

          {/* Score Range Filter */}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Mức điểm</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'high', label: 'Điểm cao (≥8)' },
                { value: 'medium', label: 'Trung bình (6-8)' },
                { value: 'low', label: 'Điểm thấp (<6)' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setTempFilters((prev) => ({
                      ...prev,
                      scoreRange: option.value as Filters['scoreRange'],
                    }))
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    tempFilters.scoreRange === option.value
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-transparent'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {option.label}
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

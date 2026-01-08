'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  FileText,
  Calendar,
  CheckCircle,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/header';
import { fetchAssignmentDetail, startAssignment } from '@/lib/apiClient';
import { useToast } from '@/components/ui/toast';
import { AssignmentDetail } from '@/types/domain';
import { useMockUser } from '@/hooks/useMockUser';

export default function AssignmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useMockUser('student');

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    async function loadAssignment() {
      try {
        const response = await fetchAssignmentDetail(params.id);
        if (response.success && response.data) {
          setAssignment(response.data);
        } else {
          showToast('error', 'Không tìm thấy bài tập');
          router.push('/hoc-sinh');
        }
      } catch {
        showToast('error', 'Lỗi khi tải bài tập');
      } finally {
        setIsLoading(false);
      }
    }

    loadAssignment();
  }, [params.id, router, showToast]);

  const handleStartAssignment = async () => {
    if (!assignment) return;

    setIsStarting(true);
    try {
      const response = await startAssignment(assignment.id, user?.id || '');
      if (response.success && response.data) {
        // Navigate to the quiz page
        router.push(`/hoc-sinh/bai-tap/${assignment.id}/lam-bai`);
      } else {
        showToast('error', response.error || 'Không thể bắt đầu bài tập');
      }
    } catch {
      showToast('error', 'Lỗi khi bắt đầu bài tập');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-400 dark:border-mono-500" />
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const mcqCount = assignment.questions.filter((q) => q.type === 'mcq').length;
  const essayCount = assignment.questions.filter((q) => q.type === 'essay').length;
  const totalMaxScore = assignment.questions.reduce((sum, q) => sum + q.maxScore, 0);

  const formatDeadline = (dueAt: string | null) => {
    if (!dueAt) return 'Không có hạn nộp';
    const date = new Date(dueAt);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = Boolean(assignment.dueAt && new Date(assignment.dueAt) < new Date());

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Link
        href="/hoc-sinh"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Quay lại
      </Link>

      {/* Header */}
      <PageHeader
        title={assignment.title}
        subtitle={assignment.className}
      />

      {/* Status Banner */}
      {isOverdue && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0" strokeWidth={1.75} />
          <p className="text-error text-sm">
            Bài tập này đã quá hạn nộp
          </p>
        </div>
      )}

      {/* Assignment Info Card */}
      <Card className="mb-6">
        <CardContent className="space-y-4">
          {/* Description */}
          {assignment.description && (
            <div>
              <p className="text-[var(--text-secondary)]">{assignment.description}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {/* Duration */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800">
                <Clock className="h-5 w-5 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Thời gian</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {assignment.durationMinutes
                    ? `${assignment.durationMinutes} phút`
                    : 'Không giới hạn'}
                </p>
              </div>
            </div>

            {/* Questions */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <FileText className="h-5 w-5 text-success" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Số câu hỏi</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {assignment.questions.length} câu
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Hạn nộp</p>
                <p className="font-medium text-[var(--text-primary)] text-sm">
                  {formatDeadline(assignment.dueAt)}
                </p>
              </div>
            </div>

            {/* Total Score */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
                <CheckCircle className="h-5 w-5 text-error" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Tổng điểm</p>
                <p className="font-medium text-[var(--text-primary)]">{totalMaxScore} điểm</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Types Summary */}
      <Card className="mb-6">
        <CardContent>
          <h3 className="font-medium text-[var(--text-primary)] mb-3">Cấu trúc bài tập</h3>
          <div className="space-y-2">
            {mcqCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Trắc nghiệm</Badge>
                  <span className="text-[var(--text-secondary)]">{mcqCount} câu</span>
                </div>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {assignment.questions
                    .filter((q) => q.type === 'mcq')
                    .reduce((sum, q) => sum + q.maxScore, 0)}{' '}
                  điểm
                </span>
              </div>
            )}
            {essayCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Tự luận</Badge>
                  <span className="text-[var(--text-secondary)]">{essayCount} câu</span>
                </div>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {assignment.questions
                    .filter((q) => q.type === 'essay')
                    .reduce((sum, q) => sum + q.maxScore, 0)}{' '}
                  điểm
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mb-6">
        <CardContent>
          <h3 className="font-medium text-[var(--text-primary)] mb-3">Lưu ý</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-mono-600 dark:text-mono-400">•</span>
              Bài làm sẽ được tự động lưu sau mỗi câu trả lời
            </li>
            {assignment.durationMinutes && (
              <li className="flex items-start gap-2">
                <span className="text-mono-600 dark:text-mono-400">•</span>
                Bài sẽ tự động nộp khi hết thời gian
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-mono-600 dark:text-mono-400">•</span>
              Câu trắc nghiệm sẽ được chấm tự động
            </li>
            {essayCount > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-mono-600 dark:text-mono-400">•</span>
                Câu tự luận sẽ được giáo viên chấm sau
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="sticky bottom-4">
        <Button
          size="lg"
          className="w-full"
          onClick={handleStartAssignment}
          isLoading={isStarting}
          disabled={isOverdue}
          leftIcon={<PlayCircle className="h-5 w-5" strokeWidth={1.75} />}
        >
          {isOverdue ? 'Đã quá hạn' : 'Bắt đầu làm bài'}
        </Button>
      </div>
    </div>
  );
}

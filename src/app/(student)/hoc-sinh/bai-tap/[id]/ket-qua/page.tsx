'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  MessageSquare,
  Home,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress';
import { PageHeader } from '@/components/layout/header';
import { fetchSubmissionDetail } from '@/lib/apiClient';
import { useToast } from '@/components/ui/toast';
import { SubmissionDetail, SubmissionAnswerDetail } from '@/types/domain';
import { cn } from '@/lib/utils';

export default function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const submissionId = searchParams.get('submissionId');

  useEffect(() => {
    async function loadSubmission() {
      if (!submissionId) {
        showToast('error', 'Không tìm thấy bài làm');
        router.push('/hoc-sinh');
        return;
      }

      try {
        const response = await fetchSubmissionDetail(submissionId);
        if (response.success && response.data) {
          setSubmission(response.data);
        } else {
          showToast('error', 'Không tìm thấy bài làm');
          router.push('/hoc-sinh');
        }
      } catch {
        showToast('error', 'Lỗi khi tải kết quả');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId, router, showToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-400 dark:border-mono-500" />
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  // Sort answers by question order
  const sortedAnswers = [...submission.answers].sort(
    (a, b) => a.question.order - b.question.order
  );

  // Calculate scores
  const mcqAnswers = sortedAnswers.filter((a) => a.question.type === 'mcq');
  const essayAnswers = sortedAnswers.filter((a) => a.question.type === 'essay');

  const mcqCorrect = mcqAnswers.filter((a) => a.isCorrect).length;
  const mcqTotal = mcqAnswers.length;
  const mcqScore = mcqAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
  const mcqMaxScore = mcqAnswers.reduce((sum, a) => sum + a.question.maxScore, 0);

  const essayScore = essayAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
  const essayMaxScore = essayAnswers.reduce((sum, a) => sum + a.question.maxScore, 0);

  const totalScore = submission.totalScore ?? mcqScore;
  const totalMaxScore = submission.maxScore;
  const scorePercent = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  const isGraded = submission.status === 'graded';
  const isPendingGrade = submission.status === 'submitted' && essayAnswers.length > 0;

  // Get score color
  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-success';
    if (percent >= 60) return 'text-warning';
    return 'text-error';
  };

  const formatSubmitTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
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
        title="Kết quả bài làm"
        subtitle={submission.assignment.title}
      />

      {/* Score Card */}
      <Card className="mb-6 bg-gradient-to-br from-mono-800 to-mono-900 dark:from-mono-100 dark:to-mono-200 text-white">
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">
              {isGraded ? 'Điểm số' : isPendingGrade ? 'Điểm tạm tính' : 'Điểm trắc nghiệm'}
            </p>
            <p className="text-4xl font-bold">
              {totalScore.toFixed(1)}
              <span className="text-xl text-white/80">/{totalMaxScore}</span>
            </p>
            {isPendingGrade && (
              <p className="text-white/70 text-sm mt-2 flex items-center gap-1">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
                Đang chờ chấm tự luận
              </p>
            )}
          </div>
          <ProgressRing
            value={scorePercent}
            size={100}
            strokeWidth={8}
            className="[&_circle:last-child]:stroke-white"
          >
            <div className="text-center">
              <span className="text-2xl font-bold">{Math.round(scorePercent)}%</span>
            </div>
          </ProgressRing>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {mcqTotal > 0 && (
          <Card className="text-center py-4">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" strokeWidth={1.75} />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {mcqCorrect}/{mcqTotal}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Trắc nghiệm đúng</p>
          </Card>
        )}
        {essayAnswers.length > 0 && (
          <Card className="text-center py-4">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {essayAnswers.length}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Câu tự luận</p>
          </Card>
        )}
      </div>

      {/* Submit Time */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">Thời gian nộp bài</p>
            <p className="font-medium text-[var(--text-primary)]">
              {formatSubmitTime(submission.submittedAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Comment */}
      {submission.teacherOverallComment && (
        <Card className="mb-6 border-mono-400 dark:border-mono-500/30 bg-mono-50 dark:bg-mono-850">
          <CardContent>
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-mono-600 dark:text-mono-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium text-mono-600 dark:text-mono-400 mb-1">Nhận xét của giáo viên</p>
                <p className="text-mono-700 dark:text-mono-300">{submission.teacherOverallComment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết bài làm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedAnswers.map((answer, index) => (
            <AnswerItem key={answer.id} answer={answer} index={index} />
          ))}
        </CardContent>
      </Card>

      {/* Back to Home Button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto">
        <Link href="/hoc-sinh">
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            leftIcon={<Home className="h-5 w-5" strokeWidth={1.75} />}
          >
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}

function AnswerItem({
  answer,
  index,
}: {
  answer: SubmissionAnswerDetail;
  index: number;
}) {
  const question = answer.question;
  const isMcq = question.type === 'mcq';
  const isCorrect = answer.isCorrect;
  const hasScore = answer.score !== null;

  return (
    <div className="border-b border-[var(--border-default)] pb-6 last:border-0 last:pb-0">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-tertiary)]">Câu {index + 1}</span>
          <Badge variant={isMcq ? 'default' : 'warning'}>
            {isMcq ? 'Trắc nghiệm' : 'Tự luận'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isMcq && (
            isCorrect ? (
              <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
            ) : (
              <XCircle className="h-5 w-5 text-error" strokeWidth={1.75} />
            )
          )}
          {hasScore && (
            <span
              className={cn(
                'font-medium',
                answer.score === question.maxScore
                  ? 'text-success'
                  : answer.score === 0
                  ? 'text-error'
                  : 'text-warning'
              )}
            >
              {answer.score}/{question.maxScore}
            </span>
          )}
          {!hasScore && !isMcq && (
            <span className="text-[var(--text-tertiary)] text-sm">Chưa chấm</span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <p className="text-[var(--text-primary)] mb-3 whitespace-pre-wrap">{question.prompt}</p>

      {/* MCQ Answer */}
      {isMcq && question.choices && (
        <div className="space-y-2">
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = answer.selectedChoiceIndex === choiceIndex;
            const isCorrectAnswer = question.correctAnswerIndex === choiceIndex;

            return (
              <div
                key={choiceIndex}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border',
                  isSelected && isCorrectAnswer
                    ? 'bg-success/10 border-success'
                    : isSelected && !isCorrectAnswer
                    ? 'bg-error/10 border-error'
                    : isCorrectAnswer
                    ? 'bg-success/5 border-success/50'
                    : 'border-[var(--border-default)]'
                )}
              >
                {isSelected && isCorrectAnswer && (
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" strokeWidth={1.75} />
                )}
                {isSelected && !isCorrectAnswer && (
                  <XCircle className="h-5 w-5 text-error flex-shrink-0" strokeWidth={1.75} />
                )}
                {!isSelected && isCorrectAnswer && (
                  <CheckCircle className="h-5 w-5 text-success/50 flex-shrink-0" strokeWidth={1.75} />
                )}
                {!isSelected && !isCorrectAnswer && (
                  <div className="h-5 w-5 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    isCorrectAnswer ? 'font-medium' : '',
                    isSelected && !isCorrectAnswer ? 'line-through text-[var(--text-tertiary)]' : ''
                  )}
                >
                  {choice}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Essay Answer */}
      {!isMcq && (
        <div className="bg-[var(--bg-soft)] rounded-xl p-4">
          <p className="text-mono-700 dark:text-mono-300 whitespace-pre-wrap">
            {answer.answerText || <span className="text-[var(--text-tertiary)] italic">Không có câu trả lời</span>}
          </p>
        </div>
      )}

      {/* Teacher Comment */}
      {answer.teacherComment && (
        <div className="mt-3 p-3 bg-mono-50 dark:bg-mono-850 rounded-xl border border-mono-400 dark:border-mono-500/20">
          <p className="text-sm text-[var(--text-tertiary)] mb-1">Nhận xét:</p>
          <p className="text-mono-700 dark:text-mono-300">{answer.teacherComment}</p>
        </div>
      )}

      {/* AI Suggestion (for essay, if not graded yet) */}
      {!isMcq && answer.aiSuggestion && !hasScore && (
        <div className="mt-3 p-3 bg-warning/5 rounded-xl border border-warning/20">
          <p className="text-sm text-warning font-medium mb-2">Gợi ý chấm AI</p>
          <p className="text-sm text-[var(--text-secondary)]">{answer.aiSuggestion.comment}</p>
        </div>
      )}
    </div>
  );
}

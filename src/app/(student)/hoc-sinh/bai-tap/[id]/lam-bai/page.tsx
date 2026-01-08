'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { ProgressBar } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  startAssignment,
  updateSubmissionAnswers,
  submitAssignment,
} from '@/lib/apiClient';
import { useToast } from '@/components/ui/toast';
import { StudentAnswerUpdate, SubmissionDetail } from '@/types/domain';
import { useMockUser } from '@/hooks/useMockUser';

export default function TakeQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useMockUser('student');

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Map<string, { selectedChoiceIndex?: number | null; answerText?: string }>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load submission on mount
  useEffect(() => {
    async function loadSubmission() {
      try {
        const response = await startAssignment(params.id, user?.id || '');
        if (response.success && response.data) {
          setSubmission(response.data);

          // Initialize local answers from server
          const answersMap = new Map<string, { selectedChoiceIndex?: number | null; answerText?: string }>();
          response.data.answers.forEach((a) => {
            answersMap.set(a.questionId, {
              selectedChoiceIndex: a.selectedChoiceIndex,
              answerText: a.answerText,
            });
          });
          setLocalAnswers(answersMap);

          // Set timer if duration exists
          if (response.data.assignment.durationMinutes) {
            const startTime = new Date(response.data.startedAt).getTime();
            const durationMs = response.data.assignment.durationMinutes * 60 * 1000;
            const endTime = startTime + durationMs;
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
          }
        } else {
          showToast('error', response.error || 'Không thể tải bài làm');
          router.push('/hoc-sinh');
        }
      } catch {
        showToast('error', 'Lỗi khi tải bài làm');
        router.push('/hoc-sinh');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmission();
  }, [params.id, router, showToast]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setShowTimeUpModal(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get questions sorted by order
  const questions = submission?.answers
    .map((a) => a.question)
    .sort((a, b) => a.order - b.order) || [];

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? localAnswers.get(currentQuestion.id) : undefined;

  // Save answer to server
  const saveAnswerToServer = useCallback(
    async (questionId: string, update: { selectedChoiceIndex?: number | null; answerText?: string | null }) => {
      if (!submission) return;

      setIsSaving(true);
      try {
        const answers: StudentAnswerUpdate[] = [{
          questionId,
          selectedChoiceIndex: update.selectedChoiceIndex,
          answerText: update.answerText,
        }];

        const response = await updateSubmissionAnswers(submission.id, answers);
        if (!response.success) {
          showToast('error', 'Không thể lưu câu trả lời');
        }
      } catch {
        showToast('error', 'Lỗi khi lưu câu trả lời');
      } finally {
        setIsSaving(false);
      }
    },
    [submission, showToast]
  );

  // Handle option select
  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;

    // Update local state immediately
    setLocalAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.id, {
        ...prev.get(currentQuestion.id),
        selectedChoiceIndex: optionIndex,
      });
      return newMap;
    });

    // Save to server
    saveAnswerToServer(currentQuestion.id, { selectedChoiceIndex: optionIndex });
  };

  // Handle essay change with debounce
  const handleEssayChange = (text: string) => {
    if (!currentQuestion) return;

    // Update local state immediately
    setLocalAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.id, {
        ...prev.get(currentQuestion.id),
        answerText: text,
      });
      return newMap;
    });
  };

  // Save essay on blur
  const handleEssayBlur = () => {
    if (!currentQuestion) return;
    const answer = localAnswers.get(currentQuestion.id);
    if (answer?.answerText !== undefined) {
      saveAnswerToServer(currentQuestion.id, { answerText: answer.answerText });
    }
  };

  // Navigate questions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // Count answered questions
  const answeredCount = Array.from(localAnswers.values()).filter(
    (a) => a.selectedChoiceIndex !== undefined && a.selectedChoiceIndex !== null || (a.answerText && a.answerText.trim())
  ).length;

  // Submit quiz
  const handleSubmit = async () => {
    if (!submission) return;

    setIsSubmitting(true);

    try {
      const response = await submitAssignment(submission.id);
      if (response.success) {
        showToast('success', 'Nộp bài thành công!');
        // Redirect to result page
        router.push(`/hoc-sinh/bai-tap/${params.id}/ket-qua?submissionId=${submission.id}`);
      } else {
        showToast('error', response.error || 'Không thể nộp bài');
      }
    } catch {
      showToast('error', 'Lỗi khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-soft)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-400 dark:border-mono-500" />
      </div>
    );
  }

  if (!submission || !currentQuestion) {
    return null;
  }

  const isTimeLow = timeLeft !== null && timeLeft < 300; // 5 minutes

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--border-default)]/50">
        <div className="flex h-14 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ChevronLeft className="h-5 w-5" strokeWidth={1.75} />}
          >
            Thoát
          </Button>

          <h1 className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">
            {submission.assignment.title}
          </h1>

          {timeLeft !== null ? (
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5',
                isTimeLow ? 'bg-error/10 text-error' : 'bg-mono-200 dark:bg-mono-700 text-[var(--text-primary)]'
              )}
            >
              <Clock className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-medium tabular-nums text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-3 border-b border-[var(--border-default)] bg-white">
        <ProgressBar value={answeredCount} max={questions.length} size="sm" />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[var(--text-tertiary)]">
            Đã trả lời {answeredCount}/{questions.length} câu
          </p>
          {isSaving && (
            <p className="text-xs text-[var(--text-tertiary)]">Đang lưu...</p>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="px-4 py-3 border-b border-[var(--border-default)] bg-white overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {questions.map((q, index) => {
            const answer = localAnswers.get(q.id);
            const isAnswered =
              (answer?.selectedChoiceIndex !== undefined && answer?.selectedChoiceIndex !== null) ||
              (answer?.answerText && answer.answerText.trim());
            const isCurrent = index === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(index)}
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all',
                  isCurrent
                    ? 'bg-mono-900 dark:bg-mono-100 text-white'
                    : isAnswered
                    ? 'bg-success/20 text-success'
                    : 'bg-mono-200 dark:bg-mono-700 text-[var(--text-secondary)] hover:bg-gray-300'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <div className="p-4">
        <Card className="max-w-2xl mx-auto">
          {/* Question Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800">
              <HelpCircle className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-tertiary)]">
                Câu {currentIndex + 1}/{questions.length}
              </p>
              <p className="text-xs text-mono-600 dark:text-mono-400">{currentQuestion.maxScore} điểm</p>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <p className="text-lg font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {currentQuestion.prompt}
            </p>
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'mcq' && currentQuestion.choices && (
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => {
                const isSelected = currentAnswer?.selectedChoiceIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                      isSelected
                        ? 'border-mono-400 dark:border-mono-500 bg-mono-50 dark:bg-mono-850'
                        : 'border-[var(--border-default)] hover:border-mono-400 dark:border-mono-500/30'
                    )}
                  >
                    {isSelected ? (
                      <CheckCircle
                        className="h-6 w-6 flex-shrink-0 text-mono-600 dark:text-mono-400"
                        strokeWidth={1.75}
                      />
                    ) : (
                      <Circle
                        className="h-6 w-6 flex-shrink-0 text-mono-300 dark:text-mono-600"
                        strokeWidth={1.75}
                      />
                    )}
                    <span className="text-[var(--text-primary)]">{choice}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Essay Input */}
          {currentQuestion.type === 'essay' && (
            <Textarea
              value={currentAnswer?.answerText || ''}
              onChange={(e) => handleEssayChange(e.target.value)}
              onBlur={handleEssayBlur}
              placeholder="Nhập câu trả lời của bạn..."
              className="min-h-[200px]"
            />
          )}
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-[var(--border-default)]/50 safe-bottom">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="secondary"
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft className="h-5 w-5" strokeWidth={1.75} />}
          >
            Câu trước
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={() => setShowSubmitModal(true)}
              leftIcon={<Send className="h-5 w-5" strokeWidth={1.75} />}
            >
              Nộp bài
            </Button>
          ) : (
            <Button
              onClick={() => goToQuestion(currentIndex + 1)}
              rightIcon={<ChevronRight className="h-5 w-5" strokeWidth={1.75} />}
            >
              Câu sau
            </Button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Xác nhận nộp bài"
      >
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800">
            <Send className="h-8 w-8 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
          </div>
          <p className="text-[var(--text-secondary)] mb-2">
            Bạn đã trả lời <strong>{answeredCount}/{questions.length}</strong> câu hỏi.
          </p>
          {answeredCount < questions.length && (
            <p className="text-warning text-sm flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
              Còn {questions.length - answeredCount} câu chưa trả lời
            </p>
          )}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Kiểm tra lại
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Nộp bài
          </Button>
        </ModalFooter>
      </Modal>

      {/* Time Up Modal */}
      <Modal
        isOpen={showTimeUpModal}
        onClose={() => {}}
        closeOnOverlayClick={false}
        showCloseButton={false}
        title="Hết thời gian!"
      >
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <Clock className="h-8 w-8 text-error" strokeWidth={1.75} />
          </div>
          <p className="text-[var(--text-secondary)]">
            Thời gian làm bài đã hết. Bài làm của bạn sẽ được nộp tự động.
          </p>
        </div>
        <ModalFooter className="justify-center">
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Xem kết quả
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

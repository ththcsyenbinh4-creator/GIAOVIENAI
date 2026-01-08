'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Sparkles,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  HelpCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { fetchSubmissionDetail, gradeSubmission, gradeEssay } from '@/lib/apiClient';
import { SubmissionDetail, SubmissionAnswerDetail } from '@/types/domain';
import { useToast } from '@/components/ui/toast';

interface EssayGrade {
  answerId: string;
  score: number;
  feedback: string;
}

export default function GradingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [essayGrades, setEssayGrades] = useState<Map<string, EssayGrade>>(new Map());
  const [overallFeedback, setOverallFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  // API state
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submission detail from API
  const loadSubmission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSubmissionDetail(params.id);

      if (response.success && response.data) {
        setSubmission(response.data);
        // Pre-populate overall feedback if already graded
        if (response.data.teacherOverallComment) {
          setOverallFeedback(response.data.teacherOverallComment);
        }
      } else {
        setError(response.error || 'Không thể tải chi tiết bài làm');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      console.error('Error loading submission:', err);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  // Load submission on mount
  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin mb-4" strokeWidth={1.75} />
        <p className="text-[var(--text-tertiary)]">Đang tải chi tiết bài làm...</p>
      </div>
    );
  }

  // Error state
  if (error || !submission) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/giao-vien/cham-bai">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Chấm bài</h1>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" strokeWidth={1.75} />
          <p className="text-lg font-medium text-[var(--text-primary)] mb-2">Không thể tải bài làm</p>
          <p className="text-[var(--text-secondary)] mb-4">{error || 'Bài làm không tồn tại'}</p>
          <Button onClick={() => loadSubmission()}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  const { student, assignment, answers, className } = submission;
  const currentAnswer = answers[currentQuestionIndex];

  // Calculate scores - using question.type from API response
  const mcqAnswers = answers.filter((a) => a.question.type === 'mcq');
  const essayAnswers = answers.filter((a) => a.question.type === 'essay');

  const mcqScore = mcqAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
  const mcqTotal = mcqAnswers.reduce((sum, a) => sum + a.question.maxScore, 0);

  const getEssayScore = (answerId: string) => {
    const grade = essayGrades.get(answerId);
    if (grade) return grade.score;
    const answer = essayAnswers.find((a) => a.id === answerId);
    return answer?.aiSuggestion?.suggestedScore ?? answer?.score ?? null;
  };

  const essayScore = essayAnswers.reduce((sum, a) => {
    const score = getEssayScore(a.id);
    return sum + (score ?? 0);
  }, 0);
  const essayTotal = essayAnswers.reduce((sum, a) => sum + a.question.maxScore, 0);

  const totalScore = mcqScore + essayScore;
  const totalMaxScore = mcqTotal + essayTotal;
  const finalGrade = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 10).toFixed(1) : '0.0';

  // Check if all essays are graded
  const allEssaysGraded = essayAnswers.every((a) => {
    const grade = essayGrades.get(a.id);
    return grade !== undefined || a.aiSuggestion !== undefined || a.score !== null;
  });

  // Handlers
  const handleSetEssayScore = (answerId: string, score: number, feedback?: string) => {
    const existing = essayGrades.get(answerId);
    setEssayGrades((prev) => {
      const newMap = new Map(prev);
      newMap.set(answerId, {
        answerId,
        score,
        feedback: feedback ?? existing?.feedback ?? '',
      });
      return newMap;
    });
  };

  const handleSetEssayFeedback = (answerId: string, feedback: string) => {
    const existing = essayGrades.get(answerId);
    const answer = essayAnswers.find((a) => a.id === answerId);
    setEssayGrades((prev) => {
      const newMap = new Map(prev);
      newMap.set(answerId, {
        answerId,
        score: existing?.score ?? answer?.aiSuggestion?.suggestedScore ?? 0,
        feedback,
      });
      return newMap;
    });
  };

  const handleAcceptAISuggestion = (answerId: string) => {
    const answer = essayAnswers.find((a) => a.id === answerId);
    if (answer?.aiSuggestion) {
      handleSetEssayScore(
        answerId,
        answer.aiSuggestion.suggestedScore,
        answer.aiSuggestion.comment
      );
    }
  };

  const handleRegenerateAI = async (answerId: string) => {
    const answer = essayAnswers.find((a) => a.id === answerId);
    if (!answer || !answer.answerText) return;

    setIsRegenerating(answerId);
    try {
      const response = await gradeEssay({
        answerText: answer.answerText,
        questionPrompt: answer.question.prompt,
        maxScore: answer.question.maxScore,
      });

      if (response.success && response.data) {
        // Update the submission state with new AI suggestion
        setSubmission((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            answers: prev.answers.map((a) =>
              a.id === answerId
                ? { ...a, aiSuggestion: response.data }
                : a
            ),
          };
        });
      } else {
        console.error('Error regenerating AI:', response.error);
      }
    } catch (err) {
      console.error('Error regenerating AI:', err);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleSubmitGrades = async () => {
    setIsSubmitting(true);

    try {
      // Build grading payload
      const gradingPayload = {
        answers: essayAnswers.map((answer) => {
          const grade = essayGrades.get(answer.id);
          const score = grade?.score ?? answer.aiSuggestion?.suggestedScore ?? 0;
          const comment = grade?.feedback ?? answer.aiSuggestion?.comment ?? '';
          return {
            questionId: answer.questionId,
            score,
            teacherComment: comment || undefined,
          };
        }),
        overallComment: overallFeedback || undefined,
      };

      const response = await gradeSubmission(params.id, gradingPayload);

      if (response.success) {
        showToast('success', 'Chấm bài thành công!', 'Điểm đã được lưu và gửi cho học sinh');
        router.push('/giao-vien/cham-bai');
      } else {
        showToast('error', 'Lỗi', response.error || 'Không thể lưu điểm');
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      showToast('error', 'Lỗi', 'Đã xảy ra lỗi khi lưu điểm');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < answers.length) {
      setCurrentQuestionIndex(index);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/giao-vien/cham-bai">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Chấm bài</h1>
            <p className="text-sm text-[var(--text-secondary)]">{assignment.title}</p>
          </div>
        </div>

        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={!allEssaysGraded}
          leftIcon={<Send className="h-5 w-5" strokeWidth={1.75} />}
        >
          Hoàn tất chấm bài
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Student Info & Navigation */}
        <div className="lg:col-span-1 space-y-4">
          {/* Student Info */}
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mono-200 dark:bg-mono-700 text-[var(--text-secondary)] font-semibold text-xl">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{student.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{className}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-tertiary)]">Thời gian làm</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {assignment.durationMinutes ? `${assignment.durationMinutes} phút` : 'Không giới hạn'}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Nộp bài lúc</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Chưa nộp'}
                </p>
              </div>
            </div>
          </Card>

          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tổng điểm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-[var(--accent)]">{finalGrade}</p>
                <p className="text-sm text-[var(--text-tertiary)]">/ 10 điểm</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Trắc nghiệm</span>
                  <span className="font-medium">
                    {mcqScore}/{mcqTotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Tự luận</span>
                  <span className="font-medium">
                    {essayScore.toFixed(1)}/{essayTotal}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danh sách câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {answers.map((answer, index) => {
                  const isMcq = answer.question.type === 'mcq';
                  const isGraded = isMcq
                    ? true
                    : essayGrades.has(answer.id) || answer.aiSuggestion || answer.score !== null;
                  const isCorrect = isMcq ? answer.isCorrect : null;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={answer.id}
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        'flex h-10 w-full items-center justify-center rounded-full text-base font-semibold transition-all',
                        isCurrent
                          ? 'bg-mono-900 dark:bg-white text-white dark:text-mono-900'
                          : isCorrect === true
                          ? 'bg-success/20 text-success'
                          : isCorrect === false
                          ? 'bg-error/20 text-error'
                          : isGraded
                          ? 'bg-mono-200 dark:bg-mono-700 text-[var(--text-primary)]'
                          : 'bg-mono-200 dark:bg-mono-700 text-[var(--text-secondary)] hover:bg-mono-300 dark:hover:bg-mono-600'
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-success/20" /> Đúng
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-error/20" /> Sai
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-mono-100 dark:bg-mono-800" /> Đã chấm
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Question Detail */}
        <div className="lg:col-span-2">
          <Card>
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800">
                  <HelpCircle className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    Câu {currentAnswer.question.order}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={currentAnswer.question.type === 'essay' ? 'primary' : 'default'}
                    >
                      {currentAnswer.question.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                    </Badge>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {currentAnswer.question.maxScore} điểm
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
                </Button>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {currentQuestionIndex + 1}/{answers.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === answers.length - 1}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                </Button>
              </div>
            </div>

            {/* Question Content */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--bg-soft)]">
              <p className="text-[var(--text-primary)]">{currentAnswer.question.prompt}</p>
            </div>

            {/* Multiple Choice Answer */}
            {currentAnswer.question.type === 'mcq' && currentAnswer.question.choices && (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Đáp án:</p>
                {currentAnswer.question.choices.map((choiceText, choiceIndex) => {
                  const choiceLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
                  const isSelected = currentAnswer.selectedChoiceIndex === choiceIndex;
                  const isCorrectOption = currentAnswer.question.correctAnswerIndex === choiceIndex;

                  return (
                    <div
                      key={choiceIndex}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border-2',
                        isSelected && isCorrectOption
                          ? 'border-success bg-success/5'
                          : isSelected && !isCorrectOption
                          ? 'border-error bg-error/5'
                          : isCorrectOption
                          ? 'border-success/50 bg-success/5'
                          : 'border-[var(--border-default)]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                          isSelected && isCorrectOption
                            ? 'bg-success text-white'
                            : isSelected && !isCorrectOption
                            ? 'bg-error text-white'
                            : isCorrectOption
                            ? 'bg-success/20 text-success'
                            : 'bg-mono-200 dark:bg-mono-700 text-[var(--text-secondary)]'
                        )}
                      >
                        {choiceLabels[choiceIndex]}
                      </span>
                      <span className="flex-1">{choiceText}</span>
                      {isSelected && isCorrectOption && (
                        <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
                      )}
                      {isSelected && !isCorrectOption && (
                        <XCircle className="h-5 w-5 text-error" strokeWidth={1.75} />
                      )}
                    </div>
                  );
                })}

                {/* Result */}
                <div
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl',
                    currentAnswer.isCorrect ? 'bg-success/10' : 'bg-error/10'
                  )}
                >
                  {currentAnswer.isCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
                      <span className="font-medium text-success">Đúng</span>
                      <span className="text-success">
                        +{currentAnswer.score ?? 0} điểm
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-error" strokeWidth={1.75} />
                      <span className="font-medium text-error">Sai</span>
                      <span className="text-error">0 điểm</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Essay Answer */}
            {currentAnswer.question.type === 'essay' && (
              <div className="space-y-6">
                {/* Student's Answer */}
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Bài làm của học sinh:</p>
                  <div className="p-4 rounded-xl bg-[var(--bg-soft)] whitespace-pre-wrap">
                    {currentAnswer.answerText || <span className="text-[var(--text-tertiary)] italic">Học sinh không trả lời</span>}
                  </div>
                </div>

                {/* AI Suggestion */}
                {currentAnswer.aiSuggestion && (
                  <Card className="border-[var(--accent)]/30 bg-mono-100 dark:bg-mono-800">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800">
                        <Sparkles className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--text-primary)]">Gợi ý từ AI</p>
                            {currentAnswer.aiSuggestion.source && (
                              <Badge
                                variant={currentAnswer.aiSuggestion.source === 'openai' ? 'primary' : 'default'}
                                className="text-[10px] px-2 py-0.5"
                              >
                                {currentAnswer.aiSuggestion.source === 'openai'
                                  ? 'OpenAI'
                                  : currentAnswer.aiSuggestion.source === 'heuristic-fallback'
                                  ? 'Ước lượng (fallback)'
                                  : 'Ước lượng'}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateAI(currentAnswer.id)}
                            isLoading={isRegenerating === currentAnswer.id}
                            leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />}
                          >
                            Tạo lại
                          </Button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {currentAnswer.aiSuggestion.comment}
                        </p>
                      </div>
                    </div>

                    {/* AI Score */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-mono-900 mb-4">
                      <span className="text-sm text-[var(--text-secondary)]">Điểm gợi ý</span>
                      <span className="text-xl font-bold text-[var(--accent)]">
                        {currentAnswer.aiSuggestion.suggestedScore}/
                        {currentAnswer.question.maxScore}
                      </span>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentAnswer.aiSuggestion.strengths.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-success mb-2 flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" strokeWidth={1.75} />
                            Điểm mạnh
                          </p>
                          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                            {currentAnswer.aiSuggestion.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {currentAnswer.aiSuggestion.improvements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-warning mb-2 flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4" strokeWidth={1.75} />
                            Cần cải thiện
                          </p>
                          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                            {currentAnswer.aiSuggestion.improvements.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Accept AI Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="secondary"
                        onClick={() => handleAcceptAISuggestion(currentAnswer.id)}
                        leftIcon={<CheckCircle className="h-5 w-5" strokeWidth={1.75} />}
                      >
                        Chấp nhận điểm AI
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Manual Grading */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Chấm điểm thủ công</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                        Điểm (tối đa {currentAnswer.question.maxScore})
                      </label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4].filter((n) => n <= currentAnswer.question.maxScore).map((score) => (
                          <button
                            key={score}
                            onClick={() => handleSetEssayScore(currentAnswer.id, score)}
                            className={cn(
                              'flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                              getEssayScore(currentAnswer.id) === score
                                ? 'border-[var(--accent)] bg-mono-900 dark:bg-mono-100 text-white dark:text-[var(--text-primary)]'
                                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30'
                            )}
                          >
                            {score}
                          </button>
                        ))}
                        {currentAnswer.question.maxScore > 4 && (
                          <Input
                            type="number"
                            placeholder="Khác"
                            value={
                              getEssayScore(currentAnswer.id) !== null &&
                              ![0, 1, 2, 3, 4].includes(getEssayScore(currentAnswer.id)!)
                                ? getEssayScore(currentAnswer.id)!
                                : ''
                            }
                            onChange={(e) =>
                              handleSetEssayScore(currentAnswer.id, Number(e.target.value))
                            }
                            className="w-24"
                            min={0}
                            max={currentAnswer.question.maxScore}
                            step={0.5}
                          />
                        )}
                      </div>
                    </div>

                    <Textarea
                      label="Nhận xét"
                      placeholder="Nhập nhận xét cho học sinh..."
                      value={essayGrades.get(currentAnswer.id)?.feedback ?? ''}
                      onChange={(e) =>
                        handleSetEssayFeedback(currentAnswer.id, e.target.value)
                      }
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Overall Feedback */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
            Nhận xét tổng thể
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Nhập nhận xét tổng thể cho bài làm của học sinh..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Xác nhận hoàn tất chấm bài"
      >
        <div className="py-4">
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-[var(--accent)] mb-2">{finalGrade}</p>
            <p className="text-[var(--text-tertiary)]">điểm</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-mono-100 dark:border-mono-800">
              <span className="text-[var(--text-secondary)]">Học sinh</span>
              <span className="font-medium">{student.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-mono-100 dark:border-mono-800">
              <span className="text-[var(--text-secondary)]">Bài tập</span>
              <span className="font-medium">{assignment.title}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-mono-100 dark:border-mono-800">
              <span className="text-[var(--text-secondary)]">Trắc nghiệm</span>
              <span className="font-medium">
                {mcqScore}/{mcqTotal}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[var(--text-secondary)]">Tự luận</span>
              <span className="font-medium">
                {essayScore.toFixed(1)}/{essayTotal}
              </span>
            </div>
          </div>

          <p className="text-sm text-[var(--text-tertiary)] mt-4 text-center">
            Sau khi xác nhận, điểm sẽ được gửi cho học sinh.
          </p>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Kiểm tra lại
          </Button>
          <Button
            onClick={handleSubmitGrades}
            isLoading={isSubmitting}
            leftIcon={<Send className="h-5 w-5" strokeWidth={1.75} />}
          >
            Xác nhận
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

'use client';

/**
 * LessonPlayer Component
 *
 * A live teaching interface that guides teachers through the lesson
 * step by step with timing, content display, and progress tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Presentation,
  Brain,
  FileText,
  MessageSquare,
  Clock,
  Coffee,
  CheckSquare,
  Home,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Target,
  Timer,
  CheckCircle2,
  Award,
  TrendingUp,
  Lightbulb,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlideViewer } from '@/components/slides/SlideViewer';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { WorksheetViewer } from '@/components/worksheets/WorksheetViewer';
import { Lesson, LessonStep, LessonStepType } from '@/types/domain';
import { cn } from '@/lib/utils';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose?: () => void;
  onComplete?: (lesson: Lesson) => void;
}

const STEP_TYPE_CONFIG: Record<
  LessonStepType,
  { icon: React.ElementType; label: string; color: string }
> = {
  intro: { icon: BookOpen, label: 'Giới thiệu', color: 'blue' },
  slide: { icon: Presentation, label: 'Slide', color: 'purple' },
  audio: { icon: Volume2, label: 'Audio', color: 'pink' },
  flashcard: { icon: Brain, label: 'Flashcard', color: 'orange' },
  worksheet: { icon: FileText, label: 'Bài tập', color: 'emerald' },
  discussion: { icon: MessageSquare, label: 'Thảo luận', color: 'cyan' },
  break: { icon: Coffee, label: 'Nghỉ giải lao', color: 'gray' },
  summary: { icon: CheckSquare, label: 'Tổng kết', color: 'green' },
  homework: { icon: Home, label: 'Bài về nhà', color: 'amber' },
};

export function LessonPlayer({ lesson, onClose, onComplete }: LessonPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stepElapsedSeconds, setStepElapsedSeconds] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [stepTimeLog, setStepTimeLog] = useState<Record<string, number>>({});

  const currentStep = lesson.steps[currentStepIndex];
  const totalSteps = lesson.steps.length;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setStepElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePrevStep();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (onClose) {
          onClose();
        }
      } else if (e.key === 'f') {
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  const handleNextStep = useCallback(() => {
    // Log time spent on current step
    setStepTimeLog((prev) => ({
      ...prev,
      [currentStep.id]: (prev[currentStep.id] || 0) + stepElapsedSeconds,
    }));

    if (currentStepIndex < totalSteps - 1) {
      // Mark current step as completed
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentStep.id);
        return newSet;
      });
      setCurrentStepIndex((prev) => prev + 1);
      setStepElapsedSeconds(0);
    } else {
      // Lesson complete - show summary
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentStep.id);
        return newSet;
      });
      setIsPlaying(false);
      setShowSummary(true);
    }
  }, [currentStepIndex, totalSteps, currentStep, lesson, stepElapsedSeconds]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setStepElapsedSeconds(0);
    }
  }, [currentStepIndex]);

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    setStepElapsedSeconds(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishLesson = () => {
    if (onComplete) {
      onComplete({
        ...lesson,
        status: 'completed',
        completedAt: new Date().toISOString(),
        teacherNotes: reflectionNotes || lesson.teacherNotes,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const handleTeachAgain = () => {
    setShowSummary(false);
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    setStepElapsedSeconds(0);
    setCompletedSteps(new Set());
    setStepTimeLog({});
    setReflectionNotes('');
  };

  // Calculate statistics for summary
  const getStepStats = () => {
    const stats = {
      totalTimeSpent: elapsedSeconds,
      plannedTime: lesson.totalDurationMinutes * 60,
      timeDifference: elapsedSeconds - lesson.totalDurationMinutes * 60,
      stepsWithSlides: lesson.steps.filter(s => s.type === 'slide').length,
      stepsWithFlashcards: lesson.steps.filter(s => s.type === 'flashcard').length,
      stepsWithWorksheets: lesson.steps.filter(s => s.type === 'worksheet').length,
      overTimeSteps: lesson.steps.filter(s => {
        const timeSpent = stepTimeLog[s.id] || 0;
        return timeSpent > s.durationMinutes * 60;
      }),
    };
    return stats;
  };

  const stepProgress = Math.min(100, (stepElapsedSeconds / (currentStep.durationMinutes * 60)) * 100);
  const lessonProgress = ((completedSteps.size + (stepProgress / 100)) / totalSteps) * 100;

  const StepIcon = STEP_TYPE_CONFIG[currentStep.type].icon;

  // Show Summary Screen
  if (showSummary) {
    const stats = getStepStats();
    const isOverTime = stats.timeDifference > 0;

    return (
      <div
        className={cn(
          'flex flex-col bg-[var(--bg-primary)]',
          isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Hoàn thành bài giảng!
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {lesson.title}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          )}
        </div>

        {/* Summary Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Time Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-4 text-center">
                <Timer className="h-6 w-6 mx-auto mb-2 text-blue-500" strokeWidth={1.75} />
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatTime(stats.totalTimeSpent)}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">Thời gian thực tế</p>
              </div>
              <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" strokeWidth={1.75} />
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {lesson.totalDurationMinutes}:00
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">Thời gian dự kiến</p>
              </div>
              <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-4 text-center">
                <TrendingUp className={cn('h-6 w-6 mx-auto mb-2', isOverTime ? 'text-red-500' : 'text-green-500')} strokeWidth={1.75} />
                <p className={cn('text-2xl font-bold', isOverTime ? 'text-red-500' : 'text-green-500')}>
                  {isOverTime ? '+' : '-'}{formatTime(Math.abs(stats.timeDifference))}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {isOverTime ? 'Vượt thời gian' : 'Tiết kiệm'}
                </p>
              </div>
            </div>

            {/* Materials Used */}
            <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                Tài liệu đã sử dụng
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {stats.stepsWithSlides > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Presentation className="h-5 w-5 text-purple-600" strokeWidth={1.75} />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{stats.stepsWithSlides} Slide</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Bài trình chiếu</p>
                    </div>
                  </div>
                )}
                {stats.stepsWithFlashcards > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Brain className="h-5 w-5 text-orange-600" strokeWidth={1.75} />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{stats.stepsWithFlashcards} Flashcard</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Bộ thẻ ôn tập</p>
                    </div>
                  </div>
                )}
                {stats.stepsWithWorksheets > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <FileText className="h-5 w-5 text-emerald-600" strokeWidth={1.75} />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{stats.stepsWithWorksheets} Worksheet</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Bài tập</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step Time Analysis */}
            <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" strokeWidth={1.75} />
                Phân tích thời gian từng bước
              </h3>
              <div className="space-y-3">
                {lesson.steps.map((step) => {
                  const timeSpent = stepTimeLog[step.id] || 0;
                  const plannedTime = step.durationMinutes * 60;
                  const isOver = timeSpent > plannedTime;
                  const progressPercent = Math.min(100, (timeSpent / plannedTime) * 100);
                  const config = STEP_TYPE_CONFIG[step.type];
                  const Icon = config.icon;

                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[var(--text-primary)] truncate">{step.title}</span>
                          <span className={cn('text-xs font-medium', isOver ? 'text-red-500' : 'text-[var(--text-tertiary)]')}>
                            {formatTime(timeSpent)} / {step.durationMinutes}:00
                          </span>
                        </div>
                        <div className="h-1.5 bg-mono-100 dark:bg-mono-800 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', isOver ? 'bg-red-500' : 'bg-green-500')}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Suggestions */}
            {stats.overTimeSteps.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" strokeWidth={1.75} />
                  Gợi ý cho tiết sau
                </h3>
                <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                  {stats.overTimeSteps.map((step) => (
                    <li key={step.id}>
                      - Phần "{step.title}" vượt thời gian. Có thể cân nhắc rút ngắn hoặc chia nhỏ nội dung.
                    </li>
                  ))}
                  {stats.timeDifference > 300 && (
                    <li>- Tổng thời gian vượt quá 5 phút. Cân nhắc điều chỉnh lại cấu trúc bài giảng.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Teacher Reflection Notes */}
            <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
                Ghi chú sau tiết học
              </h3>
              <textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="Ghi lại những điểm cần lưu ý, những gì học sinh phản hồi tốt, những gì cần cải thiện..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
          <Button
            variant="secondary"
            onClick={handleTeachAgain}
            leftIcon={<RotateCcw className="h-4 w-4" strokeWidth={1.75} />}
          >
            Dạy lại từ đầu
          </Button>

          <Button
            variant="primary"
            onClick={handleFinishLesson}
            leftIcon={<Save className="h-4 w-4" strokeWidth={1.75} />}
          >
            Lưu và hoàn thành
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--bg-primary)]',
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          )}
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">{lesson.title}</h1>
            <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
              {lesson.subject && <span>{lesson.subject}</span>}
              {lesson.gradeLevel && (
                <>
                  <span>•</span>
                  <span>{lesson.gradeLevel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Total Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mono-100 dark:bg-mono-800">
            <Timer className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
            <span className="text-sm font-mono font-medium text-[var(--text-primary)]">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              / {lesson.totalDurationMinutes}:00
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-mono-200 dark:bg-mono-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${lessonProgress}%` }}
              />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {Math.round(lessonProgress)}%
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? (
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <Maximize2 className="h-5 w-5" strokeWidth={1.75} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  `bg-${STEP_TYPE_CONFIG[currentStep.type].color}-100 dark:bg-${STEP_TYPE_CONFIG[currentStep.type].color}-900/30`
                )}
              >
                <StepIcon
                  className={`h-5 w-5 text-${STEP_TYPE_CONFIG[currentStep.type].color}-600 dark:text-${STEP_TYPE_CONFIG[currentStep.type].color}-400`}
                  strokeWidth={1.75}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-tertiary)]">
                    Bước {currentStepIndex + 1}/{totalSteps}
                  </span>
                  <span className="text-sm text-[var(--text-tertiary)]">•</span>
                  <span className="text-sm text-[var(--text-tertiary)]">
                    {STEP_TYPE_CONFIG[currentStep.type].label}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {currentStep.title}
                </h2>
              </div>
            </div>

            {/* Step Timer */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                  <span
                    className={cn(
                      'font-mono font-medium',
                      stepProgress > 100 ? 'text-red-500' : 'text-[var(--text-primary)]'
                    )}
                  >
                    {formatTime(stepElapsedSeconds)}
                  </span>
                  <span className="text-[var(--text-tertiary)]">
                    / {currentStep.durationMinutes}:00
                  </span>
                </div>
                <div className="w-32 h-1.5 bg-mono-200 dark:bg-mono-700 rounded-full overflow-hidden mt-1">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-1000',
                      stepProgress > 100 ? 'bg-red-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${Math.min(100, stepProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-auto">
            <StepContent step={currentStep} />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
            <Button
              variant="secondary"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              leftIcon={<SkipBack className="h-4 w-4" strokeWidth={1.75} />}
            >
              Bước trước
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant={isPlaying ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                leftIcon={
                  isPlaying ? (
                    <Pause className="h-5 w-5" strokeWidth={1.75} />
                  ) : (
                    <Play className="h-5 w-5" strokeWidth={1.75} />
                  )
                }
              >
                {isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={handleNextStep}
              rightIcon={<SkipForward className="h-4 w-4" strokeWidth={1.75} />}
            >
              {currentStepIndex === totalSteps - 1 ? 'Hoàn thành' : 'Bước tiếp'}
            </Button>
          </div>
        </div>

        {/* Sidebar - Step List */}
        {showSidebar && (
          <div className="w-80 border-l border-[var(--border-default)] bg-[var(--bg-soft)] overflow-auto">
            <div className="p-4">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Các bước</h3>
              <div className="space-y-2">
                {lesson.steps.map((step, index) => {
                  const config = STEP_TYPE_CONFIG[step.type];
                  const Icon = config.icon;
                  const isActive = index === currentStepIndex;
                  const isCompleted = completedSteps.has(step.id);

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleGoToStep(index)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                        isActive
                          ? 'bg-[var(--accent-soft)] border border-[var(--accent)]'
                          : 'hover:bg-mono-100 dark:hover:bg-mono-800'
                      )}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            isCompleted
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : `bg-${config.color}-100 dark:bg-${config.color}-900/30`
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              className="h-4 w-4 text-green-600 dark:text-green-400"
                              strokeWidth={1.75}
                            />
                          ) : (
                            <Icon
                              className={`h-4 w-4 text-${config.color}-600 dark:text-${config.color}-400`}
                              strokeWidth={1.75}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isActive
                              ? 'text-[var(--accent)]'
                              : 'text-[var(--text-primary)]'
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {step.durationMinutes} phút
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Objectives */}
            {lesson.objectives && lesson.objectives.length > 0 && (
              <div className="p-4 border-t border-[var(--border-default)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" strokeWidth={1.75} />
                  Mục tiêu
                </h3>
                <ul className="space-y-2">
                  {lesson.objectives.map((obj, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800 text-xs flex-shrink-0">
                        {index + 1}
                      </span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Step Content Renderer
function StepContent({ step }: { step: LessonStep }) {
  switch (step.type) {
    case 'slide':
      if (step.slideDeck) {
        return (
          <div className="h-full">
            <SlideViewer deck={step.slideDeck} mode="teacher" />
          </div>
        );
      }
      return <EmptyStepContent message="Chưa có slide cho bước này" />;

    case 'flashcard':
      if (step.flashcardDeck) {
        return (
          <div className="h-full p-6">
            <FlashcardViewer deck={step.flashcardDeck} mode="preview" />
          </div>
        );
      }
      return <EmptyStepContent message="Chưa có flashcard cho bước này" />;

    case 'worksheet':
      if (step.worksheet) {
        return (
          <div className="h-full">
            <WorksheetViewer worksheet={step.worksheet} mode="preview" showAnswers={false} />
          </div>
        );
      }
      return <EmptyStepContent message="Chưa có bài tập cho bước này" />;

    case 'intro':
    case 'discussion':
    case 'summary':
    case 'homework':
      return (
        <div className="p-8 max-w-3xl mx-auto">
          {step.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                {step.type === 'intro' && 'Giới thiệu'}
                {step.type === 'discussion' && 'Câu hỏi thảo luận'}
                {step.type === 'summary' && 'Tổng kết'}
                {step.type === 'homework' && 'Bài về nhà'}
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {step.description.split('\n').map((line, i) => (
                  <p key={i} className="text-[var(--text-secondary)]">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {step.instructions && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Hướng dẫn
              </h4>
              <div className="space-y-2">
                {step.instructions.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-blue-700 dark:text-blue-300">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {step.notes && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Ghi chú cho giáo viên
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">{step.notes}</p>
            </div>
          )}
        </div>
      );

    case 'break':
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Coffee className="h-16 w-16 text-[var(--text-tertiary)] mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Nghỉ giải lao
          </h3>
          <p className="text-[var(--text-secondary)]">{step.durationMinutes} phút</p>
        </div>
      );

    case 'audio':
      if (step.audioUrl) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-full max-w-md">
              <audio controls className="w-full" src={step.audioUrl}>
                Your browser does not support the audio element.
              </audio>
              {step.audioText && (
                <div className="mt-4 p-4 bg-mono-100 dark:bg-mono-800 rounded-xl">
                  <p className="text-sm text-[var(--text-secondary)]">{step.audioText}</p>
                </div>
              )}
            </div>
          </div>
        );
      }
      return <EmptyStepContent message="Chưa có audio cho bước này" />;

    default:
      return <EmptyStepContent message="Không có nội dung" />;
  }
}

function EmptyStepContent({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mono-100 dark:bg-mono-800 mb-4">
        <FileText className="h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <p className="text-[var(--text-tertiary)]">{message}</p>
    </div>
  );
}

export default LessonPlayer;

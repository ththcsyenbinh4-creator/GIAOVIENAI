'use client';

/**
 * LessonBuilder Component
 *
 * A comprehensive lesson builder that allows teachers to create
 * a complete 45-minute teaching pack with slides, flashcards, worksheets, etc.
 */

import { useState } from 'react';
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
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Lesson,
  LessonStep,
  LessonStepType,
  LessonGenerateRequest,
} from '@/types/domain';
import { cn } from '@/lib/utils';

interface LessonBuilderProps {
  initialLesson?: Lesson;
  sourceContent?: string;
  onSave?: (lesson: Lesson) => void;
  onStartTeaching?: (lesson: Lesson) => void;
}

const STEP_TYPE_CONFIG: Record<
  LessonStepType,
  { icon: React.ElementType; label: string; color: string; defaultDuration: number }
> = {
  intro: { icon: BookOpen, label: 'Giới thiệu', color: 'blue', defaultDuration: 3 },
  slide: { icon: Presentation, label: 'Slide bài giảng', color: 'purple', defaultDuration: 15 },
  audio: { icon: MessageSquare, label: 'Audio giảng giải', color: 'pink', defaultDuration: 5 },
  flashcard: { icon: Brain, label: 'Flashcard ôn tập', color: 'orange', defaultDuration: 7 },
  worksheet: { icon: FileText, label: 'Bài tập', color: 'emerald', defaultDuration: 10 },
  discussion: { icon: MessageSquare, label: 'Thảo luận', color: 'cyan', defaultDuration: 5 },
  break: { icon: Coffee, label: 'Nghỉ giải lao', color: 'gray', defaultDuration: 5 },
  summary: { icon: CheckSquare, label: 'Tổng kết', color: 'green', defaultDuration: 3 },
  homework: { icon: Home, label: 'Bài về nhà', color: 'amber', defaultDuration: 2 },
};

const DEFAULT_STEPS: Array<{ type: LessonStepType; title: string; duration: number }> = [
  { type: 'intro', title: 'Giới thiệu bài học', duration: 3 },
  { type: 'slide', title: 'Nội dung chính', duration: 15 },
  { type: 'flashcard', title: 'Ôn tập kiến thức', duration: 7 },
  { type: 'worksheet', title: 'Bài tập thực hành', duration: 12 },
  { type: 'discussion', title: 'Thảo luận & Hỏi đáp', duration: 5 },
  { type: 'summary', title: 'Tổng kết bài học', duration: 3 },
];

export function LessonBuilder({
  initialLesson,
  sourceContent,
  onSave,
  onStartTeaching,
}: LessonBuilderProps) {
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [subject, setSubject] = useState(initialLesson?.subject || '');
  const [gradeLevel, setGradeLevel] = useState(initialLesson?.gradeLevel || '');
  const [objectives, setObjectives] = useState<string[]>(initialLesson?.objectives || []);
  const [steps, setSteps] = useState<Array<{ type: LessonStepType; title: string; duration: number }>>(
    initialLesson?.steps.map(s => ({
      type: s.type,
      title: s.title,
      duration: s.durationMinutes,
    })) || DEFAULT_STEPS
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(initialLesson || null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  const handleAddStep = (type: LessonStepType) => {
    const config = STEP_TYPE_CONFIG[type];
    setSteps([
      ...steps,
      {
        type,
        title: config.label,
        duration: config.defaultDuration,
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (index: number, updates: Partial<{ title: string; duration: number }>) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, ...updates } : step)));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài học');
      return;
    }

    setIsGenerating(true);

    try {
      const request: LessonGenerateRequest = {
        mode: sourceContent ? 'from-document' : 'from-scratch',
        title,
        subject: subject || undefined,
        gradeLevel: gradeLevel || undefined,
        content: sourceContent,
        targetDuration: totalDuration,
        includeSlides: steps.some(s => s.type === 'slide'),
        includeFlashcards: steps.some(s => s.type === 'flashcard'),
        includeWorksheet: steps.some(s => s.type === 'worksheet'),
        includeHomework: steps.some(s => s.type === 'homework'),
        objectives: objectives.filter(o => o.trim()),
        customSteps: steps,
      };

      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const { lesson } = await response.json();
      setGeneratedLesson(lesson);
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('Không thể tạo bài giảng. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
  };

  const handleUpdateObjective = (index: number, value: string) => {
    setObjectives(objectives.map((obj, i) => (i === index ? value : obj)));
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Tạo bài giảng 45 phút
            </h2>
            <p className="text-sm text-[var(--text-tertiary)]">
              Thiết kế trải nghiệm học tập hoàn chỉnh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mono-100 dark:bg-mono-800">
            <Clock className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {totalDuration} phút
            </span>
          </div>

          {generatedLesson && onStartTeaching && (
            <Button
              variant="primary"
              onClick={() => onStartTeaching(generatedLesson)}
              leftIcon={<Play className="h-4 w-4" strokeWidth={1.75} />}
            >
              Bắt đầu dạy
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Thông tin bài học</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Tiêu đề bài học *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Phân số - Toán lớp 4"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Môn học
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  <option value="">Chọn môn học</option>
                  <option value="Toán">Toán</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Vật lý">Vật lý</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Sinh học">Sinh học</option>
                  <option value="Lịch sử">Lịch sử</option>
                  <option value="Địa lý">Địa lý</option>
                  <option value="GDCD">GDCD</option>
                  <option value="Tin học">Tin học</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Cấp lớp
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  <option value="">Chọn cấp lớp</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <option key={grade} value={`Lớp ${grade}`}>
                      Lớp {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
              Tùy chọn nâng cao
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Mục tiêu bài học
                </label>
                <div className="space-y-2">
                  {objectives.map((obj, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => handleUpdateObjective(index, e.target.value)}
                        placeholder={`Mục tiêu ${index + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveObjective(index)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddObjective}
                    leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
                  >
                    Thêm mục tiêu
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Structure */}
          <div className="bg-white dark:bg-mono-900 rounded-xl border border-[var(--border-default)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Cấu trúc bài giảng</h3>
              <span className="text-sm text-[var(--text-tertiary)]">
                Kéo thả để sắp xếp
              </span>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const config = STEP_TYPE_CONFIG[step.type];
                const Icon = config.icon;
                const isExpanded = expandedStep === index;

                return (
                  <div
                    key={index}
                    className={cn(
                      'border rounded-xl overflow-hidden transition-all',
                      isExpanded
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[var(--border-default)]'
                    )}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <button className="cursor-grab text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                        <GripVertical className="h-5 w-5" strokeWidth={1.75} />
                      </button>

                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          `bg-${config.color}-100 dark:bg-${config.color}-900/30`
                        )}
                      >
                        <Icon
                          className={`h-5 w-5 text-${config.color}-600 dark:text-${config.color}-400`}
                          strokeWidth={1.75}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(index, { title: e.target.value })}
                          className="w-full font-medium text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
                        />
                        <p className="text-xs text-[var(--text-tertiary)]">{config.label}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-mono-100 dark:bg-mono-800">
                          <input
                            type="number"
                            value={step.duration}
                            onChange={(e) =>
                              handleUpdateStep(index, { duration: parseInt(e.target.value) || 1 })
                            }
                            min={1}
                            max={60}
                            className="w-8 text-center text-sm font-medium text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
                          />
                          <span className="text-xs text-[var(--text-tertiary)]">phút</span>
                        </div>

                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleMoveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveStep(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Step */}
            <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-secondary)] mb-3">Thêm hoạt động:</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STEP_TYPE_CONFIG) as LessonStepType[]).map((type) => {
                  const config = STEP_TYPE_CONFIG[type];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddStep(type)}
                      leftIcon={<Icon className="h-4 w-4" strokeWidth={1.75} />}
                    >
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !title.trim()}
              leftIcon={
                isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Sparkles className="h-5 w-5" strokeWidth={1.75} />
                )
              }
              className="min-w-[200px]"
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo bài giảng với AI'}
            </Button>
          </div>

          {/* Generated Lesson Preview */}
          {generatedLesson && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Bài giảng đã được tạo!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {generatedLesson.steps.length} hoạt động • {generatedLesson.totalDurationMinutes} phút
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {generatedLesson.steps.map((step, index) => {
                  const config = STEP_TYPE_CONFIG[step.type];
                  const Icon = config.icon;
                  const hasContent =
                    step.slideDeck ||
                    step.flashcardDeck ||
                    step.worksheet ||
                    step.description;

                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-mono-900 rounded-lg"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800 text-xs font-medium">
                        {index + 1}
                      </span>
                      <Icon className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                      <span className="flex-1 text-sm text-[var(--text-primary)]">{step.title}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {step.durationMinutes} phút
                      </span>
                      {hasContent && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                          Có nội dung
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                {onSave && (
                  <Button variant="secondary" onClick={() => onSave(generatedLesson)}>
                    Lưu bài giảng
                  </Button>
                )}
                {onStartTeaching && (
                  <Button
                    variant="primary"
                    onClick={() => onStartTeaching(generatedLesson)}
                    leftIcon={<Play className="h-4 w-4" strokeWidth={1.75} />}
                  >
                    Bắt đầu dạy ngay
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LessonBuilder;

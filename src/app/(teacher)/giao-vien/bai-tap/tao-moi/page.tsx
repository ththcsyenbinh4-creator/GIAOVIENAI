'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  GripVertical,
  Check,
  Clock,
  Calendar,
  HelpCircle,
  FileText,
  Settings,
  Save,
  Send,
  Loader2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import {
  createAssignment,
  updateAssignment,
  fetchAssignmentDetail,
  generateQuestions,
} from '@/lib/apiClient';
import {
  CreateAssignmentPayload,
  AssignmentType,
  QuestionType,
  GeneratedQuestion,
} from '@/types/domain';
import { useToast } from '@/components/ui/toast';
import { DocumentUploadModal } from '@/components/document-ai/DocumentUploadModal';
import { GeneratedQuestion as AIGeneratedQuestion } from '@/types/domain';

// Local question type for form
interface LocalQuestion {
  id: string;
  type: 'mcq' | 'essay';
  content: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctAnswerIndex: number | null;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'manual' | 'ai';
}

// Mock data for classes (later: fetch from API)
const mockClasses = [
  { id: 'class-8a', name: 'Lớp 8A', studentCount: 35 },
  { id: 'class-8b', name: 'Lớp 8B', studentCount: 32 },
  { id: 'class-9a', name: 'Lớp 9A', studentCount: 38 },
];

const difficultyLabels = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const difficultyColors = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
} as const;

export default function CreateAssignmentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin mb-4" strokeWidth={1.75} />
        <p className="text-[var(--text-tertiary)]">Đang tải...</p>
      </div>
    }>
      <CreateAssignmentContent />
    </Suspense>
  );
}

function CreateAssignmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    type: 'homework' as AssignmentType,
    duration: '',
    deadline: '',
    deadlineTime: '23:59',
    isRandomizeQuestions: true,
    isRandomizeOptions: true,
    showAnswersAfterSubmit: true,
    maxAttempts: 1,
  });

  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<LocalQuestion | null>(null);

  // AI generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Load existing assignment if editing
  useEffect(() => {
    if (editId) {
      loadAssignment(editId);
    }
  }, [editId]);

  const loadAssignment = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAssignmentDetail(id);
      if (response.success && response.data) {
        const assignment = response.data;
        setFormData({
          title: assignment.title,
          description: assignment.description || '',
          classId: assignment.classId,
          type: assignment.type,
          duration: assignment.durationMinutes?.toString() || '',
          deadline: assignment.dueAt ? assignment.dueAt.split('T')[0] : '',
          deadlineTime: assignment.dueAt
            ? assignment.dueAt.split('T')[1]?.substring(0, 5) || '23:59'
            : '23:59',
          isRandomizeQuestions: assignment.settings.shuffleQuestions,
          isRandomizeOptions: assignment.settings.shuffleAnswers,
          showAnswersAfterSubmit: assignment.settings.showCorrectAfterSubmit,
          maxAttempts: assignment.settings.maxAttempts || -1,
        });

        // Convert API questions to local format
        const localQuestions: LocalQuestion[] = assignment.questions.map((q) => ({
          id: q.id,
          type: q.type,
          content: q.prompt,
          options:
            q.choices?.map((choice, idx) => ({
              id: String.fromCharCode(97 + idx),
              text: choice,
              isCorrect: idx === q.correctAnswerIndex,
            })) || [],
          correctAnswerIndex: q.correctAnswerIndex ?? null,
          explanation: '',
          points: q.maxScore,
          difficulty: 'medium',
          source: q.source,
        }));
        setQuestions(localQuestions);
      } else {
        setError('Không thể tải bài tập');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải bài tập');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const isStep1Valid = formData.title && formData.classId && formData.type;
  const isStep2Valid = questions.length > 0;

  // Handlers
  const handleAddQuestion = () => {
    const newQuestion: LocalQuestion = {
      id: `q-${Date.now()}`,
      type: 'mcq',
      content: '',
      options: [
        { id: 'a', text: '', isCorrect: true },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
        { id: 'd', text: '', isCorrect: false },
      ],
      correctAnswerIndex: 0,
      explanation: '',
      points: 1,
      difficulty: 'medium',
      source: 'manual',
    };
    setEditingQuestion(newQuestion);
  };

  const handleAddEssayQuestion = () => {
    const newQuestion: LocalQuestion = {
      id: `q-${Date.now()}`,
      type: 'essay',
      content: '',
      options: [],
      correctAnswerIndex: null,
      explanation: '',
      points: 5,
      difficulty: 'medium',
      source: 'manual',
    };
    setEditingQuestion(newQuestion);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    const existingIndex = questions.findIndex((q) => q.id === editingQuestion.id);
    if (existingIndex >= 0) {
      const newQuestions = [...questions];
      newQuestions[existingIndex] = editingQuestion;
      setQuestions(newQuestions);
    } else {
      setQuestions([...questions, editingQuestion]);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleEditQuestion = (question: LocalQuestion) => {
    setEditingQuestion({ ...question });
  };

  const handleDocumentQuestionsGenerated = (generatedQuestions: AIGeneratedQuestion[]) => {
    // Convert AI-generated questions to local format
    const newQuestions: LocalQuestion[] = generatedQuestions.map(
      (q, idx) => ({
        id: `doc-q-${Date.now()}-${idx}`,
        type: q.type,
        content: q.prompt,
        options:
          q.choices?.map((choice, i) => ({
            id: String.fromCharCode(97 + i),
            text: choice,
            isCorrect: i === q.correctAnswerIndex,
          })) || [],
        correctAnswerIndex: q.correctAnswerIndex ?? null,
        explanation: '',
        points: q.maxScore,
        difficulty: 'medium' as const,
        source: 'ai' as const,
      })
    );

    setQuestions([...questions, ...newQuestions]);
    setShowDocumentModal(false);
    showToast('success', 'Đã tạo câu hỏi từ tài liệu', `${newQuestions.length} câu hỏi đã được tạo`);
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateQuestions({
        topic: aiPrompt,
        difficulty: aiDifficulty,
        numberOfQuestions: aiQuestionCount,
        questionType: 'mixed',
      });

      if (response.success && response.data?.questions) {
        // Convert API questions to local format
        const newQuestions: LocalQuestion[] = response.data.questions.map(
          (q: GeneratedQuestion, idx: number) => ({
            id: `ai-q-${Date.now()}-${idx}`,
            type: q.type,
            content: q.prompt,
            options:
              q.choices?.map((choice, i) => ({
                id: String.fromCharCode(97 + i),
                text: choice,
                isCorrect: i === q.correctAnswerIndex,
              })) || [],
            correctAnswerIndex: q.correctAnswerIndex ?? null,
            explanation: '',
            points: q.maxScore,
            difficulty: aiDifficulty,
            source: 'ai' as const,
          })
        );

        setQuestions([...questions, ...newQuestions]);
        setShowAIModal(false);
        setAiPrompt('');
        showToast('success', 'Đã tạo câu hỏi', `${newQuestions.length} câu hỏi đã được tạo bởi AI`);
      } else {
        showToast('error', 'Lỗi', response.error || 'Không thể tạo câu hỏi');
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Đã xảy ra lỗi khi tạo câu hỏi');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build deadline ISO string
      let dueAt: string | null = null;
      if (formData.deadline) {
        dueAt = `${formData.deadline}T${formData.deadlineTime}:00Z`;
      }

      // Convert local questions to API format
      const apiQuestions = questions.map((q, idx) => ({
        order: idx + 1,
        type: q.type as QuestionType,
        prompt: q.content,
        choices: q.type === 'mcq' ? q.options.map((o) => o.text) : undefined,
        correctAnswerIndex:
          q.type === 'mcq' ? q.options.findIndex((o) => o.isCorrect) : undefined,
        maxScore: q.points,
        source: q.source,
      }));

      const payload: CreateAssignmentPayload = {
        title: formData.title,
        description: formData.description || undefined,
        classId: formData.classId,
        type: formData.type,
        status: publish ? 'published' : 'draft',
        durationMinutes: formData.duration ? parseInt(formData.duration) : null,
        dueAt,
        settings: {
          shuffleQuestions: formData.isRandomizeQuestions,
          shuffleAnswers: formData.isRandomizeOptions,
          showCorrectAfterSubmit: formData.showAnswersAfterSubmit,
          maxAttempts: formData.maxAttempts === -1 ? null : formData.maxAttempts,
        },
        questions: apiQuestions,
      };

      let response;
      if (editId) {
        // Update existing assignment
        response = await updateAssignment(editId, {
          title: payload.title,
          description: payload.description,
          type: payload.type,
          status: payload.status,
          durationMinutes: payload.durationMinutes,
          dueAt: payload.dueAt,
          settings: payload.settings,
        });
      } else {
        // Create new assignment
        response = await createAssignment(payload);
      }

      if (response.success) {
        const message = editId
          ? 'Bài tập đã được cập nhật'
          : publish
          ? 'Bài tập đã được tạo và phát cho học sinh'
          : 'Bài tập đã được lưu dưới dạng nháp';
        showToast('success', editId ? 'Cập nhật thành công!' : 'Tạo bài tập thành công!', message);
        router.push('/giao-vien/bai-tap');
      } else {
        showToast('error', 'Lỗi', response.error || 'Không thể lưu bài tập');
      }
    } catch (err) {
      showToast('error', 'Lỗi', 'Đã xảy ra lỗi khi lưu bài tập');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin mb-4" strokeWidth={1.75} />
        <p className="text-[var(--text-tertiary)]">Đang tải bài tập...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/giao-vien/bai-tap">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {editId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Bước {currentStep} / 3</p>
        </div>
      </div>

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

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex-1 flex items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                currentStep >= step
                  ? 'bg-mono-900 dark:bg-mono-100 text-white dark:text-[var(--text-primary)]'
                  : 'bg-mono-200 dark:bg-mono-700 text-[var(--text-tertiary)]'
              )}
            >
              {currentStep > step ? (
                <Check className="h-4 w-4" strokeWidth={2} />
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded-full transition-colors',
                  currentStep > step ? 'bg-mono-900 dark:bg-mono-100' : 'bg-mono-200 dark:bg-mono-700'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Tên bài tập *"
              placeholder="VD: Bài kiểm tra Chương 3"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Mô tả"
              placeholder="Mô tả ngắn về bài tập..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Lớp học *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {mockClasses.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, classId: cls.id })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.classId === cls.id
                        ? 'border-[var(--accent)] bg-mono-100 dark:bg-mono-800'
                        : 'border-[var(--border-default)] hover:border-[var(--accent)]/30'
                    )}
                  >
                    <p className="font-medium text-[var(--text-primary)]">{cls.name}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{cls.studentCount} học sinh</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Loại bài *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'homework', label: 'Bài tập', desc: 'Không giới hạn thời gian' },
                  { value: 'quiz', label: 'Kiểm tra', desc: 'Có giới hạn thời gian' },
                  { value: 'test', label: 'Thi', desc: 'Kiểm tra quan trọng' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: type.value as AssignmentType })
                    }
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.type === type.value
                        ? 'border-[var(--accent)] bg-mono-100 dark:bg-mono-800'
                        : 'border-[var(--border-default)] hover:border-[var(--accent)]/30'
                    )}
                  >
                    <p className="font-medium text-[var(--text-primary)]">{type.label}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(formData.type === 'quiz' || formData.type === 'test') && (
                <Input
                  type="number"
                  label="Thời gian làm bài (phút)"
                  placeholder="45"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  leftIcon={<Clock className="h-5 w-5" strokeWidth={1.75} />}
                />
              )}

              <Input
                type="date"
                label="Hạn nộp"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                leftIcon={<Calendar className="h-5 w-5" strokeWidth={1.75} />}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleAddQuestion}
              leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}
            >
              Thêm trắc nghiệm
            </Button>
            <Button
              variant="secondary"
              onClick={handleAddEssayQuestion}
              leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}
            >
              Thêm tự luận
            </Button>
            <Button
              onClick={() => setShowAIModal(true)}
              leftIcon={<Sparkles className="h-5 w-5" strokeWidth={1.75} />}
            >
              AI tạo câu hỏi
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDocumentModal(true)}
              leftIcon={<Upload className="h-5 w-5" strokeWidth={1.75} />}
            >
              Tải tài liệu
            </Button>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                <p className="text-[var(--text-secondary)] mb-4">Chưa có câu hỏi nào</p>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={handleAddQuestion}>
                    Thêm thủ công
                  </Button>
                  <Button onClick={() => setShowAIModal(true)}>
                    AI tạo câu hỏi
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <Card key={question.id} padding="md" className="group">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                      <GripVertical className="h-5 w-5 cursor-grab" strokeWidth={1.75} />
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] line-clamp-2">
                        {question.content || '(Chưa có nội dung)'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={question.type === 'essay' ? 'primary' : 'default'}>
                          {question.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                        </Badge>
                        <Badge variant={difficultyColors[question.difficulty]}>
                          {difficultyLabels[question.difficulty]}
                        </Badge>
                        {question.source === 'ai' && (
                          <Badge
                            variant="primary"
                            icon={<Sparkles className="h-3 w-3" strokeWidth={1.75} />}
                          >
                            AI
                          </Badge>
                        )}
                        <span className="text-xs text-[var(--text-tertiary)]">{question.points} điểm</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <FileText className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Summary */}
              <Card className="bg-[var(--bg-soft)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      Tổng cộng: {questions.length} câu hỏi
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Trắc nghiệm: {questions.filter((q) => q.type === 'mcq').length} • Tự
                      luận: {questions.filter((q) => q.type === 'essay').length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-mono-600 dark:text-mono-400">{totalPoints}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">tổng điểm</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Settings */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
              Cài đặt bài tập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  key: 'isRandomizeQuestions',
                  label: 'Xáo trộn thứ tự câu hỏi',
                  desc: 'Mỗi học sinh nhận thứ tự câu hỏi khác nhau',
                },
                {
                  key: 'isRandomizeOptions',
                  label: 'Xáo trộn đáp án trắc nghiệm',
                  desc: 'Thứ tự đáp án A, B, C, D khác nhau mỗi lượt',
                },
                {
                  key: 'showAnswersAfterSubmit',
                  label: 'Hiện đáp án sau khi nộp',
                  desc: 'Học sinh xem được lời giải sau khi hoàn thành',
                },
              ].map((setting) => (
                <label
                  key={setting.key}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-soft)]"
                >
                  <input
                    type="checkbox"
                    checked={formData[setting.key as keyof typeof formData] as boolean}
                    onChange={(e) =>
                      setFormData({ ...formData, [setting.key]: e.target.checked })
                    }
                    className="mt-1 h-5 w-5 rounded border-[var(--border-default)] text-mono-600 dark:text-mono-400 focus:ring-mono-400"
                  />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{setting.label}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{setting.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Số lần làm bài tối đa
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 'unlimited'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        maxAttempts: value === 'unlimited' ? -1 : (value as number),
                      })
                    }
                    className={cn(
                      'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                      formData.maxAttempts === (value === 'unlimited' ? -1 : value)
                        ? 'border-mono-400 dark:border-mono-500 bg-mono-900 dark:bg-mono-100/5 text-mono-600 dark:text-mono-400'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-mono-400 dark:border-mono-500/30'
                    )}
                  >
                    {value === 'unlimited' ? 'Không giới hạn' : `${value} lần`}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-mono-900 dark:bg-mono-100/5 border-mono-400 dark:border-mono-500/20">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Tóm tắt bài tập</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-tertiary)]">Tên bài</p>
                  <p className="font-medium text-[var(--text-primary)]">{formData.title || '—'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Lớp</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {mockClasses.find((c) => c.id === formData.classId)?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Số câu hỏi</p>
                  <p className="font-medium text-[var(--text-primary)]">{questions.length} câu</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Tổng điểm</p>
                  <p className="font-medium text-[var(--text-primary)]">{totalPoints} điểm</p>
                </div>
                {formData.duration && (
                  <div>
                    <p className="text-[var(--text-tertiary)]">Thời gian</p>
                    <p className="font-medium text-[var(--text-primary)]">{formData.duration} phút</p>
                  </div>
                )}
                {formData.deadline && (
                  <div>
                    <p className="text-[var(--text-tertiary)]">Hạn nộp</p>
                    <p className="font-medium text-[var(--text-primary)]">{formData.deadline}</p>
                  </div>
                )}
              </div>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-default)] p-4 md:left-72">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            leftIcon={<ChevronLeft className="h-5 w-5" strokeWidth={1.75} />}
          >
            Quay lại
          </Button>

          <div className="flex gap-3">
            {currentStep === 3 ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit(false)}
                  isLoading={isSubmitting}
                  leftIcon={<Save className="h-5 w-5" strokeWidth={1.75} />}
                >
                  Lưu nháp
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  isLoading={isSubmitting}
                  leftIcon={<Send className="h-5 w-5" strokeWidth={1.75} />}
                >
                  Phát bài
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                rightIcon={<ChevronRight className="h-5 w-5" strokeWidth={1.75} />}
              >
                Tiếp tục
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Question Editor Modal */}
      <Modal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        title={editingQuestion?.content ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        size="lg"
      >
        {editingQuestion && (
          <div className="space-y-6">
            <Textarea
              label="Nội dung câu hỏi *"
              placeholder="Nhập câu hỏi..."
              value={editingQuestion.content}
              onChange={(e) =>
                setEditingQuestion({ ...editingQuestion, content: e.target.value })
              }
              className="min-h-[100px]"
            />

            {editingQuestion.type === 'mcq' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Đáp án (chọn đáp án đúng)
                </label>
                <div className="space-y-3">
                  {editingQuestion.options.map((option, idx) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = editingQuestion.options.map((o) => ({
                            ...o,
                            isCorrect: o.id === option.id,
                          }));
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions,
                            correctAnswerIndex: idx,
                          });
                        }}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                          option.isCorrect
                            ? 'border-success bg-success text-white'
                            : 'border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-success'
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>
                      <Input
                        placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[idx] = { ...option, text: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: newOptions });
                        }}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editingQuestion.type === 'essay' && (
              <Textarea
                label="Đáp án mẫu / Rubric"
                placeholder="Nhập đáp án mẫu hoặc tiêu chí chấm điểm..."
                value={editingQuestion.explanation}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                }
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Điểm
                </label>
                <Input
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      points: Number(e.target.value),
                    })
                  }
                  min={0.5}
                  step={0.5}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Độ khó
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() =>
                        setEditingQuestion({ ...editingQuestion, difficulty: diff })
                      }
                      className={cn(
                        'flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                        editingQuestion.difficulty === diff
                          ? 'border-mono-400 dark:border-mono-500 bg-mono-900 dark:bg-mono-100/5 text-mono-600 dark:text-mono-400'
                          : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-mono-400 dark:border-mono-500/30'
                      )}
                    >
                      {difficultyLabels[diff]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setEditingQuestion(null)}>
                Hủy
              </Button>
              <Button onClick={handleSaveQuestion} disabled={!editingQuestion.content}>
                Lưu câu hỏi
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* AI Generation Modal */}
      <Modal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="AI tạo câu hỏi"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-mono-900 dark:bg-mono-100/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800">
              <Sparkles className="h-6 w-6 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Tạo câu hỏi bằng AI</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Nhập chủ đề, AI sẽ tự động tạo câu hỏi phù hợp
              </p>
            </div>
          </div>

          <Textarea
            label="Chủ đề / Nội dung *"
            placeholder="VD: Hàm số bậc nhất y = ax + b, tính chất đồng biến nghịch biến..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Số câu hỏi
              </label>
              <div className="flex gap-2">
                {[3, 5, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setAiQuestionCount(count)}
                    className={cn(
                      'flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                      aiQuestionCount === count
                        ? 'border-mono-400 dark:border-mono-500 bg-mono-900 dark:bg-mono-100/5 text-mono-600 dark:text-mono-400'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-mono-400 dark:border-mono-500/30'
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Độ khó
              </label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setAiDifficulty(diff)}
                    className={cn(
                      'flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                      aiDifficulty === diff
                        ? 'border-mono-400 dark:border-mono-500 bg-mono-900 dark:bg-mono-100/5 text-mono-600 dark:text-mono-400'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-mono-400 dark:border-mono-500/30'
                    )}
                  >
                    {difficultyLabels[diff]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAIModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAIGenerate}
              disabled={!aiPrompt}
              isLoading={isGenerating}
              leftIcon={<Sparkles className="h-5 w-5" strokeWidth={1.75} />}
            >
              Tạo câu hỏi
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onQuestionsGenerated={handleDocumentQuestionsGenerated}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Eye,
  Send,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Shuffle,
  ListOrdered,
  Printer,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { PrintExamModal } from '@/components/print/PrintExamModal';
import { cn } from '@/lib/utils';
import { AssignmentDetail } from '@/types/domain';

// Mock data for preview (UI display format)
const mockAssignmentPreview = {
  id: 'assignment-1',
  title: 'Bài kiểm tra Chương 3: Hàm số',
  description: 'Kiểm tra kiến thức về hàm số bậc nhất và đồ thị',
  type: 'exam',
  duration: 45,
  totalPoints: 10,
  classId: 'class-1',
  className: 'Lớp 8A',
  status: 'draft',
  questions: [
    {
      id: 'q1',
      type: 'single',
      content: 'Hàm số y = 2x + 1 có đồ thị đi qua điểm nào sau đây?',
      points: 0.5,
      options: [
        { id: 'a', content: '(0, 1)', isCorrect: true },
        { id: 'b', content: '(1, 0)', isCorrect: false },
        { id: 'c', content: '(0, 2)', isCorrect: false },
        { id: 'd', content: '(2, 0)', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      type: 'single',
      content: 'Cho hàm số y = ax + b. Nếu a > 0 thì đồ thị hàm số:',
      points: 0.5,
      options: [
        { id: 'a', content: 'Đi lên từ trái sang phải', isCorrect: true },
        { id: 'b', content: 'Đi xuống từ trái sang phải', isCorrect: false },
        { id: 'c', content: 'Song song với trục Ox', isCorrect: false },
        { id: 'd', content: 'Song song với trục Oy', isCorrect: false },
      ],
    },
    {
      id: 'q3',
      type: 'multiple',
      content: 'Chọn tất cả các điểm thuộc đồ thị hàm số y = -x + 3:',
      points: 1,
      options: [
        { id: 'a', content: '(0, 3)', isCorrect: true },
        { id: 'b', content: '(3, 0)', isCorrect: true },
        { id: 'c', content: '(1, 2)', isCorrect: true },
        { id: 'd', content: '(2, 2)', isCorrect: false },
      ],
    },
    {
      id: 'q4',
      type: 'single',
      content: 'Hai đường thẳng y = 2x + 1 và y = 2x - 3 có quan hệ như thế nào?',
      points: 0.5,
      options: [
        { id: 'a', content: 'Cắt nhau tại một điểm', isCorrect: false },
        { id: 'b', content: 'Song song với nhau', isCorrect: true },
        { id: 'c', content: 'Trùng nhau', isCorrect: false },
        { id: 'd', content: 'Vuông góc với nhau', isCorrect: false },
      ],
    },
    {
      id: 'q5',
      type: 'essay',
      content: 'Cho hàm số y = 2x - 4.\n\na) Vẽ đồ thị hàm số trên mặt phẳng tọa độ Oxy.\n\nb) Tìm tọa độ giao điểm của đồ thị với trục Ox và trục Oy.\n\nc) Tính diện tích tam giác tạo bởi đồ thị hàm số với hai trục tọa độ.',
      points: 3,
      rubric: [
        'a) Vẽ đúng đồ thị: 1 điểm',
        'b) Tìm đúng giao điểm với Ox (2, 0) và Oy (0, -4): 1 điểm',
        'c) Tính đúng diện tích S = 4: 1 điểm',
      ],
    },
    {
      id: 'q6',
      type: 'single',
      content: 'Hệ số góc của đường thẳng y = -3x + 5 là:',
      points: 0.5,
      options: [
        { id: 'a', content: '3', isCorrect: false },
        { id: 'b', content: '-3', isCorrect: true },
        { id: 'c', content: '5', isCorrect: false },
        { id: 'd', content: '-5', isCorrect: false },
      ],
    },
    {
      id: 'q7',
      type: 'essay',
      content: 'Tìm phương trình đường thẳng đi qua hai điểm A(1, 2) và B(3, 6). Giải thích các bước làm.',
      points: 2,
      rubric: [
        'Tính hệ số góc a = (6-2)/(3-1) = 2: 0.5 điểm',
        'Tìm b từ điểm A: 2 = 2×1 + b → b = 0: 0.5 điểm',
        'Viết phương trình y = 2x: 0.5 điểm',
        'Giải thích rõ ràng: 0.5 điểm',
      ],
    },
    {
      id: 'q8',
      type: 'multiple',
      content: 'Đường thẳng y = x + 2 cắt trục tọa độ tại những điểm nào?',
      points: 1,
      options: [
        { id: 'a', content: '(0, 2)', isCorrect: true },
        { id: 'b', content: '(-2, 0)', isCorrect: true },
        { id: 'c', content: '(2, 0)', isCorrect: false },
        { id: 'd', content: '(0, -2)', isCorrect: false },
      ],
    },
  ],
};

// Convert preview format to domain format for PrintExamModal
function convertToAssignmentDetail(preview: typeof mockAssignmentPreview): AssignmentDetail {
  return {
    id: preview.id,
    title: preview.title,
    description: preview.description,
    classId: preview.classId,
    className: preview.className,
    type: preview.type === 'exam' ? 'test' : preview.type === 'quiz' ? 'quiz' : 'homework',
    status: preview.status === 'draft' ? 'draft' : 'published',
    durationMinutes: preview.duration,
    dueAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      shuffleQuestions: true,
      shuffleAnswers: true,
      showCorrectAfterSubmit: false,
      maxAttempts: 1,
    },
    questions: preview.questions.map((q, idx) => ({
      id: q.id,
      assignmentId: preview.id,
      order: idx + 1,
      type: q.type === 'essay' ? 'essay' : 'mcq',
      prompt: q.content,
      choices: q.options?.map(opt => opt.content),
      correctAnswerIndex: q.options?.findIndex(opt => opt.isCorrect) ?? null,
      maxScore: q.points,
      source: 'manual' as const,
    })),
  };
}

const typeLabels = {
  homework: 'Bài tập',
  quiz: 'Kiểm tra nhanh',
  exam: 'Bài kiểm tra',
};

const questionTypeLabels = {
  single: 'Trắc nghiệm đơn',
  multiple: 'Trắc nghiệm nhiều đáp án',
  essay: 'Tự luận',
};

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sequential' | 'shuffled'>('sequential');

  const assignment = mockAssignmentPreview;
  const questions = assignment.questions;
  const assignmentDetail = convertToAssignmentDetail(assignment);
  const question = questions[currentQuestion];

  // Calculate stats
  const multipleChoiceCount = questions.filter((q) => q.type !== 'essay').length;
  const essayCount = questions.filter((q) => q.type === 'essay').length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const handlePublish = async () => {
    setIsPublishing(true);
    // PHASE 2: Call publishAssignment API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPublishing(false);
    setShowPublishModal(false);
    router.push('/giao-vien/bai-tap');
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/giao-vien/bai-tap`}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Quay lại</span>
              </Link>
              <div className="h-6 w-px bg-mono-200 dark:bg-mono-700" />
              <div>
                <h1 className="font-semibold text-[var(--text-primary)] line-clamp-1">
                  {assignment.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                  <Badge variant="warning">
                    {typeLabels[assignment.type as keyof typeof typeLabels]}
                  </Badge>
                  <span>•</span>
                  <span>{assignment.className}</span>
                  <span>•</span>
                  <span>{assignment.duration} phút</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-mono-100 dark:bg-mono-800 rounded-xl">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'desktop'
                      ? 'bg-white shadow-sm text-mono-600 dark:text-mono-400'
                      : 'text-[var(--text-tertiary)] hover:text-gray-700'
                  )}
                >
                  <Monitor className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'mobile'
                      ? 'bg-white shadow-sm text-mono-600 dark:text-mono-400'
                      : 'text-[var(--text-tertiary)] hover:text-gray-700'
                  )}
                >
                  <Smartphone className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              {/* Show Answers Toggle */}
              <Button
                variant={showAnswers ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
                leftIcon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
              >
                <span className="hidden sm:inline">
                  {showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
                </span>
              </Button>

              {/* Print Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPrintModal(true)}
                leftIcon={<Printer className="h-4 w-4" strokeWidth={1.75} />}
              >
                <span className="hidden sm:inline">In đề</span>
              </Button>

              <Link href={`/giao-vien/bai-tap/tao-moi?edit=${params.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit className="h-4 w-4" strokeWidth={1.75} />}
                >
                  <span className="hidden sm:inline">Chỉnh sửa</span>
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={() => setShowPublishModal(true)}
                leftIcon={<Send className="h-4 w-4" strokeWidth={1.75} />}
              >
                Giao bài
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Question Navigator */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24">
              {/* Stats */}
              <div className="mb-4 pb-4 border-b border-[var(--border-default)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Thống kê</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tổng câu hỏi:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Trắc nghiệm:</span>
                    <span className="font-medium">{multipleChoiceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tự luận:</span>
                    <span className="font-medium">{essayCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tổng điểm:</span>
                    <span className="font-medium text-mono-600 dark:text-mono-400">{totalPoints}</span>
                  </div>
                </div>
              </div>

              {/* Preview Mode */}
              <div className="mb-4 pb-4 border-b border-[var(--border-default)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Chế độ xem</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setPreviewMode('sequential')}
                    className={cn(
                      'flex items-center gap-2 w-full p-2 rounded-xl text-sm transition-colors',
                      previewMode === 'sequential'
                        ? 'bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400'
                        : 'hover:bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)]'
                    )}
                  >
                    <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
                    Theo thứ tự
                  </button>
                  <button
                    onClick={() => setPreviewMode('shuffled')}
                    className={cn(
                      'flex items-center gap-2 w-full p-2 rounded-xl text-sm transition-colors',
                      previewMode === 'shuffled'
                        ? 'bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400'
                        : 'hover:bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)]'
                    )}
                  >
                    <Shuffle className="h-4 w-4" strokeWidth={1.75} />
                    Xem trộn đề
                  </button>
                </div>
              </div>

              {/* Question List */}
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Danh sách câu hỏi</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        'aspect-square rounded-xl text-sm font-medium transition-all',
                        index === currentQuestion
                          ? 'bg-mono-900 dark:bg-mono-100 text-white shadow-sm'
                          : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:bg-mono-700',
                        q.type === 'essay' && 'ring-2 ring-warning ring-offset-1'
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm ring-2 ring-warning" />
                    <span>Tự luận</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Question Preview */}
          <div className="flex-1 min-w-0">
            {/* Mobile Question Navigator */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">
                  Câu {currentQuestion + 1}/{questions.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewMode('sequential')}
                    className={cn(
                      'p-2 rounded-lg',
                      previewMode === 'sequential' ? 'bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400' : 'text-[var(--text-tertiary)]'
                    )}
                  >
                    <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('shuffled')}
                    className={cn(
                      'p-2 rounded-lg',
                      previewMode === 'shuffled' ? 'bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400' : 'text-[var(--text-tertiary)]'
                    )}
                  >
                    <Shuffle className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-xl text-sm font-medium transition-all',
                      index === currentQuestion
                        ? 'bg-mono-900 dark:bg-mono-100 text-white'
                        : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)]',
                      q.type === 'essay' && 'ring-2 ring-warning ring-offset-1'
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div
              className={cn(
                'mx-auto transition-all duration-300',
                viewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              )}
            >
              <Card className="mb-4">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default">
                        Câu {currentQuestion + 1}
                      </Badge>
                      <Badge
                        variant={question.type === 'essay' ? 'warning' : 'primary'}
                      >
                        {questionTypeLabels[question.type as keyof typeof questionTypeLabels]}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)]">{question.points} điểm</p>
                  </div>
                </div>

                {/* Question Content */}
                <div className="mb-6">
                  <p className="text-[var(--text-primary)] whitespace-pre-line">{question.content}</p>
                </div>

                {/* Options (for multiple choice) */}
                {question.type !== 'essay' && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={option.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-xl border-2 transition-colors',
                          showAnswers && option.isCorrect
                            ? 'border-success bg-success/5'
                            : 'border-[var(--border-default)] hover:border-gray-300'
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium',
                            showAnswers && option.isCorrect
                              ? 'border-success bg-success text-white'
                              : 'border-gray-300 text-[var(--text-tertiary)]'
                          )}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span className="flex-1 text-gray-700">{option.content}</span>
                        {showAnswers && option.isCorrect && (
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" strokeWidth={1.75} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Essay Answer Area */}
                {question.type === 'essay' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-soft)] border-2 border-dashed border-[var(--border-default)]">
                      <p className="text-[var(--text-tertiary)] text-sm text-center">
                        Học sinh sẽ nhập câu trả lời tại đây
                      </p>
                    </div>

                    {/* Rubric */}
                    {showAnswers && question.rubric && (
                      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                        <h4 className="font-medium text-success mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" strokeWidth={1.75} />
                          Rubric chấm điểm
                        </h4>
                        <ul className="space-y-1">
                          {question.rubric.map((item, index) => (
                            <li key={index} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                  leftIcon={<ChevronLeft className="h-5 w-5" strokeWidth={1.75} />}
                >
                  Câu trước
                </Button>

                <span className="text-sm text-[var(--text-tertiary)]">
                  {currentQuestion + 1} / {questions.length}
                </span>

                <Button
                  variant="secondary"
                  onClick={() => goToQuestion(currentQuestion + 1)}
                  disabled={currentQuestion === questions.length - 1}
                  rightIcon={<ChevronRight className="h-5 w-5" strokeWidth={1.75} />}
                >
                  Câu sau
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Giao bài cho học sinh"
        size="md"
      >
        <div className="py-4">
          <div className="p-4 rounded-xl bg-[var(--bg-soft)] mb-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{assignment.title}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
                {assignment.duration} phút
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" strokeWidth={1.75} />
                {questions.length} câu hỏi
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" strokeWidth={1.75} />
                {totalPoints} điểm
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-mono-900 dark:bg-mono-100/5">
              <span className="text-sm text-[var(--text-secondary)]">Lớp được giao</span>
              <Badge variant="primary">{assignment.className}</Badge>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/5">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="text-sm">
                <p className="font-medium text-warning">Lưu ý quan trọng</p>
                <p className="text-[var(--text-secondary)] mt-1">
                  Sau khi giao bài, học sinh sẽ có thể làm bài ngay lập tức.
                  Bạn không thể chỉnh sửa nội dung câu hỏi sau khi đã có học sinh nộp bài.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
            Hủy
          </Button>
          <Button
            onClick={handlePublish}
            isLoading={isPublishing}
            leftIcon={<Send className="h-5 w-5" strokeWidth={1.75} />}
          >
            Xác nhận giao bài
          </Button>
        </ModalFooter>
      </Modal>

      {/* Print Exam Modal */}
      <PrintExamModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        assignment={assignmentDetail}
      />
    </div>
  );
}

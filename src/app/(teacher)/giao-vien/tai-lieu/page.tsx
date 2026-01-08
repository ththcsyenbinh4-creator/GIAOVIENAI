'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  File,
  Image,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Download,
  Eye,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  X,
  ChevronRight,
  List,
  Target,
  Lightbulb,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/header';
import { ProgressBar } from '@/components/ui/progress';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';

// Mock data
const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Bài 5 - Hàm số bậc nhất',
    fileName: 'bai-5-ham-so-bac-nhat.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    uploadedAt: '2024-12-10T10:00:00',
    status: 'completed' as const,
    className: 'Lớp 8A',
    aiSummary: 'Bài học về hàm số bậc nhất y = ax + b, các tính chất đồng biến, nghịch biến và cách vẽ đồ thị.',
    questionCount: 15,
  },
  {
    id: 'doc-2',
    title: 'Chương 3 - Phương trình bậc nhất',
    fileName: 'chuong-3-phuong-trinh.docx',
    fileType: 'docx',
    fileSize: '1.8 MB',
    uploadedAt: '2024-12-08T14:30:00',
    status: 'completed' as const,
    className: 'Lớp 8B',
    aiSummary: 'Nội dung về phương trình bậc nhất một ẩn, cách giải và ứng dụng.',
    questionCount: 12,
  },
  {
    id: 'doc-3',
    title: 'Hình học - Tam giác đồng dạng',
    fileName: 'tam-giac-dong-dang.pptx',
    fileType: 'pptx',
    fileSize: '5.2 MB',
    uploadedAt: '2024-12-12T09:15:00',
    status: 'processing' as const,
    className: 'Lớp 9A',
    aiSummary: null,
    questionCount: 0,
  },
];

const mockAIResult = {
  summary: `Bài học này trình bày về hàm số bậc nhất y = ax + b với các nội dung chính:

1. Định nghĩa hàm số bậc nhất
2. Tính chất đồng biến (a > 0) và nghịch biến (a < 0)
3. Đồ thị hàm số là đường thẳng
4. Cách vẽ đồ thị bằng 2 điểm`,
  objectives: [
    'Hiểu định nghĩa và nhận dạng hàm số bậc nhất',
    'Xác định được tính đồng biến, nghịch biến',
    'Vẽ được đồ thị hàm số bậc nhất',
    'Ứng dụng vào bài toán thực tế',
  ],
  keyPoints: [
    'Hàm số bậc nhất có dạng y = ax + b (a ≠ 0)',
    'Đồ thị là đường thẳng cắt trục Oy tại điểm (0, b)',
    'Hệ số a quyết định độ dốc của đường thẳng',
    'a > 0: đồng biến, a < 0: nghịch biến',
  ],
  suggestedQuestions: [
    {
      id: 'sq-1',
      type: 'multiple_choice',
      content: 'Hàm số y = 2x + 1 là hàm số:',
      difficulty: 'easy',
    },
    {
      id: 'sq-2',
      type: 'multiple_choice',
      content: 'Đồ thị hàm số y = -3x + 2 cắt trục Oy tại điểm nào?',
      difficulty: 'medium',
    },
    {
      id: 'sq-3',
      type: 'essay',
      content: 'Vẽ đồ thị hàm số y = x + 3 và tìm tọa độ giao điểm với các trục',
      difficulty: 'medium',
    },
  ],
};

const fileIcons = {
  pdf: FileText,
  docx: File,
  pptx: FileText,
  image: Image,
};

const fileColors = {
  pdf: 'from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/20',
  docx: 'from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/20',
  pptx: 'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20',
  image: 'from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20',
};

const fileTypeLabels = {
  pdf: 'PDF',
  docx: 'Word',
  pptx: 'PowerPoint',
  image: 'Hình ảnh',
};

const statusLabels = {
  completed: 'Hoàn tất',
  processing: 'Đang xử lý',
  error: 'Lỗi',
};

// Filter types
type FileType = 'pdf' | 'docx' | 'pptx' | 'image';
type DocStatus = 'completed' | 'processing' | 'error';

interface Filters {
  fileTypes: FileType[];
  statuses: DocStatus[];
  classes: string[];
}

const defaultFilters: Filters = {
  fileTypes: [],
  statuses: [],
  classes: [],
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIResultModal, setShowAIResultModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof mockDocuments[0] | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);

  // Get available classes from documents
  const availableClasses = useMemo(() => {
    const classNames = mockDocuments.map((d) => d.className);
    return Array.from(new Set(classNames)).sort();
  }, []);

  // Filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fileTypes.length > 0) count += filters.fileTypes.length;
    if (filters.statuses.length > 0) count += filters.statuses.length;
    if (filters.classes.length > 0) count += filters.classes.length;
    return count;
  }, [filters]);

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

  const removeFilter = (type: 'fileType' | 'status' | 'class', value: string) => {
    if (type === 'fileType') {
      setFilters((prev) => ({
        ...prev,
        fileTypes: prev.fileTypes.filter((t) => t !== value),
      }));
    } else if (type === 'status') {
      setFilters((prev) => ({
        ...prev,
        statuses: prev.statuses.filter((s) => s !== value),
      }));
    } else if (type === 'class') {
      setFilters((prev) => ({
        ...prev,
        classes: prev.classes.filter((c) => c !== value),
      }));
    }
  };

  const toggleTempFileType = (fileType: FileType) => {
    setTempFilters((prev) => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(fileType)
        ? prev.fileTypes.filter((t) => t !== fileType)
        : [...prev.fileTypes, fileType],
    }));
  };

  const toggleTempStatus = (status: DocStatus) => {
    setTempFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const toggleTempClass = (className: string) => {
    setTempFilters((prev) => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter((c) => c !== className)
        : [...prev.classes, className],
    }));
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((doc) => {
      // Search filter
      if (!doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // File type filter
      if (filters.fileTypes.length > 0 && !filters.fileTypes.includes(doc.fileType as FileType)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(doc.status as DocStatus)) {
        return false;
      }

      // Class filter
      if (filters.classes.length > 0 && !filters.classes.includes(doc.className)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setIsUploading(false);
    setIsProcessing(true);

    // Simulate AI processing steps
    const steps = ['Đang phân tích tài liệu...', 'Đang trích xuất nội dung...', 'Đang tạo tóm tắt...', 'Đang tạo câu hỏi gợi ý...'];
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setIsProcessing(false);
    setShowUploadModal(false);
    setShowAIResultModal(true);
    setUploadedFile(null);
  };

  const handleViewAIResult = (doc: typeof mockDocuments[0]) => {
    setSelectedDocument(doc);
    setShowAIResultModal(true);
  };

  const statusConfig = {
    completed: { label: 'Hoàn tất', variant: 'success' as const, icon: CheckCircle },
    processing: { label: 'Đang xử lý', variant: 'warning' as const, icon: Clock },
    error: { label: 'Lỗi', variant: 'error' as const, icon: AlertCircle },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Tài liệu"
        subtitle="Upload tài liệu và để AI tạo câu hỏi tự động"
        action={
          <Button
            onClick={() => setShowUploadModal(true)}
            leftIcon={<Upload className="h-5 w-5" strokeWidth={1.75} />}
          >
            Upload tài liệu
          </Button>
        }
      />

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm tài liệu..."
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
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.fileTypes.map((type) => (
            <Badge
              key={type}
              variant="default"
              className="cursor-pointer"
              onClick={() => removeFilter('fileType', type)}
            >
              {fileTypeLabels[type]}
              <X className="h-3 w-3 ml-1" strokeWidth={2} />
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge
              key={status}
              variant="default"
              className="cursor-pointer"
              onClick={() => removeFilter('status', status)}
            >
              {statusLabels[status]}
              <X className="h-3 w-3 ml-1" strokeWidth={2} />
            </Badge>
          ))}
          {filters.classes.map((cls) => (
            <Badge
              key={cls}
              variant="default"
              className="cursor-pointer"
              onClick={() => removeFilter('class', cls)}
            >
              {cls}
              <X className="h-3 w-3 ml-1" strokeWidth={2} />
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

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" strokeWidth={1.75} />}
          title="Chưa có tài liệu nào"
          description="Upload tài liệu đầu tiên để AI tạo câu hỏi tự động"
          action={{
            label: 'Upload tài liệu',
            onClick: () => setShowUploadModal(true),
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const FileIcon = fileIcons[doc.fileType as keyof typeof fileIcons] || FileText;
            const fileColor = fileColors[doc.fileType as keyof typeof fileColors] || 'from-gray-100 to-gray-200 dark:from-gray-800/30 dark:to-gray-700/20';
            const status = statusConfig[doc.status];
            const StatusIcon = status.icon;

            return (
              <Card key={doc.id} padding="none" className="overflow-hidden group">
                {/* File Preview Header */}
                <div className={cn('h-32 bg-gradient-to-br flex items-center justify-center relative', fileColor)}>
                  <FileIcon className="h-16 w-16 text-[var(--text-tertiary)]" strokeWidth={1} />

                  {/* Menu */}
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowMenu(showMenu === doc.id ? null : doc.id)}
                      className="hover:bg-black/10"
                    >
                      <MoreVertical className="h-4 w-4 text-mono-700" strokeWidth={2.5} />
                    </Button>

                    {showMenu === doc.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl bg-white dark:bg-mono-800 shadow-apple-lg overflow-hidden">
                          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700">
                            <Eye className="h-4 w-4" strokeWidth={1.75} />
                            Xem tài liệu
                          </button>
                          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-mono-100 dark:hover:bg-mono-700">
                            <Download className="h-4 w-4" strokeWidth={1.75} />
                            Tải xuống
                          </button>
                          <div className="h-px bg-mono-200 dark:bg-mono-600 mx-2" />
                          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10">
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            Xóa
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant={status.variant} icon={<StatusIcon className="h-3 w-3" strokeWidth={1.75} />}>
                      {status.label}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-[var(--text-primary)] line-clamp-1">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-tertiary)]">
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(doc.uploadedAt)}</span>
                  </div>

                  {doc.status === 'completed' && (
                    <>
                      <p className="text-sm text-[var(--text-secondary)] mt-3 line-clamp-2">{doc.aiSummary}</p>

                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="primary" icon={<HelpCircle className="h-3 w-3" strokeWidth={1.75} />}>
                          {doc.questionCount} câu hỏi
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAIResult(doc)}
                          rightIcon={<ChevronRight className="h-4 w-4" strokeWidth={1.75} />}
                        >
                          Xem AI
                        </Button>
                      </div>
                    </>
                  )}

                  {doc.status === 'processing' && (
                    <div className="mt-4">
                      <ProgressBar value={65} size="sm" showLabel />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!isUploading && !isProcessing) {
            setShowUploadModal(false);
            setUploadedFile(null);
          }
        }}
        title="Upload tài liệu"
        size="lg"
      >
        {!isUploading && !isProcessing ? (
          <div className="py-4">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 text-center transition-colors',
                uploadedFile
                  ? 'border-mono-400 dark:border-mono-500 bg-mono-50 dark:bg-mono-850'
                  : 'border-mono-300 dark:border-mono-600 hover:border-mono-400 dark:border-mono-500/50'
              )}
            >
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <FileText className="h-12 w-12 text-mono-600 dark:text-mono-400" strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="font-medium text-[var(--text-primary)]">{uploadedFile.name}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                  <p className="text-[var(--text-secondary)] mb-2">
                    Kéo thả file vào đây hoặc{' '}
                    <label className="text-mono-600 dark:text-mono-400 cursor-pointer hover:underline">
                      chọn file
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Hỗ trợ PDF, Word, PowerPoint, ảnh (tối đa 50MB)
                  </p>
                </>
              )}
            </div>

            {/* AI Features Info */}
            <div className="mt-6 p-4 rounded-xl bg-mono-50 dark:bg-mono-850 border border-mono-400 dark:border-mono-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-mono-600 dark:text-mono-400 flex-shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">AI sẽ tự động:</p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                    <li>• Trích xuất nội dung từ tài liệu</li>
                    <li>• Tạo tóm tắt và ý chính</li>
                    <li>• Đề xuất câu hỏi trắc nghiệm & tự luận</li>
                    <li>• Soạn giáo án gợi ý</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            {isUploading ? (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-mono-600 dark:text-mono-400 animate-pulse" strokeWidth={1.5} />
                <p className="font-medium text-[var(--text-primary)] mb-4">Đang tải lên...</p>
                <ProgressBar value={uploadProgress} className="max-w-xs mx-auto" />
                <p className="text-sm text-[var(--text-tertiary)] mt-2">{uploadProgress}%</p>
              </>
            ) : (
              <>
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-mono-600 dark:text-mono-400 animate-pulse" strokeWidth={1.5} />
                <p className="font-medium text-[var(--text-primary)] mb-4">AI đang phân tích tài liệu...</p>
                <div className="max-w-xs mx-auto space-y-2">
                  {['Đang phân tích tài liệu', 'Đang trích xuất nội dung', 'Đang tạo tóm tắt', 'Đang tạo câu hỏi gợi ý'].map((step, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        idx < processingStep
                          ? 'text-success'
                          : idx === processingStep
                          ? 'text-mono-600 dark:text-mono-400'
                          : 'text-[var(--text-tertiary)]'
                      )}
                    >
                      {idx < processingStep ? (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.75} />
                      ) : idx === processingStep ? (
                        <Clock className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                      )}
                      {step}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!isUploading && !isProcessing && (
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadedFile}
              leftIcon={<Sparkles className="h-5 w-5" strokeWidth={1.75} />}
            >
              Upload & Phân tích
            </Button>
          </ModalFooter>
        )}
      </Modal>

      {/* AI Result Modal */}
      <Modal
        isOpen={showAIResultModal}
        onClose={() => setShowAIResultModal(false)}
        title="Kết quả phân tích AI"
        size="xl"
      >
        <div className="py-2 max-h-[70vh] overflow-y-auto">
          {/* Summary */}
          <Card className="mb-4 border border-[var(--border-default)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
                Tóm tắt nội dung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-secondary)] whitespace-pre-line">{mockAIResult.summary}</p>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card className="mb-4 border border-[var(--border-default)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-success" strokeWidth={1.75} />
                Mục tiêu bài học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockAIResult.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                    {obj}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card className="mb-4 border border-[var(--border-default)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-5 w-5 text-warning" strokeWidth={1.75} />
                Kiến thức trọng tâm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockAIResult.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/20 text-warning text-xs font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card className="border border-[var(--border-default)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-5 w-5 text-mono-600 dark:text-mono-400" strokeWidth={1.75} />
                Câu hỏi gợi ý ({mockAIResult.suggestedQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAIResult.suggestedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-soft)]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mono-100 dark:bg-mono-800 text-mono-600 dark:text-mono-400 text-xs font-medium flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[var(--text-primary)]">{q.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={q.type === 'essay' ? 'primary' : 'default'}>
                        {q.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                      </Badge>
                      <Badge
                        variant={
                          q.difficulty === 'easy'
                            ? 'success'
                            : q.difficulty === 'medium'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'TB' : 'Khó'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-1" strokeWidth={1.75} />
                    Thêm
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t border-gray-100">
              <Button className="w-full" leftIcon={<Sparkles className="h-5 w-5" strokeWidth={1.75} />}>
                Tạo thêm câu hỏi
              </Button>
            </CardFooter>
          </Card>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAIResultModal(false)}>
            Đóng
          </Button>
          <Button leftIcon={<Plus className="h-5 w-5" strokeWidth={1.75} />}>
            Thêm tất cả vào ngân hàng câu hỏi
          </Button>
        </ModalFooter>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Bộ lọc"
      >
        <div className="space-y-6 py-4">
          {/* File Type Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Loại file
            </label>
            <div className="flex flex-wrap gap-2">
              {(['pdf', 'docx', 'pptx', 'image'] as FileType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTempFileType(type)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    tempFilters.fileTypes.includes(type)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                  )}
                >
                  {fileTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Trạng thái
            </label>
            <div className="flex flex-wrap gap-2">
              {(['completed', 'processing', 'error'] as DocStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleTempStatus(status)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    tempFilters.statuses.includes(status)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                  )}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Lớp học
            </label>
            <div className="flex flex-wrap gap-2">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => toggleTempClass(cls)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    tempFilters.classes.includes(cls)
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-mono-100 dark:bg-mono-800 text-[var(--text-secondary)] hover:bg-mono-200 dark:hover:bg-mono-700'
                  )}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={clearFilters}>
            Đặt lại
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
              Hủy
            </Button>
            <Button onClick={applyFilters}>Áp dụng</Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

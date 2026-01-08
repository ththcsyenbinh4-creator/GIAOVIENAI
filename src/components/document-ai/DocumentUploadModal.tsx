'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  File,
  X,
  Sparkles,
  BookOpen,
  ClipboardList,
  GraduationCap,
  FileQuestion,
  CheckCircle,
  AlertCircle,
  Loader2,
  Volume2,
  Presentation,
  Brain,
  FileEdit,
} from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AIGenerationMode,
  DocumentProcessingJob,
  GeneratedQuestion,
  VoiceMode,
  SlideDeck,
  SlideGenerateMode,
  FlashcardDeck,
  FlashcardGenerateMode,
  Worksheet,
  WorksheetGenerateMode,
} from '@/types/domain';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { SlideDeckModal } from '@/components/slides/SlideDeckModal';
import { FlashcardModal } from '@/components/flashcards/FlashcardModal';
import { WorksheetModal } from '@/components/worksheets/WorksheetModal';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated?: (questions: GeneratedQuestion[]) => void;
}

type Step = 'upload' | 'configure' | 'processing' | 'results';

const MODE_OPTIONS: Array<{
  mode: AIGenerationMode;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    mode: 'create_assignment',
    label: 'Tạo bài tập',
    description: 'Tạo bài tập cho tiết học',
    icon: ClipboardList,
  },
  {
    mode: 'create_test',
    label: 'Tạo đề kiểm tra',
    description: 'Đề kiểm tra 15-45 phút',
    icon: FileQuestion,
  },
  {
    mode: 'create_study_material',
    label: 'Tài liệu ôn tập',
    description: 'Tóm tắt + câu hỏi ôn',
    icon: BookOpen,
  },
  {
    mode: 'create_lesson',
    label: 'Giáo án bài giảng',
    description: 'Outline + hoạt động',
    icon: GraduationCap,
  },
  {
    mode: 'create_question_bank',
    label: 'Ngân hàng câu hỏi',
    description: 'Nhiều câu hỏi đa dạng',
    icon: Sparkles,
  },
];

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

export function DocumentUploadModal({
  isOpen,
  onClose,
  onQuestionsGenerated,
}: DocumentUploadModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [selectedMode, setSelectedMode] = useState<AIGenerationMode>('create_assignment');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [targetGrade, setTargetGrade] = useState<number>(8);
  const [duration, setDuration] = useState(45);
  const [isDragOver, setIsDragOver] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<DocumentProcessingJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Voice/Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Slide state
  const [slideDeck, setSlideDeck] = useState<SlideDeck | null>(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideError, setSlideError] = useState<string | null>(null);
  const [showSlideModal, setShowSlideModal] = useState(false);

  // Flashcard state
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeck | null>(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);

  // Worksheet state
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [worksheetError, setWorksheetError] = useState<string | null>(null);
  const [showWorksheetModal, setShowWorksheetModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for job status
  useEffect(() => {
    if (jobId && step === 'processing') {
      const pollStatus = async () => {
        try {
          const response = await fetch(`/api/document-ai/process?jobId=${jobId}`);
          const jobData: DocumentProcessingJob = await response.json();
          setJob(jobData);

          if (jobData.status === 'completed') {
            setStep('results');
            if (pollingRef.current) clearInterval(pollingRef.current);
          } else if (jobData.status === 'failed') {
            setError(jobData.error || 'Đã xảy ra lỗi');
            setStep('upload');
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch (err) {
          console.error('Error polling job status:', err);
        }
      };

      pollStatus();
      pollingRef.current = setInterval(pollStatus, 2000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [jobId, step]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Vui lòng chọn file PDF, Word (.docx), hoặc PowerPoint (.pptx)');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Vui lòng chọn file PDF, Word (.docx), hoặc PowerPoint (.pptx)');
    }
  };

  const isValidFile = (f: File): boolean => {
    const validTypes = Object.keys(ACCEPTED_TYPES);
    return validTypes.includes(f.type) || f.name.match(/\.(pdf|docx|pptx)$/i) !== null;
  };

  const handleStartProcessing = async () => {
    if (!file) return;

    setStep('processing');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', selectedMode);
    formData.append('questionCount', questionCount.toString());
    formData.append('difficulty', difficulty);
    formData.append('targetGrade', targetGrade.toString());
    formData.append('duration', duration.toString());
    formData.append('questionTypes', 'mcq,essay');

    try {
      const response = await fetch('/api/document-ai/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi xử lý file');
      }

      setJobId(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setStep('upload');
    }
  };

  const handleUseQuestions = () => {
    if (job?.generatedContent?.questions && onQuestionsGenerated) {
      onQuestionsGenerated(job.generatedContent.questions);
    }
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setSelectedMode('create_assignment');
    setQuestionCount(10);
    setDifficulty('mixed');
    setJobId(null);
    setJob(null);
    setError(null);
    setAudioUrl(null);
    setIsGeneratingAudio(false);
    setAudioError(null);
    setSlideDeck(null);
    setIsGeneratingSlides(false);
    setSlideError(null);
    setShowSlideModal(false);
    setFlashcardDeck(null);
    setIsGeneratingFlashcards(false);
    setFlashcardError(null);
    setShowFlashcardModal(false);
    setWorksheet(null);
    setIsGeneratingWorksheet(false);
    setWorksheetError(null);
    setShowWorksheetModal(false);
    if (pollingRef.current) clearInterval(pollingRef.current);
    onClose();
  };

  // Generate audio from lesson/study guide content
  const handleGenerateAudio = async (mode: VoiceMode) => {
    if (!job?.generatedContent) return;

    setIsGeneratingAudio(true);
    setAudioError(null);

    // Build text content based on mode
    let text = '';

    if (mode === 'lesson-summary' && job.generatedContent.lessonOutline) {
      text = job.generatedContent.lessonOutline
        .map(section => `${section.section}: ${section.activities.join('. ')}`)
        .join('\n\n');
    } else if (mode === 'study-guide' && job.generatedContent.studyGuide) {
      text = job.generatedContent.studyGuide
        .map(topic => `${topic.topic}: ${topic.keyPoints.join('. ')}`)
        .join('\n\n');
    } else if (job.generatedContent.summaryText) {
      text = job.generatedContent.summaryText;
    }

    if (!text) {
      setAudioError('Không có nội dung để tạo audio');
      setIsGeneratingAudio(false);
      return;
    }

    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          text: text.slice(0, 4000), // Limit to max length
          language: 'vi',
          voiceProfile: 'teacher-default',
          speed: 1.0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi tạo audio');
      }

      setAudioUrl(data.audioUrl);
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'Không thể tạo audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Generate slides from lesson/study guide content
  const handleGenerateSlides = async () => {
    if (!job?.generatedContent || !file) return;

    setIsGeneratingSlides(true);
    setSlideError(null);

    // Build content based on what's available
    let content = '';
    let mode: SlideGenerateMode = 'from-document';

    if (job.generatedContent.lessonOutline) {
      mode = 'from-lesson-plan';
      content = job.generatedContent.lessonOutline
        .map(section => {
          const objectives = section.objectives?.join(', ') || '';
          const activities = section.activities?.join('. ') || '';
          return `${section.section} (${section.duration}):\nMục tiêu: ${objectives}\nHoạt động: ${activities}`;
        })
        .join('\n\n');
    } else if (job.generatedContent.studyGuide) {
      mode = 'from-study-guide';
      content = job.generatedContent.studyGuide
        .map(topic => {
          const keyPoints = topic.keyPoints?.join('. ') || '';
          return `${topic.topic}:\n${keyPoints}`;
        })
        .join('\n\n');
    } else if (job.generatedContent.summaryText) {
      content = job.generatedContent.summaryText;
    }

    if (!content) {
      setSlideError('Không có nội dung để tạo slide');
      setIsGeneratingSlides(false);
      return;
    }

    // Get lesson title from file name or analysis
    const lessonTitle = job.analysis?.mainTopics?.[0]?.topic ||
      file.name.replace(/\.(pdf|docx|pptx)$/i, '') ||
      'Bài học';

    try {
      const response = await fetch('/api/slides/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          lessonTitle,
          gradeLevel: `Lớp ${targetGrade}`,
          content: content.slice(0, 6000),
          targetSlideCount: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi tạo slide');
      }

      setSlideDeck(data.deck);
      setShowSlideModal(true);
    } catch (err) {
      setSlideError(err instanceof Error ? err.message : 'Không thể tạo slide');
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // Generate flashcards from content
  const handleGenerateFlashcards = async () => {
    if (!job?.generatedContent || !file) return;

    setIsGeneratingFlashcards(true);
    setFlashcardError(null);

    // Build content based on what's available
    let content = '';
    let mode: FlashcardGenerateMode = 'from-document';

    if (job.generatedContent.lessonOutline) {
      mode = 'from-lesson-plan';
      content = job.generatedContent.lessonOutline
        .map(section => {
          const objectives = section.objectives?.join(', ') || '';
          const activities = section.activities?.join('. ') || '';
          return `${section.section}:\nMục tiêu: ${objectives}\nHoạt động: ${activities}`;
        })
        .join('\n\n');
    } else if (job.generatedContent.studyGuide) {
      mode = 'from-study-guide';
      content = job.generatedContent.studyGuide
        .map(topic => {
          const keyPoints = topic.keyPoints?.join('. ') || '';
          return `${topic.topic}:\n${keyPoints}`;
        })
        .join('\n\n');
    } else if (job.generatedContent.summaryText) {
      content = job.generatedContent.summaryText;
    }

    if (!content) {
      setFlashcardError('Không có nội dung để tạo flashcard');
      setIsGeneratingFlashcards(false);
      return;
    }

    const title = job.analysis?.mainTopics?.[0]?.topic ||
      file.name.replace(/\.(pdf|docx|pptx)$/i, '') ||
      'Flashcards';

    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          title,
          gradeLevel: `Lớp ${targetGrade}`,
          content: content.slice(0, 6000),
          targetCardCount: 15,
          difficulty: 'mixed',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi tạo flashcard');
      }

      setFlashcardDeck(data.deck);
      setShowFlashcardModal(true);
    } catch (err) {
      setFlashcardError(err instanceof Error ? err.message : 'Không thể tạo flashcard');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Generate worksheet from content
  const handleGenerateWorksheet = async () => {
    if (!job?.generatedContent || !file) return;

    setIsGeneratingWorksheet(true);
    setWorksheetError(null);

    // Build content based on what's available
    let content = '';
    let mode: WorksheetGenerateMode = 'from-document';

    if (job.generatedContent.lessonOutline) {
      mode = 'from-lesson-plan';
      content = job.generatedContent.lessonOutline
        .map(section => {
          const objectives = section.objectives?.join(', ') || '';
          const activities = section.activities?.join('. ') || '';
          return `${section.section}:\nMục tiêu: ${objectives}\nHoạt động: ${activities}`;
        })
        .join('\n\n');
    } else if (job.generatedContent.studyGuide) {
      mode = 'from-study-guide';
      content = job.generatedContent.studyGuide
        .map(topic => {
          const keyPoints = topic.keyPoints?.join('. ') || '';
          return `${topic.topic}:\n${keyPoints}`;
        })
        .join('\n\n');
    } else if (job.generatedContent.summaryText) {
      content = job.generatedContent.summaryText;
    }

    if (!content) {
      setWorksheetError('Không có nội dung để tạo bài tập');
      setIsGeneratingWorksheet(false);
      return;
    }

    const title = job.analysis?.mainTopics?.[0]?.topic ||
      file.name.replace(/\.(pdf|docx|pptx)$/i, '') ||
      'Bài tập';

    try {
      const response = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          title,
          gradeLevel: `Lớp ${targetGrade}`,
          content: content.slice(0, 6000),
          targetQuestionCount: 10,
          difficulty: 'mixed',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi tạo bài tập');
      }

      setWorksheet(data.worksheet);
      setShowWorksheetModal(true);
    } catch (err) {
      setWorksheetError(err instanceof Error ? err.message : 'Không thể tạo bài tập');
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return FileText;
    if (file.name.endsWith('.pdf')) return FileText;
    if (file.name.endsWith('.pptx')) return File;
    return FileText;
  };

  const FileIcon = getFileIcon();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo bài từ tài liệu"
      size="lg"
    >
      {step === 'upload' && (
        <div className="space-y-6 py-2">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
              isDragOver
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-mono-300 dark:border-mono-600 hover:border-mono-400 dark:hover:border-mono-500',
              file && 'border-success bg-success/5'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <FileIcon className="h-8 w-8 text-success" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="p-2 rounded-lg hover:bg-mono-100 dark:hover:bg-mono-800"
                >
                  <X className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-mono-400 mb-4" strokeWidth={1.5} />
                <p className="text-[var(--text-primary)] font-medium mb-1">
                  Kéo thả file vào đây
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  hoặc click để chọn file
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  Hỗ trợ: PDF, Word (.docx), PowerPoint (.pptx)
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
              {error}
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <h3 className="font-medium text-[var(--text-primary)] mb-3">Chọn chế độ xử lý:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MODE_OPTIONS.map(({ mode, label, description, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    selectedMode === mode
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-mono-200 dark:border-mono-700 hover:border-mono-300 dark:hover:border-mono-600'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 mb-2',
                      selectedMode === mode ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                    )}
                    strokeWidth={1.75}
                  />
                  <p className="font-medium text-[var(--text-primary)] text-sm">{label}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'configure' && (
        <div className="space-y-6 py-2">
          {/* Configuration Options */}
          <div className="p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
            <div className="flex items-center gap-3 mb-2">
              <FileIcon className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span className="font-medium text-[var(--text-primary)]">{file?.name}</span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              Chế độ: {MODE_OPTIONS.find(m => m.mode === selectedMode)?.label}
            </p>
          </div>

          {/* Question Count */}
          {['create_assignment', 'create_test', 'create_question_bank'].includes(selectedMode) && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Số lượng câu hỏi
              </label>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 20].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      questionCount === count
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-mono-200 dark:border-mono-700 hover:border-mono-300'
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          {['create_assignment', 'create_test', 'create_question_bank'].includes(selectedMode) && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Độ khó
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'easy', label: 'Dễ' },
                  { value: 'medium', label: 'Trung bình' },
                  { value: 'hard', label: 'Khó' },
                  { value: 'mixed', label: 'Kết hợp' },
                ].map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value as typeof difficulty)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      difficulty === d.value
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-mono-200 dark:border-mono-700 hover:border-mono-300'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Grade */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Lớp học
            </label>
            <select
              value={targetGrade}
              onChange={e => setTargetGrade(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-mono-200 dark:border-mono-700 bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                <option key={grade} value={grade}>Lớp {grade}</option>
              ))}
            </select>
          </div>

          {/* Duration (for lessons) */}
          {selectedMode === 'create_lesson' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Thời lượng bài giảng (phút)
              </label>
              <div className="flex items-center gap-3">
                {[30, 45, 60, 90].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      duration === d
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-mono-200 dark:border-mono-700 hover:border-mono-300'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'processing' && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mono-100 dark:bg-mono-800 mb-4">
            <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin" strokeWidth={1.75} />
          </div>
          <p className="text-[var(--text-primary)] font-medium mb-2">
            {job?.progressMessage || 'Đang xử lý...'}
          </p>
          <div className="w-64 mx-auto bg-mono-200 dark:bg-mono-700 rounded-full h-2 mt-4">
            <div
              className="bg-[var(--accent)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${job?.progress || 10}%` }}
            />
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">
            {job?.progress || 10}%
          </p>
        </div>
      )}

      {step === 'results' && job && (
        <div className="space-y-6 py-2">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10">
            <CheckCircle className="h-6 w-6 text-success" strokeWidth={1.75} />
            <div>
              <p className="font-medium text-success">Xử lý hoàn tất!</p>
              <p className="text-sm text-[var(--text-secondary)]">
                AI đã tạo nội dung từ tài liệu của bạn
              </p>
            </div>
          </div>

          {/* Show generated questions */}
          {job.generatedContent?.questions && (
            <div>
              <h3 className="font-medium text-[var(--text-primary)] mb-3">
                Câu hỏi đã tạo ({job.generatedContent.questions.length})
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {job.generatedContent.questions.slice(0, 5).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-mono-100 dark:bg-mono-800"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-700">
                        {q.type === 'mcq' ? 'TN' : 'TL'}
                      </span>
                      <p className="text-sm text-[var(--text-primary)] flex-1 line-clamp-2">
                        {q.prompt}
                      </p>
                    </div>
                  </div>
                ))}
                {job.generatedContent.questions.length > 5 && (
                  <p className="text-sm text-[var(--text-tertiary)] text-center py-2">
                    +{job.generatedContent.questions.length - 5} câu hỏi khác
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Show lesson outline */}
          {job.generatedContent?.lessonOutline && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[var(--text-primary)]">
                  Giáo án ({job.generatedContent.lessonOutline.length} phần)
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGenerateAudio('lesson-summary')}
                  disabled={isGeneratingAudio}
                  leftIcon={isGeneratingAudio ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <Volume2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                >
                  {isGeneratingAudio ? 'Đang tạo...' : 'Tạo audio'}
                </Button>
              </div>

              {/* Audio Player for Lesson */}
              {audioUrl && (
                <div className="mb-3">
                  <AudioPlayer src={audioUrl} mode="lesson-summary" />
                </div>
              )}

              {audioError && (
                <div className="mb-3 p-2 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                  {audioError}
                </div>
              )}

              <div className="space-y-2">
                {job.generatedContent.lessonOutline.map((section, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-mono-100 dark:bg-mono-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[var(--text-primary)]">
                        {section.section}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {section.duration}
                      </span>
                    </div>
                    <ul className="text-sm text-[var(--text-secondary)]">
                      {section.activities.slice(0, 2).map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show study guide */}
          {job.generatedContent?.studyGuide && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[var(--text-primary)]">
                  Tài liệu ôn tập
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGenerateAudio('study-guide')}
                  disabled={isGeneratingAudio}
                  leftIcon={isGeneratingAudio ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <Volume2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                >
                  {isGeneratingAudio ? 'Đang tạo...' : 'Tạo audio'}
                </Button>
              </div>

              {/* Audio Player for Study Guide */}
              {audioUrl && (
                <div className="mb-3">
                  <AudioPlayer src={audioUrl} mode="study-guide" />
                </div>
              )}

              {audioError && (
                <div className="mb-3 p-2 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                  {audioError}
                </div>
              )}

              <div className="space-y-2">
                {job.generatedContent.studyGuide.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-mono-100 dark:bg-mono-800"
                  >
                    <p className="font-medium text-[var(--text-primary)] mb-1">
                      {topic.topic}
                    </p>
                    <ul className="text-sm text-[var(--text-secondary)]">
                      {topic.keyPoints.slice(0, 2).map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide Generation Section */}
          {(job.generatedContent?.lessonOutline || job.generatedContent?.studyGuide || job.generatedContent?.summaryText) && (
            <div className="border-t border-[var(--border-default)] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mono-100 dark:bg-mono-800">
                    <Presentation className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Slide giảng dạy</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Tạo slide từ nội dung đã phân tích
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateSlides}
                  disabled={isGeneratingSlides}
                  leftIcon={isGeneratingSlides ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <Presentation className="h-4 w-4" strokeWidth={1.75} />
                  )}
                >
                  {isGeneratingSlides ? 'Đang tạo...' : 'Tạo slide'}
                </Button>
              </div>

              {slideError && (
                <div className="mt-3 p-2 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                  {slideError}
                </div>
              )}

              {slideDeck && (
                <div className="mt-3 p-3 rounded-xl bg-success/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
                    <span className="text-sm text-success font-medium">
                      Đã tạo {slideDeck.slides.length} slides
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSlideModal(true)}
                  >
                    Xem slide
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Flashcard Generation Section */}
          {(job.generatedContent?.lessonOutline || job.generatedContent?.studyGuide || job.generatedContent?.summaryText) && (
            <div className="border-t border-[var(--border-default)] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Flashcards</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Tạo thẻ học từ nội dung bài
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFlashcards}
                  leftIcon={isGeneratingFlashcards ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <Brain className="h-4 w-4" strokeWidth={1.75} />
                  )}
                >
                  {isGeneratingFlashcards ? 'Đang tạo...' : 'Tạo flashcard'}
                </Button>
              </div>

              {flashcardError && (
                <div className="mt-3 p-2 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                  {flashcardError}
                </div>
              )}

              {flashcardDeck && (
                <div className="mt-3 p-3 rounded-xl bg-success/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
                    <span className="text-sm text-success font-medium">
                      Đã tạo {flashcardDeck.cards.length} flashcards
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFlashcardModal(true)}
                  >
                    Xem flashcard
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Worksheet Generation Section */}
          {(job.generatedContent?.lessonOutline || job.generatedContent?.studyGuide || job.generatedContent?.summaryText) && (
            <div className="border-t border-[var(--border-default)] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <FileEdit className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Bài tập (Worksheet)</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Tạo bài tập đa dạng từ nội dung
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateWorksheet}
                  disabled={isGeneratingWorksheet}
                  leftIcon={isGeneratingWorksheet ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <FileEdit className="h-4 w-4" strokeWidth={1.75} />
                  )}
                >
                  {isGeneratingWorksheet ? 'Đang tạo...' : 'Tạo bài tập'}
                </Button>
              </div>

              {worksheetError && (
                <div className="mt-3 p-2 rounded-lg bg-error/10 text-error text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                  {worksheetError}
                </div>
              )}

              {worksheet && (
                <div className="mt-3 p-3 rounded-xl bg-success/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" strokeWidth={1.75} />
                    <span className="text-sm text-success font-medium">
                      Đã tạo {worksheet.questions.length} câu hỏi
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWorksheetModal(true)}
                  >
                    Xem bài tập
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slide Deck Modal */}
      {slideDeck && (
        <SlideDeckModal
          isOpen={showSlideModal}
          onClose={() => setShowSlideModal(false)}
          deck={slideDeck}
          mode="teacher"
        />
      )}

      {/* Flashcard Modal */}
      {flashcardDeck && (
        <FlashcardModal
          isOpen={showFlashcardModal}
          onClose={() => setShowFlashcardModal(false)}
          deck={flashcardDeck}
          mode="preview"
        />
      )}

      {/* Worksheet Modal */}
      {worksheet && (
        <WorksheetModal
          isOpen={showWorksheetModal}
          onClose={() => setShowWorksheetModal(false)}
          worksheet={worksheet}
        />
      )}

      <ModalFooter>
        {step === 'upload' && (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={() => setStep('configure')}
              disabled={!file}
              leftIcon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
            >
              Tiếp tục
            </Button>
          </>
        )}

        {step === 'configure' && (
          <>
            <Button variant="secondary" onClick={() => setStep('upload')}>
              Quay lại
            </Button>
            <Button
              onClick={handleStartProcessing}
              leftIcon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
            >
              Bắt đầu xử lý
            </Button>
          </>
        )}

        {step === 'processing' && (
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
        )}

        {step === 'results' && (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Đóng
            </Button>
            {job?.generatedContent?.questions && onQuestionsGenerated && (
              <Button onClick={handleUseQuestions}>
                Sử dụng câu hỏi
              </Button>
            )}
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}

export default DocumentUploadModal;

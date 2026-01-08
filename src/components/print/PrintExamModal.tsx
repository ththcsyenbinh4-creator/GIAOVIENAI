'use client';

import { useState } from 'react';
import { Printer, Download, FileText, Settings, CheckCircle } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExamCodeSelector } from './ExamCodeSelector';
import { AssignmentDetail, ExamCodeLetter } from '@/types/domain';
import { generateExamCodes } from '@/services/print/exam-code-generator';
import { pdf } from '@react-pdf/renderer';
import { ExamDocument } from './pdf-templates/ExamDocument';
import { AnswerKeyDocument } from './pdf-templates/AnswerKeyDocument';

interface PrintExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentDetail;
}

type PrintStep = 'select' | 'settings' | 'generating';

export function PrintExamModal({ isOpen, onClose, assignment }: PrintExamModalProps) {
  const [step, setStep] = useState<PrintStep>('select');
  const [selectedCodes, setSelectedCodes] = useState<ExamCodeLetter[]>(['A']);
  const [copiesPerCode, setCopiesPerCode] = useState(1);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [schoolName, setSchoolName] = useState('');
  const [headerText, setHeaderText] = useState('Năm học 2024-2025');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  const totalPages = selectedCodes.length * copiesPerCode;
  const mcqCount = assignment.questions.filter((q) => q.type === 'mcq').length;
  const essayCount = assignment.questions.filter((q) => q.type === 'essay').length;

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setStep('generating');
    setGenerationProgress('Đang tạo mã đề...');

    try {
      // Generate exam codes
      const examCodes = generateExamCodes(assignment.id, assignment.questions, selectedCodes);

      setGenerationProgress('Đang tạo file PDF đề thi...');

      // Generate exam PDF
      const examBlob = await pdf(
        <ExamDocument
          assignment={assignment}
          examCodes={examCodes}
          copiesPerCode={copiesPerCode}
          options={{
            paperSize: 'A4',
            fontSize: 'medium',
            schoolName: schoolName || undefined,
            headerText: headerText || undefined,
            showStudentInfo: true,
            showAnswerGrid: mcqCount > 0,
          }}
        />
      ).toBlob();

      // Download exam PDF
      const examUrl = URL.createObjectURL(examBlob);
      const examLink = document.createElement('a');
      examLink.href = examUrl;
      examLink.download = `${assignment.title.replace(/\s+/g, '-')}-de-thi.pdf`;
      examLink.click();
      URL.revokeObjectURL(examUrl);

      // Generate answer key if requested
      if (includeAnswerKey) {
        setGenerationProgress('Đang tạo file PDF đáp án...');

        const answerKeyBlob = await pdf(
          <AnswerKeyDocument
            assignment={assignment}
            examCodes={examCodes}
            options={{
              paperSize: 'A4',
              schoolName: schoolName || undefined,
              showQuestionContent: false,
            }}
          />
        ).toBlob();

        // Download answer key PDF
        const answerKeyUrl = URL.createObjectURL(answerKeyBlob);
        const answerKeyLink = document.createElement('a');
        answerKeyLink.href = answerKeyUrl;
        answerKeyLink.download = `${assignment.title.replace(/\s+/g, '-')}-dap-an.pdf`;
        answerKeyLink.click();
        URL.revokeObjectURL(answerKeyUrl);
      }

      setGenerationProgress('Hoàn tất!');

      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setGenerationProgress('Lỗi khi tạo PDF. Vui lòng thử lại.');
      setIsGenerating(false);
      setStep('select');
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedCodes(['A']);
    setCopiesPerCode(1);
    setIncludeAnswerKey(true);
    setSchoolName('');
    setHeaderText('Năm học 2024-2025');
    setIsGenerating(false);
    setGenerationProgress('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="In đề thi"
      size="md"
    >
      {step === 'generating' ? (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mono-100 dark:bg-mono-800 mb-4">
            {generationProgress === 'Hoàn tất!' ? (
              <CheckCircle className="h-8 w-8 text-success" strokeWidth={1.75} />
            ) : (
              <Printer className="h-8 w-8 text-mono-600 animate-pulse" strokeWidth={1.75} />
            )}
          </div>
          <p className="text-[var(--text-primary)] font-medium">{generationProgress}</p>
          {generationProgress !== 'Hoàn tất!' && generationProgress !== 'Lỗi khi tạo PDF. Vui lòng thử lại.' && (
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              Đang xử lý {totalPages} trang...
            </p>
          )}
        </div>
      ) : step === 'select' ? (
        <div className="space-y-6 py-2">
          {/* Assignment Info */}
          <div className="p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span className="font-medium text-[var(--text-primary)]">{assignment.title}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {assignment.questions.length} câu hỏi ({mcqCount} trắc nghiệm, {essayCount} tự luận)
              {assignment.durationMinutes && ` • ${assignment.durationMinutes} phút`}
            </p>
          </div>

          {/* Exam Code Selector */}
          <ExamCodeSelector
            selectedCodes={selectedCodes}
            onChange={setSelectedCodes}
          />

          {/* Copies per code */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
            <span className="text-[var(--text-primary)]">Số bản mỗi mã đề:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={copiesPerCode}
              onChange={(e) => setCopiesPerCode(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-20 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-center text-[var(--text-primary)]"
            />
          </div>

          {/* Include Answer Key */}
          <label className="flex items-center gap-3 p-4 rounded-xl bg-mono-100 dark:bg-mono-800 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnswerKey}
              onChange={(e) => setIncludeAnswerKey(e.target.checked)}
              className="w-5 h-5 rounded border-mono-300 dark:border-mono-600"
            />
            <div>
              <span className="text-[var(--text-primary)]">Kèm theo đáp án</span>
              <p className="text-xs text-[var(--text-tertiary)]">
                Tải xuống file đáp án riêng cho tất cả mã đề
              </p>
            </div>
          </label>

          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setStep('settings')}
            className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
            Cài đặt nâng cao
          </button>

          {/* Summary */}
          <div className="p-4 rounded-xl border border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-secondary)]">
              <strong>Tổng cộng:</strong> {totalPages} trang đề thi
              {includeAnswerKey && ' + 1 trang đáp án'}
            </p>
          </div>
        </div>
      ) : (
        /* Settings Step */
        <div className="space-y-4 py-2">
          <button
            type="button"
            onClick={() => setStep('select')}
            className="text-sm text-[var(--accent)] hover:underline mb-4"
          >
            ← Quay lại
          </button>

          <Input
            label="Tên trường"
            placeholder="VD: TRƯỜNG THCS ABC"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />

          <Input
            label="Dòng tiêu đề phụ"
            placeholder="VD: Năm học 2024-2025"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
          />

          <div className="p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
            <p className="text-sm text-[var(--text-secondary)]">
              <strong>Khổ giấy:</strong> A4
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              <strong>Cỡ chữ:</strong> Trung bình (11pt)
            </p>
          </div>
        </div>
      )}

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isGenerating}>
          Hủy
        </Button>
        {step === 'settings' ? (
          <Button onClick={() => setStep('select')}>
            Xác nhận
          </Button>
        ) : step === 'select' ? (
          <Button
            onClick={handleGenerateExam}
            disabled={selectedCodes.length === 0}
            leftIcon={<Download className="h-4 w-4" strokeWidth={1.75} />}
          >
            Tải PDF ({totalPages} trang)
          </Button>
        ) : null}
      </ModalFooter>
    </Modal>
  );
}

export default PrintExamModal;

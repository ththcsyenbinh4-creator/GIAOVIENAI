'use client';

/**
 * WorksheetModal Component
 *
 * A modal wrapper for WorksheetViewer that provides
 * a focused worksheet preview experience.
 */

import { useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorksheetViewer } from './WorksheetViewer';
import { Worksheet } from '@/types/domain';
import { cn } from '@/lib/utils';

interface WorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheet: Worksheet;
  onUseWorksheet?: (worksheet: Worksheet) => void;
}

export function WorksheetModal({
  isOpen,
  onClose,
  worksheet,
  onUseWorksheet,
}: WorksheetModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-4xl max-h-[90vh] mx-4',
          'bg-[var(--bg-primary)] rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Bài tập (Worksheet)
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {worksheet.questions.length} câu hỏi • {worksheet.totalPoints} điểm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUseWorksheet && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUseWorksheet(worksheet)}
                className="gap-2"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Dùng bài tập này
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </div>
        </div>

        {/* Worksheet viewer */}
        <div className="flex-1 overflow-hidden">
          <WorksheetViewer
            worksheet={worksheet}
            mode="preview"
            showAnswers={true}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default WorksheetModal;

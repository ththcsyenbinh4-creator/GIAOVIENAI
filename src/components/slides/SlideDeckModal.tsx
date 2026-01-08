'use client';

/**
 * SlideDeckModal Component
 *
 * A modal wrapper for SlideViewer that provides a full-screen
 * slide presentation experience for teachers.
 */

import { useEffect } from 'react';
import { X, Presentation, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlideViewer } from './SlideViewer';
import { SlideDeck } from '@/types/domain';
import { cn } from '@/lib/utils';

interface SlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: SlideDeck;
  mode?: 'teacher' | 'student';
  onUseSlides?: (deck: SlideDeck) => void;
}

export function SlideDeckModal({
  isOpen,
  onClose,
  deck,
  mode = 'teacher',
  onUseSlides,
}: SlideDeckModalProps) {
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
          'relative z-10 w-full max-w-6xl max-h-[90vh] mx-4',
          'bg-[var(--bg-primary)] rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mono-100 dark:bg-mono-800">
              <Presentation className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Slide bài giảng
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {deck.slides.length} slides • {deck.lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUseSlides && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUseSlides(deck)}
                className="gap-2"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Dùng bộ slide này
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </div>
        </div>

        {/* Slide viewer */}
        <div className="flex-1 overflow-hidden p-4">
          <SlideViewer
            deck={deck}
            mode={mode}
            onClose={onClose}
          />
        </div>

        {/* Footer with tips */}
        <div className="px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Sử dụng phím mũi tên ← → hoặc Space để chuyển slide • Nhấn F để toàn màn hình • Nhấn Esc để đóng
          </p>
        </div>
      </div>
    </div>
  );
}

export default SlideDeckModal;

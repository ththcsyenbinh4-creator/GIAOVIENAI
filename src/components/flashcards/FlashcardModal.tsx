'use client';

/**
 * FlashcardModal Component
 *
 * A modal wrapper for FlashcardViewer that provides
 * a focused flashcard study experience.
 */

import { useEffect } from 'react';
import { X, Brain, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardViewer } from './FlashcardViewer';
import { FlashcardDeck } from '@/types/domain';
import { cn } from '@/lib/utils';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: FlashcardDeck;
  mode?: 'preview' | 'study';
  onUseFlashcards?: (deck: FlashcardDeck) => void;
}

export function FlashcardModal({
  isOpen,
  onClose,
  deck,
  mode = 'preview',
  onUseFlashcards,
}: FlashcardModalProps) {
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
          'relative z-10 w-full max-w-2xl max-h-[90vh] mx-4',
          'bg-[var(--bg-primary)] rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Flashcards
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {deck.cards.length} thẻ • {deck.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUseFlashcards && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUseFlashcards(deck)}
                className="gap-2"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Dùng bộ flashcard này
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </div>
        </div>

        {/* Flashcard viewer */}
        <div className="flex-1 overflow-hidden">
          <FlashcardViewer
            deck={deck}
            mode={mode}
            onClose={onClose}
          />
        </div>

        {/* Footer with tips */}
        <div className="px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Space/Enter để lật thẻ • ← → để chuyển thẻ • H để xem gợi ý • Esc để đóng
          </p>
        </div>
      </div>
    </div>
  );
}

export default FlashcardModal;

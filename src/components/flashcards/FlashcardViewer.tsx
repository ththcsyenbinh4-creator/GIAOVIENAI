'use client';

/**
 * FlashcardViewer Component
 *
 * A premium flashcard viewer with flip animation, keyboard navigation,
 * and study progress tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Lightbulb,
  X,
  CheckCircle2,
  XCircle,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardDeck, Flashcard, FlashcardReviewResult } from '@/types/domain';
import { cn } from '@/lib/utils';

interface FlashcardViewerProps {
  deck: FlashcardDeck;
  mode: 'preview' | 'study';
  onClose?: () => void;
  onComplete?: (results: StudyResults) => void;
}

interface StudyResults {
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  reviewedCards: Array<{
    cardId: string;
    result: FlashcardReviewResult;
  }>;
}

export function FlashcardViewer({
  deck,
  mode,
  onClose,
  onComplete,
}: FlashcardViewerProps) {
  const [cards, setCards] = useState<Flashcard[]>(deck.cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studyResults, setStudyResults] = useState<StudyResults>({
    totalCards: deck.cards.length,
    correctCount: 0,
    incorrectCount: 0,
    reviewedCards: [],
  });
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex, totalCards]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Shuffle cards
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setStudyResults({
      totalCards: shuffled.length,
      correctCount: 0,
      incorrectCount: 0,
      reviewedCards: [],
    });
    setIsComplete(false);
  };

  // Reset deck
  const resetDeck = () => {
    setCards(deck.cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setStudyResults({
      totalCards: deck.cards.length,
      correctCount: 0,
      incorrectCount: 0,
      reviewedCards: [],
    });
    setIsComplete(false);
  };

  // Record study result
  const recordResult = (result: FlashcardReviewResult) => {
    const isCorrect = result === 'good' || result === 'easy';
    const newResults = {
      ...studyResults,
      correctCount: studyResults.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: studyResults.incorrectCount + (isCorrect ? 0 : 1),
      reviewedCards: [
        ...studyResults.reviewedCards,
        { cardId: currentCard.id, result },
      ],
    };
    setStudyResults(newResults);

    // Check if complete
    if (currentIndex === totalCards - 1) {
      setIsComplete(true);
      onComplete?.(newResults);
    } else {
      goToNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      } else if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint(!showHint);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, flipCard, onClose, showHint]);

  // Render completion screen
  if (isComplete && mode === 'study') {
    const percentage = Math.round(
      (studyResults.correctCount / studyResults.totalCards) * 100
    );

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <Brain className="h-16 w-16 text-green-500 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Hoàn thành!
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Bạn đã ôn tập hết {studyResults.totalCards} flashcard
        </p>

        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{studyResults.correctCount}</div>
            <div className="text-sm text-[var(--text-tertiary)]">Đúng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{studyResults.incorrectCount}</div>
            <div className="text-sm text-[var(--text-tertiary)]">Sai</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
            <div className="text-sm text-[var(--text-tertiary)]">Tỷ lệ đúng</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={resetDeck}>
            <RotateCcw className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Học lại
          </Button>
          <Button variant="primary" onClick={onClose}>
            Hoàn tất
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[300px]">
            {deck.title}
          </h3>
          {deck.subject && (
            <span className="text-xs text-[var(--text-tertiary)] px-2 py-0.5 bg-mono-100 dark:bg-mono-800 rounded">
              {deck.subject}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={shuffleCards}
            title="Trộn thẻ"
          >
            <Shuffle className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={resetDeck}
            title="Bắt đầu lại"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose} title="Đóng">
              <X className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-[var(--bg-soft)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-1">
          <span>Tiến độ</span>
          <span>{currentIndex + 1} / {totalCards}</span>
        </div>
        <div className="h-1.5 bg-mono-200 dark:bg-mono-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className={cn(
            'relative w-full max-w-lg h-72 cursor-pointer perspective-1000'
          )}
          onClick={flipCard}
        >
          {/* Card with flip animation */}
          <div
            className={cn(
              'absolute inset-0 transition-transform duration-500 transform-style-3d',
              isFlipped && 'rotate-y-180'
            )}
          >
            {/* Front */}
            <div
              className={cn(
                'absolute inset-0 backface-hidden',
                'bg-white dark:bg-mono-900 rounded-2xl shadow-lg',
                'border-2',
                currentCard.difficulty === 'easy' && 'border-green-300 dark:border-green-700',
                currentCard.difficulty === 'medium' && 'border-yellow-300 dark:border-yellow-700',
                currentCard.difficulty === 'hard' && 'border-red-300 dark:border-red-700',
                'flex flex-col items-center justify-center p-6'
              )}
            >
              <div className="absolute top-3 right-3">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    currentCard.difficulty === 'easy' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                    currentCard.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                    currentCard.difficulty === 'hard' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  )}
                >
                  {currentCard.difficulty === 'easy' && 'Dễ'}
                  {currentCard.difficulty === 'medium' && 'Trung bình'}
                  {currentCard.difficulty === 'hard' && 'Khó'}
                </span>
              </div>

              {currentCard.category && (
                <div className="absolute top-3 left-3 text-xs text-[var(--text-tertiary)]">
                  {currentCard.category}
                </div>
              )}

              <p className="text-lg text-center text-[var(--text-primary)] font-medium">
                {currentCard.front}
              </p>

              <p className="absolute bottom-3 text-xs text-[var(--text-tertiary)]">
                Nhấn để lật thẻ
              </p>
            </div>

            {/* Back */}
            <div
              className={cn(
                'absolute inset-0 backface-hidden rotate-y-180',
                'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                'rounded-2xl shadow-lg border-2 border-blue-300 dark:border-blue-700',
                'flex flex-col items-center justify-center p-6'
              )}
            >
              <p className="text-lg text-center text-[var(--text-primary)]">
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hint section */}
      {currentCard.hint && (
        <div className="px-4 pb-2">
          {showHint ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-amber-600" strokeWidth={1.75} />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Gợi ý
                </span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {currentCard.hint}
              </p>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(true)}
              className="w-full text-amber-600 hover:text-amber-700"
            >
              <Lightbulb className="h-4 w-4 mr-2" strokeWidth={1.75} />
              Xem gợi ý
            </Button>
          )}
        </div>
      )}

      {/* Study mode buttons */}
      {mode === 'study' && isFlipped && (
        <div className="px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
          <p className="text-xs text-center text-[var(--text-tertiary)] mb-2">
            Bạn trả lời thế nào?
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => recordResult('again')}
              className="flex-1 max-w-[100px] text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" strokeWidth={1.75} />
              Sai
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => recordResult('hard')}
              className="flex-1 max-w-[100px] text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Khó
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => recordResult('good')}
              className="flex-1 max-w-[100px] text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Ổn
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => recordResult('easy')}
              className="flex-1 max-w-[100px] text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" strokeWidth={1.75} />
              Dễ
            </Button>
          </div>
        </div>
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-soft)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Trước
        </Button>

        <div className="flex items-center gap-2">
          {/* Progress dots (only show for small decks) */}
          {totalCards <= 15 && (
            <div className="flex items-center gap-1">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsFlipped(false);
                    setShowHint(false);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-mono-600 dark:bg-mono-300 w-4'
                      : 'bg-mono-300 dark:bg-mono-600 hover:bg-mono-400'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex === totalCards - 1}
          className="gap-1"
        >
          Tiếp
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}

export default FlashcardViewer;

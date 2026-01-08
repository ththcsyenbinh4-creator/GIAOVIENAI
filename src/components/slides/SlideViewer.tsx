'use client';

/**
 * SlideViewer Component
 *
 * A premium in-app slide viewer for teaching content.
 * Supports teacher and student modes with keyboard navigation.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  List,
  X,
  Lightbulb,
  MessageSquare,
  Quote,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlideDeck, Slide, SlideBlock } from '@/types/domain';
import { cn } from '@/lib/utils';

interface SlideViewerProps {
  deck: SlideDeck;
  mode: 'teacher' | 'student';
  initialSlideIndex?: number;
  fullscreen?: boolean;
  onClose?: () => void;
}

export function SlideViewer({
  deck,
  mode,
  initialSlideIndex = 0,
  fullscreen: initialFullscreen = false,
  onClose,
}: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showNotes, setShowNotes] = useState(mode === 'teacher');

  const totalSlides = deck.slides.length;
  const currentSlide = deck.slides[currentIndex];

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, totalSlides]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
      setShowThumbnails(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (onClose) {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, isFullscreen, onClose]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--bg-primary)]',
        isFullscreen
          ? 'fixed inset-0 z-50'
          : 'relative rounded-2xl border border-[var(--border-default)] overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[300px]">
            {deck.lessonTitle}
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
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="Danh sách slide"
          >
            <List className="h-4 w-4" strokeWidth={1.75} />
          </Button>

          {mode === 'teacher' && currentSlide?.notesForTeacher && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowNotes(!showNotes)}
              title="Ghi chú giáo viên"
              className={showNotes ? 'bg-mono-200 dark:bg-mono-700' : ''}
            >
              <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
            )}
          </Button>

          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose} title="Đóng">
              <X className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnail sidebar */}
        {showThumbnails && (
          <div className="w-48 border-r border-[var(--border-default)] bg-[var(--bg-soft)] overflow-y-auto p-2 space-y-2">
            {deck.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-full p-2 rounded-lg text-left transition-all',
                  'hover:bg-mono-200 dark:hover:bg-mono-700',
                  index === currentIndex
                    ? 'bg-mono-200 dark:bg-mono-700 ring-2 ring-mono-400'
                    : 'bg-mono-100 dark:bg-mono-800'
                )}
              >
                <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Slide {index + 1}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">
                  {slide.title || getSlidePreview(slide)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Slide content */}
        <div className="flex-1 flex flex-col">
          <div
            className={cn(
              'flex-1 flex items-center justify-center p-8 overflow-auto',
              isFullscreen ? 'min-h-[80vh]' : 'min-h-[400px]'
            )}
          >
            <div
              className={cn(
                'w-full max-w-4xl bg-white dark:bg-mono-900 rounded-2xl shadow-lg',
                'border border-mono-200 dark:border-mono-700',
                isFullscreen ? 'p-12' : 'p-8'
              )}
            >
              <SlideContent slide={currentSlide} isFullscreen={isFullscreen} />
            </div>
          </div>

          {/* Teacher notes */}
          {mode === 'teacher' && showNotes && currentSlide?.notesForTeacher && (
            <div className="border-t border-[var(--border-default)] bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Ghi chú cho giáo viên
                </span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {currentSlide.notesForTeacher}
              </p>
            </div>
          )}
        </div>
      </div>

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
          <span className="text-sm text-[var(--text-secondary)]">
            {currentIndex + 1} / {totalSlides}
          </span>

          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {deck.slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-mono-600 dark:bg-mono-300 w-4'
                    : 'bg-mono-300 dark:bg-mono-600 hover:bg-mono-400'
                )}
              />
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex === totalSlides - 1}
          className="gap-1"
        >
          Tiếp
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}

/**
 * Render slide content based on blocks
 */
function SlideContent({
  slide,
  isFullscreen,
}: {
  slide: Slide;
  isFullscreen: boolean;
}) {
  return (
    <div className="space-y-6">
      {slide.title && (
        <h2
          className={cn(
            'font-semibold text-[var(--text-primary)] mb-4',
            isFullscreen ? 'text-3xl' : 'text-2xl'
          )}
        >
          {slide.title}
        </h2>
      )}

      {slide.blocks.map((block, index) => (
        <SlideBlockRenderer
          key={index}
          block={block}
          isFullscreen={isFullscreen}
        />
      ))}
    </div>
  );
}

/**
 * Render individual slide block
 */
function SlideBlockRenderer({
  block,
  isFullscreen,
}: {
  block: SlideBlock;
  isFullscreen: boolean;
}) {
  const textSize = isFullscreen ? 'text-xl' : 'text-base';
  const headingSize = isFullscreen ? 'text-3xl' : 'text-2xl';
  const subheadingSize = isFullscreen ? 'text-xl' : 'text-lg';

  switch (block.type) {
    case 'title':
      return (
        <h1 className={cn(headingSize, 'font-bold text-[var(--text-primary)]')}>
          {block.text}
        </h1>
      );

    case 'subtitle':
      return (
        <h2 className={cn(subheadingSize, 'font-medium text-[var(--text-secondary)]')}>
          {block.text}
        </h2>
      );

    case 'paragraph':
      return (
        <p className={cn(textSize, 'text-[var(--text-primary)] leading-relaxed')}>
          {block.text}
        </p>
      );

    case 'bullet-list':
      return (
        <ul className={cn(textSize, 'space-y-2 text-[var(--text-primary)]')}>
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mono-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'numbered-list':
      return (
        <ol className={cn(textSize, 'space-y-2 text-[var(--text-primary)]')}>
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-medium text-[var(--text-secondary)] min-w-[1.5rem]">
                {i + 1}.
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case 'quote':
      return (
        <div className="border-l-4 border-mono-300 dark:border-mono-600 pl-4 py-2">
          <div className="flex items-start gap-2">
            <Quote className="h-5 w-5 text-[var(--text-tertiary)] flex-shrink-0 mt-1" strokeWidth={1.75} />
            <div>
              <p className={cn(textSize, 'italic text-[var(--text-primary)]')}>
                {block.text}
              </p>
              {block.author && (
                <p className="mt-2 text-sm text-[var(--text-tertiary)]">
                  — {block.author}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case 'exercise':
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Câu hỏi thảo luận
            </span>
          </div>
          <p className={cn(textSize, 'text-blue-800 dark:text-blue-200')}>
            {block.prompt}
          </p>
          {block.hint && (
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 italic">
              Gợi ý: {block.hint}
            </p>
          )}
        </div>
      );

    case 'image-suggestion':
      return (
        <div className="bg-mono-100 dark:bg-mono-800 border border-dashed border-mono-300 dark:border-mono-600 rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            [Gợi ý hình ảnh: {block.prompt}]
          </p>
        </div>
      );

    case 'key-point':
      return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className={cn(textSize, 'font-medium text-amber-800 dark:text-amber-200')}>
              {block.text}
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/**
 * Get preview text from first block of slide
 */
function getSlidePreview(slide: Slide): string {
  const firstBlock = slide.blocks[0];
  if (!firstBlock) return 'Slide trống';

  switch (firstBlock.type) {
    case 'title':
    case 'subtitle':
    case 'paragraph':
    case 'key-point':
      return firstBlock.text.slice(0, 50);
    case 'bullet-list':
    case 'numbered-list':
      return firstBlock.items[0]?.slice(0, 50) || 'Danh sách';
    case 'quote':
      return firstBlock.text.slice(0, 50);
    case 'exercise':
      return firstBlock.prompt.slice(0, 50);
    default:
      return 'Slide';
  }
}

export default SlideViewer;

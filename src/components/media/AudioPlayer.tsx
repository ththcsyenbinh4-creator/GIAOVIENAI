'use client';

/**
 * AudioPlayer Component
 *
 * A minimal, premium audio player for educational content.
 * Supports play/pause, progress bar, and download functionality.
 */

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceMode } from '@/types/domain';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  mode: VoiceMode;
  label?: string;
  compact?: boolean;
  onDownload?: () => void;
}

const modeLabels: Record<VoiceMode, string> = {
  'lesson-summary': 'Tóm tắt bài học',
  'study-guide': 'Hướng dẫn ôn tập',
  'answer-explanation': 'Giải thích đáp án',
};

export function AudioPlayer({
  src,
  mode,
  label,
  compact = false,
  onDownload,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Format time as MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download behavior
    const link = document.createElement('a');
    link.href = src;
    link.download = `${modeLabels[mode]}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Không thể phát audio');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Compact version for inline display
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <audio ref={audioRef} src={src} preload="metadata" />
        <button
          onClick={togglePlay}
          disabled={isLoading || !!error}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-all',
            'bg-mono-100 dark:bg-mono-800 hover:bg-mono-200 dark:hover:bg-mono-700',
            'text-[var(--text-primary)]',
            (isLoading || error) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Play className="h-4 w-4 ml-0.5" strokeWidth={1.75} />
          )}
        </button>
        {label && (
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        )}
      </div>
    );
  }

  // Full player version
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-soft)] p-4">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mono-200 dark:bg-mono-700">
            <Volume2 className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {label || modeLabels[mode]}
            </p>
            {!isLoading && !error && (
              <p className="text-xs text-[var(--text-tertiary)]">
                {formatTime(duration)}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDownload}
          title="Tải xuống"
        >
          <Download className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Player controls */}
      {!error && (
        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-all',
              'bg-mono-900 dark:bg-mono-100 hover:bg-mono-800 dark:hover:bg-mono-200',
              'text-white dark:text-mono-900',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Play className="h-5 w-5 ml-0.5" strokeWidth={1.75} />
            )}
          </button>

          {/* Progress bar */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)] w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              className="flex-1 h-2 bg-mono-200 dark:bg-mono-700 rounded-full cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-mono-600 dark:bg-mono-400 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-xs text-[var(--text-tertiary)] w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;

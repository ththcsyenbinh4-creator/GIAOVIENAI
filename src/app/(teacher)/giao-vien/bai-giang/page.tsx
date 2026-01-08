'use client';

/**
 * Teacher Lesson Flow Page
 *
 * Main page for teachers to create and manage 45-minute lesson packs.
 * Integrates LessonBuilder and LessonPlayer components.
 */

import { useState } from 'react';
import { ArrowLeft, Plus, Play, BookOpen, Clock, Calendar, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LessonBuilder } from '@/components/lessons/LessonBuilder';
import { LessonPlayer } from '@/components/lessons/LessonPlayer';
import { Lesson } from '@/types/domain';
import { cn } from '@/lib/utils';

// Mock saved lessons for demo
const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Phân số - Cộng trừ phân số',
    description: 'Bài học về cách cộng trừ phân số cùng mẫu và khác mẫu',
    subject: 'Toán',
    gradeLevel: 'Lớp 4',
    totalDurationMinutes: 45,
    steps: [
      { id: '1', type: 'intro', title: 'Giới thiệu', durationMinutes: 3, order: 0, isCompleted: false },
      { id: '2', type: 'slide', title: 'Nội dung chính', durationMinutes: 15, order: 1, isCompleted: false },
      { id: '3', type: 'flashcard', title: 'Ôn tập', durationMinutes: 7, order: 2, isCompleted: false },
      { id: '4', type: 'worksheet', title: 'Bài tập', durationMinutes: 12, order: 3, isCompleted: false },
      { id: '5', type: 'discussion', title: 'Thảo luận', durationMinutes: 5, order: 4, isCompleted: false },
      { id: '6', type: 'summary', title: 'Tổng kết', durationMinutes: 3, order: 5, isCompleted: false },
    ],
    objectives: [
      'Hiểu khái niệm phân số',
      'Biết cách cộng trừ phân số cùng mẫu',
      'Biết cách quy đồng mẫu số',
    ],
    status: 'ready',
    currentStepIndex: 0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lesson-2',
    title: 'Truyện Kiều - Giới thiệu tác phẩm',
    description: 'Tìm hiểu về tác giả Nguyễn Du và tác phẩm Truyện Kiều',
    subject: 'Ngữ văn',
    gradeLevel: 'Lớp 10',
    totalDurationMinutes: 45,
    steps: [
      { id: '1', type: 'intro', title: 'Giới thiệu', durationMinutes: 5, order: 0, isCompleted: false },
      { id: '2', type: 'slide', title: 'Cuộc đời Nguyễn Du', durationMinutes: 12, order: 1, isCompleted: false },
      { id: '3', type: 'slide', title: 'Tác phẩm Truyện Kiều', durationMinutes: 12, order: 2, isCompleted: false },
      { id: '4', type: 'flashcard', title: 'Ôn tập kiến thức', durationMinutes: 8, order: 3, isCompleted: false },
      { id: '5', type: 'discussion', title: 'Thảo luận', durationMinutes: 5, order: 4, isCompleted: false },
      { id: '6', type: 'summary', title: 'Tổng kết', durationMinutes: 3, order: 5, isCompleted: false },
    ],
    objectives: [
      'Nắm được tiểu sử Nguyễn Du',
      'Hiểu bối cảnh ra đời Truyện Kiều',
      'Biết giá trị văn học của tác phẩm',
    ],
    status: 'ready',
    currentStepIndex: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

type ViewMode = 'list' | 'builder' | 'player';

export default function LessonFlowPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const handleCreateNew = () => {
    setActiveLesson(null);
    setViewMode('builder');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setViewMode('builder');
  };

  const handleStartTeaching = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setViewMode('player');
  };

  const handleSaveLesson = (lesson: Lesson) => {
    if (activeLesson) {
      // Update existing
      setLessons(lessons.map((l) => (l.id === lesson.id ? lesson : l)));
    } else {
      // Add new
      setLessons([lesson, ...lessons]);
    }
    setActiveLesson(lesson);
  };

  const handleLessonComplete = (lesson: Lesson) => {
    setLessons(lessons.map((l) => (l.id === lesson.id ? lesson : l)));
    setViewMode('list');
    setActiveLesson(null);
  };

  const handleBack = () => {
    setViewMode('list');
    setActiveLesson(null);
  };

  // Render based on view mode
  if (viewMode === 'builder') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon-sm" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  {activeLesson ? 'Chỉnh sửa bài giảng' : 'Tạo bài giảng mới'}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Thiết kế bài giảng 45 phút với AI
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="h-[calc(100vh-73px)]">
          <LessonBuilder
            initialLesson={activeLesson || undefined}
            onSave={handleSaveLesson}
            onStartTeaching={handleStartTeaching}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'player' && activeLesson) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <LessonPlayer
          lesson={activeLesson}
          onClose={handleBack}
          onComplete={handleLessonComplete}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/giao-vien">
                <Button variant="ghost" size="icon-sm">
                  <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  Bài giảng 45 phút
                </h1>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Quản lý và dạy các bài giảng đầy đủ
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleCreateNew}
              leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
            >
              Tạo bài giảng mới
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {lessons.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Chưa có bài giảng nào
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Tạo bài giảng 45 phút đầu tiên với AI
            </p>
            <Button
              variant="primary"
              onClick={handleCreateNew}
              leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
            >
              Tạo bài giảng mới
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onEdit={() => handleEditLesson(lesson)}
                onTeach={() => handleStartTeaching(lesson)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LessonCard({
  lesson,
  onEdit,
  onTeach,
}: {
  lesson: Lesson;
  onEdit: () => void;
  onTeach: () => void;
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Bản nháp',
    ready: 'Sẵn sàng',
    in_progress: 'Đang dạy',
    completed: 'Hoàn thành',
  };

  return (
    <div className="bg-white dark:bg-mono-900 rounded-2xl border border-[var(--border-default)] overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                statusColors[lesson.status]
              )}
            >
              {statusLabels[lesson.status]}
            </span>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>

        <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
            {lesson.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-[var(--text-tertiary)]">
          {lesson.subject && (
            <span className="px-2 py-0.5 bg-mono-100 dark:bg-mono-800 rounded-full">
              {lesson.subject}
            </span>
          )}
          {lesson.gradeLevel && (
            <span className="px-2 py-0.5 bg-mono-100 dark:bg-mono-800 rounded-full">
              {lesson.gradeLevel}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-[var(--bg-soft)] border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" strokeWidth={1.75} />
              <span>{lesson.totalDurationMinutes} phút</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
              <span>{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Sửa
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onTeach}
              leftIcon={<Play className="h-4 w-4" strokeWidth={1.75} />}
            >
              Dạy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

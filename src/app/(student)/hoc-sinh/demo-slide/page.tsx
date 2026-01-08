'use client';

/**
 * Student Demo Slide Page
 *
 * A demonstration page showing how students can view teaching slides
 * in the app without downloading any files.
 */

import { useState } from 'react';
import { ArrowLeft, Presentation } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SlideViewer } from '@/components/slides/SlideViewer';
import { SlideDeck } from '@/types/domain';

// Mock slide deck for demonstration
const mockSlideDeck: SlideDeck = {
  id: 'demo-deck-1',
  lessonTitle: 'Phương trình bậc hai',
  gradeLevel: 'Lớp 9',
  subject: 'Toán học',
  createdAt: new Date().toISOString(),
  slides: [
    {
      id: 'slide-1',
      title: 'Phương trình bậc hai',
      blocks: [
        { type: 'title', text: 'Phương trình bậc hai' },
        { type: 'subtitle', text: 'Toán 9 - Chương 4' },
        {
          type: 'bullet-list',
          items: [
            'Hiểu khái niệm phương trình bậc hai',
            'Biết cách giải phương trình bậc hai',
            'Áp dụng vào bài toán thực tế',
          ],
        },
      ],
      notesForTeacher: 'Giới thiệu bài học, nêu mục tiêu rõ ràng',
    },
    {
      id: 'slide-2',
      title: 'Định nghĩa',
      blocks: [
        { type: 'title', text: 'Phương trình bậc hai là gì?' },
        {
          type: 'paragraph',
          text: 'Phương trình bậc hai là phương trình có dạng ax² + bx + c = 0, trong đó a, b, c là các số thực và a ≠ 0.',
        },
        {
          type: 'quote',
          text: 'ax² + bx + c = 0 (a ≠ 0)',
        },
        {
          type: 'bullet-list',
          items: [
            'a là hệ số của x² (hệ số bậc hai)',
            'b là hệ số của x (hệ số bậc nhất)',
            'c là hằng số tự do',
          ],
        },
      ],
    },
    {
      id: 'slide-3',
      title: 'Ví dụ',
      blocks: [
        { type: 'title', text: 'Ví dụ phương trình bậc hai' },
        {
          type: 'numbered-list',
          items: [
            'x² - 5x + 6 = 0 (a=1, b=-5, c=6)',
            '2x² + 3x - 1 = 0 (a=2, b=3, c=-1)',
            '-x² + 4 = 0 (a=-1, b=0, c=4)',
          ],
        },
        {
          type: 'exercise',
          prompt: 'Hãy xác định các hệ số a, b, c trong phương trình: 3x² - 7x + 2 = 0',
          hint: 'So sánh với dạng tổng quát ax² + bx + c = 0',
        },
      ],
    },
    {
      id: 'slide-4',
      title: 'Công thức nghiệm',
      blocks: [
        { type: 'title', text: 'Công thức nghiệm' },
        {
          type: 'key-point',
          text: 'Biệt thức Delta: Δ = b² - 4ac',
        },
        {
          type: 'bullet-list',
          items: [
            'Nếu Δ > 0: Phương trình có 2 nghiệm phân biệt',
            'Nếu Δ = 0: Phương trình có nghiệm kép',
            'Nếu Δ < 0: Phương trình vô nghiệm',
          ],
        },
        {
          type: 'quote',
          text: 'x = (-b ± √Δ) / 2a',
        },
      ],
      notesForTeacher: 'Nhấn mạnh tầm quan trọng của Delta trong việc xác định số nghiệm',
    },
    {
      id: 'slide-5',
      title: 'Bài tập thực hành',
      blocks: [
        { type: 'title', text: 'Bài tập thực hành' },
        {
          type: 'exercise',
          prompt: 'Giải phương trình: x² - 5x + 6 = 0',
          hint: 'Tính Delta trước, sau đó áp dụng công thức nghiệm',
        },
        {
          type: 'numbered-list',
          items: [
            'Bước 1: Xác định a, b, c',
            'Bước 2: Tính Δ = b² - 4ac',
            'Bước 3: Áp dụng công thức nghiệm',
          ],
        },
      ],
    },
    {
      id: 'slide-6',
      title: 'Tóm tắt',
      blocks: [
        { type: 'title', text: 'Tóm tắt bài học' },
        {
          type: 'bullet-list',
          items: [
            'Phương trình bậc hai có dạng ax² + bx + c = 0',
            'Biệt thức Δ = b² - 4ac quyết định số nghiệm',
            'Công thức nghiệm: x = (-b ± √Δ) / 2a',
          ],
        },
        {
          type: 'key-point',
          text: 'Luôn kiểm tra điều kiện a ≠ 0 trước khi giải!',
        },
        {
          type: 'exercise',
          prompt: 'Về nhà: Giải các phương trình trong SGK trang 45, bài 1-5',
        },
      ],
    },
  ],
};

export default function DemoSlidePage() {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/hoc-sinh">
                <Button variant="ghost" size="icon-sm">
                  <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                  Demo Slide Bài giảng
                </h1>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Xem slide trực tiếp trong app
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFullscreen(true)}
              leftIcon={<Presentation className="h-4 w-4" strokeWidth={1.75} />}
            >
              Toàn màn hình
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-soft)] border border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mono-100 dark:bg-mono-800">
              <Presentation className="h-6 w-6 text-[var(--text-secondary)]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">
                {mockSlideDeck.lessonTitle}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {mockSlideDeck.subject} • {mockSlideDeck.gradeLevel} • {mockSlideDeck.slides.length} slides
              </p>
            </div>
          </div>
        </div>

        {/* Slide Viewer */}
        <div className="h-[600px]">
          <SlideViewer
            deck={mockSlideDeck}
            mode="student"
            fullscreen={showFullscreen}
            onClose={() => setShowFullscreen(false)}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
          <h3 className="font-medium text-[var(--text-primary)] mb-2">
            Hướng dẫn sử dụng
          </h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>• Nhấn mũi tên ← → hoặc Space để chuyển slide</li>
            <li>• Nhấn F để xem toàn màn hình</li>
            <li>• Click vào số slide bên trái để nhảy đến slide bất kỳ</li>
            <li>• Nhấn Esc để thoát chế độ toàn màn hình</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

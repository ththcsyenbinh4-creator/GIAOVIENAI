'use client';

/**
 * Student Demo Lesson Page
 *
 * A demonstration page showing how students can participate in a lesson flow.
 * Includes a mock lesson with various activities.
 */

import { useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Target, ChevronRight, CheckCircle2, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LessonPlayer } from '@/components/lessons/LessonPlayer';
import { Lesson, LessonStepType } from '@/types/domain';
import { cn } from '@/lib/utils';

// Mock lesson for student demo
const MOCK_STUDENT_LESSON: Lesson = {
  id: 'demo-student-lesson',
  title: 'Phân số - Cộng trừ phân số cùng mẫu',
  description: 'Học cách cộng trừ các phân số có cùng mẫu số',
  subject: 'Toán',
  gradeLevel: 'Lớp 4',
  totalDurationMinutes: 45,
  steps: [
    {
      id: 'step-1',
      type: 'intro',
      title: 'Giới thiệu bài học',
      durationMinutes: 3,
      order: 0,
      isCompleted: false,
      description: `Chào mừng các em đến với bài học về phân số!

Hôm nay chúng ta sẽ học cách cộng và trừ các phân số có cùng mẫu số.

Đây là kiến thức nền tảng quan trọng, giúp các em giải quyết nhiều bài toán trong thực tế như chia bánh, tính phần trăm, và nhiều ứng dụng khác.`,
      notes: 'Khởi động với câu hỏi: Em đã từng chia bánh chưa?',
    },
    {
      id: 'step-2',
      type: 'slide',
      title: 'Ôn tập khái niệm phân số',
      durationMinutes: 8,
      order: 1,
      isCompleted: false,
      slideDeck: {
        id: 'deck-1',
        lessonTitle: 'Phân số - Cộng trừ phân số',
        subject: 'Toán',
        gradeLevel: 'Lớp 4',
        slides: [
          {
            id: 'slide-1',
            title: 'Phân số là gì?',
            blocks: [
              { type: 'title', text: 'Phân số là gì?' },
              { type: 'paragraph', text: 'Phân số là cách biểu diễn một phần của một đơn vị trọn vẹn.' },
              { type: 'key-point', text: 'Tử số / Mẫu số = Phân số' },
              { type: 'bullet-list', items: [
                'Tử số: Số phần lấy ra',
                'Mẫu số: Tổng số phần bằng nhau',
                'Ví dụ: 3/4 nghĩa là lấy 3 phần trong 4 phần bằng nhau'
              ]}
            ],
            notesForTeacher: 'Cho học sinh xem hình ảnh minh họa về phân số'
          },
          {
            id: 'slide-2',
            title: 'Phân số cùng mẫu',
            blocks: [
              { type: 'title', text: 'Phân số cùng mẫu là gì?' },
              { type: 'paragraph', text: 'Các phân số cùng mẫu là các phân số có mẫu số giống nhau.' },
              { type: 'bullet-list', items: [
                '1/5 và 2/5 là hai phân số cùng mẫu (mẫu số đều là 5)',
                '3/8 và 7/8 là hai phân số cùng mẫu (mẫu số đều là 8)',
                '2/3 và 4/7 KHÔNG phải phân số cùng mẫu (mẫu số khác nhau)'
              ]},
              { type: 'key-point', text: 'Chỉ có thể cộng/trừ trực tiếp khi cùng mẫu!' }
            ]
          },
          {
            id: 'slide-3',
            title: 'Cách cộng phân số cùng mẫu',
            blocks: [
              { type: 'title', text: 'Cộng phân số cùng mẫu' },
              { type: 'key-point', text: 'Giữ nguyên mẫu, cộng tử số' },
              { type: 'paragraph', text: 'Ví dụ: 2/7 + 3/7 = (2+3)/7 = 5/7' },
              { type: 'exercise', prompt: 'Hãy tính: 1/9 + 4/9 = ?', hint: 'Giữ nguyên mẫu số 9, cộng tử số' }
            ]
          },
          {
            id: 'slide-4',
            title: 'Cách trừ phân số cùng mẫu',
            blocks: [
              { type: 'title', text: 'Trừ phân số cùng mẫu' },
              { type: 'key-point', text: 'Giữ nguyên mẫu, trừ tử số' },
              { type: 'paragraph', text: 'Ví dụ: 5/8 - 2/8 = (5-2)/8 = 3/8' },
              { type: 'exercise', prompt: 'Hãy tính: 7/10 - 3/10 = ?', hint: 'Giữ nguyên mẫu số 10, trừ tử số' }
            ]
          }
        ],
        createdAt: new Date().toISOString(),
      }
    },
    {
      id: 'step-3',
      type: 'flashcard',
      title: 'Ôn tập với thẻ ghi nhớ',
      durationMinutes: 7,
      order: 2,
      isCompleted: false,
      flashcardDeck: {
        id: 'fc-deck-1',
        title: 'Flashcards - Phân số cùng mẫu',
        subject: 'Toán',
        gradeLevel: 'Lớp 4',
        cards: [
          {
            id: 'fc-1',
            front: '2/5 + 1/5 = ?',
            back: '3/5\n\nGiữ nguyên mẫu 5, cộng tử: 2+1=3',
            difficulty: 'easy',
            category: 'Phép cộng',
          },
          {
            id: 'fc-2',
            front: '7/9 - 4/9 = ?',
            back: '3/9 = 1/3\n\nGiữ nguyên mẫu 9, trừ tử: 7-4=3\nRút gọn: 3/9 = 1/3',
            difficulty: 'medium',
            category: 'Phép trừ',
          },
          {
            id: 'fc-3',
            front: '1/4 + 2/4 + 1/4 = ?',
            back: '4/4 = 1\n\nCộng các tử số: 1+2+1=4\nMẫu giữ nguyên: 4\n4/4 = 1 (một đơn vị)',
            difficulty: 'medium',
            category: 'Phép cộng',
          },
          {
            id: 'fc-4',
            front: 'Khi nào gọi là phân số cùng mẫu?',
            back: 'Khi hai phân số có mẫu số giống nhau.\n\nVí dụ: 3/7 và 5/7 là phân số cùng mẫu vì đều có mẫu số là 7.',
            difficulty: 'easy',
            category: 'Khái niệm',
          },
          {
            id: 'fc-5',
            front: '5/6 - 5/6 = ?',
            back: '0/6 = 0\n\nBất kỳ số nào trừ chính nó đều bằng 0.',
            difficulty: 'easy',
            category: 'Phép trừ',
          },
        ],
        createdAt: new Date().toISOString(),
      }
    },
    {
      id: 'step-4',
      type: 'worksheet',
      title: 'Bài tập thực hành',
      durationMinutes: 12,
      order: 3,
      isCompleted: false,
      worksheet: {
        id: 'ws-1',
        title: 'Bài tập - Cộng trừ phân số',
        subject: 'Toán',
        gradeLevel: 'Lớp 4',
        instructions: 'Làm các bài tập sau. Nhớ rút gọn kết quả nếu có thể.',
        totalPoints: 10,
        estimatedMinutes: 12,
        questions: [
          {
            id: 'q1',
            type: 'mcq',
            order: 0,
            points: 1,
            question: '3/8 + 2/8 = ?',
            choices: ['5/16', '5/8', '1/8', '6/8'],
            correctAnswerIndex: 1,
            explanation: 'Giữ nguyên mẫu 8, cộng tử: 3+2=5. Kết quả: 5/8'
          },
          {
            id: 'q2',
            type: 'mcq',
            order: 1,
            points: 1,
            question: '9/10 - 3/10 = ?',
            choices: ['6/10', '6/0', '12/10', '6/20'],
            correctAnswerIndex: 0,
            explanation: 'Giữ nguyên mẫu 10, trừ tử: 9-3=6. Kết quả: 6/10 (có thể rút gọn thành 3/5)'
          },
          {
            id: 'q3',
            type: 'fill-blank',
            order: 2,
            points: 2,
            question: 'Điền số thích hợp: 4/7 + __/7 = 6/7',
            blanks: ['2'],
            explanation: '6-4=2, nên cần điền 2/7'
          },
          {
            id: 'q4',
            type: 'true-false',
            order: 3,
            points: 1,
            question: '1/5 + 4/5 = 5/10',
            isTrue: false,
            explanation: '1/5 + 4/5 = 5/5 = 1, không phải 5/10'
          },
          {
            id: 'q5',
            type: 'short-answer',
            order: 4,
            points: 2,
            question: 'Tính: 2/9 + 4/9 + 1/9 = ?',
            expectedAnswer: '7/9',
            explanation: 'Cộng các tử số: 2+4+1=7, mẫu giữ nguyên: 9'
          },
          {
            id: 'q6',
            type: 'mcq',
            order: 5,
            points: 1,
            question: 'Bạn An ăn 2/6 cái bánh, bạn Bình ăn 3/6 cái bánh. Cả hai bạn ăn bao nhiêu phần bánh?',
            choices: ['5/12', '5/6', '1 cái', '6/6'],
            correctAnswerIndex: 1,
            explanation: '2/6 + 3/6 = 5/6 cái bánh'
          },
          {
            id: 'q7',
            type: 'ordering',
            order: 6,
            points: 2,
            question: 'Sắp xếp các bước tính phép cộng phân số cùng mẫu theo thứ tự đúng:',
            orderItems: [
              'Xác định hai phân số có cùng mẫu số',
              'Giữ nguyên mẫu số',
              'Cộng các tử số với nhau',
              'Viết kết quả và rút gọn nếu cần'
            ],
            explanation: 'Đây là quy trình chuẩn để cộng phân số cùng mẫu'
          }
        ],
        createdAt: new Date().toISOString(),
      }
    },
    {
      id: 'step-5',
      type: 'discussion',
      title: 'Thảo luận nhóm',
      durationMinutes: 5,
      order: 4,
      isCompleted: false,
      description: 'Thảo luận với bạn bên cạnh về các câu hỏi sau:',
      instructions: `1. Tại sao khi cộng/trừ phân số cùng mẫu, ta giữ nguyên mẫu số?

2. Trong thực tế, em có thể áp dụng cộng trừ phân số vào việc gì? (Ví dụ: chia pizza, tính thời gian...)

3. Em có cách nào để nhớ quy tắc cộng trừ phân số cùng mẫu không?`,
      notes: 'Khuyến khích học sinh chia sẻ ý tưởng thực tế',
    },
    {
      id: 'step-6',
      type: 'summary',
      title: 'Tổng kết bài học',
      durationMinutes: 3,
      order: 5,
      isCompleted: false,
      description: `Hôm nay chúng ta đã học:

• Phân số cùng mẫu là các phân số có mẫu số giống nhau
• Cộng phân số cùng mẫu: Giữ nguyên mẫu, cộng các tử số
• Trừ phân số cùng mẫu: Giữ nguyên mẫu, trừ các tử số
• Luôn nhớ rút gọn kết quả nếu có thể

Bài học sau: Cộng trừ phân số khác mẫu`,
      notes: 'Nhắc học sinh về bài tập về nhà',
    },
  ],
  objectives: [
    'Hiểu khái niệm phân số cùng mẫu',
    'Thực hiện được phép cộng phân số cùng mẫu',
    'Thực hiện được phép trừ phân số cùng mẫu',
    'Áp dụng vào bài tập thực tế',
  ],
  prerequisites: [
    'Biết đọc và viết phân số',
    'Hiểu ý nghĩa của tử số và mẫu số',
  ],
  materials: [
    'Vở ghi chép',
    'Bút chì và thước kẻ',
  ],
  status: 'ready',
  currentStepIndex: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const STEP_TYPE_ICONS: Record<LessonStepType, string> = {
  intro: '📖',
  slide: '🖥️',
  audio: '🔊',
  flashcard: '🧠',
  worksheet: '📝',
  discussion: '💬',
  break: '☕',
  summary: '✅',
  homework: '🏠',
};

export default function DemoLessonPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <LessonPlayer
          lesson={MOCK_STUDENT_LESSON}
          onClose={() => setIsPlaying(false)}
          onComplete={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/hoc-sinh">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                Demo Bài giảng
              </h1>
              <p className="text-sm text-[var(--text-tertiary)]">
                Trải nghiệm bài học 45 phút
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Lesson Card */}
        <div className="bg-white dark:bg-mono-900 rounded-2xl border border-[var(--border-default)] overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    {MOCK_STUDENT_LESSON.subject}
                  </span>
                  <span className="px-2 py-0.5 bg-mono-100 dark:bg-mono-800 text-[var(--text-tertiary)] text-xs rounded-full">
                    {MOCK_STUDENT_LESSON.gradeLevel}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {MOCK_STUDENT_LESSON.title}
                </h2>
                <p className="text-[var(--text-secondary)]">
                  {MOCK_STUDENT_LESSON.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" strokeWidth={1.75} />
                <span>{MOCK_STUDENT_LESSON.totalDurationMinutes} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" strokeWidth={1.75} />
                <span>{MOCK_STUDENT_LESSON.steps.length} hoạt động</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="px-6 py-4 bg-[var(--bg-soft)] border-t border-[var(--border-default)]">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setIsPlaying(true)}
              leftIcon={<Play className="h-5 w-5" strokeWidth={1.75} />}
            >
              Bắt đầu học
            </Button>
          </div>
        </div>

        {/* Objectives */}
        {MOCK_STUDENT_LESSON.objectives && (
          <div className="bg-white dark:bg-mono-900 rounded-2xl border border-[var(--border-default)] p-6 mb-8">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" strokeWidth={1.75} />
              Mục tiêu bài học
            </h3>
            <ul className="space-y-3">
              {MOCK_STUDENT_LESSON.objectives.map((obj, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="text-[var(--text-secondary)]">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lesson Steps Overview */}
        <div className="bg-white dark:bg-mono-900 rounded-2xl border border-[var(--border-default)] p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            Các hoạt động trong bài
          </h3>
          <div className="space-y-3">
            {MOCK_STUDENT_LESSON.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-soft)] hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-mono-900 text-lg">
                  {STEP_TYPE_ICONS[step.type]}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{step.title}</p>
                  <p className="text-sm text-[var(--text-tertiary)]">{step.durationMinutes} phút</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </div>

        {/* Prerequisites */}
        {MOCK_STUDENT_LESSON.prerequisites && MOCK_STUDENT_LESSON.prerequisites.length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              Kiến thức cần có trước
            </h4>
            <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
              {MOCK_STUDENT_LESSON.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

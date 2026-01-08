'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Target,
  CheckCircle2,
  Circle,
  ExternalLink,
  Play,
  FileText,
  BookOpen,
  Users,
  MessageSquare,
  Award,
  ArrowRight,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Types
type DemoStepLink = {
  label: string;
  href: string;
};

type DemoSection = {
  id: string;
  title: string;
  durationMinutes: number;
  goal: string;
  script: string;
  bullets: string[];
  links: DemoStepLink[];
  icon: React.ElementType;
  color: string;
};

// Demo Script Data
const demoSections: DemoSection[] = [
  {
    id: 'intro',
    title: 'Giới thiệu',
    durationMinutes: 2,
    goal: 'Gây ấn tượng ban đầu',
    icon: Play,
    color: 'blue',
    script: `"Chào thầy/cô, hôm nay tôi sẽ demo Classroom AI - công cụ giúp giáo viên tạo một tiết dạy 45 phút hoàn chỉnh từ file tài liệu chỉ trong 5 phút. Tôi sẽ đi qua: dashboard giáo viên, cách AI xử lý tài liệu, tạo bài giảng 45 phút, dạy thử với LessonPlayer và cuối cùng là góc nhìn của học sinh."`,
    bullets: [
      'Giới thiệu ngắn gọn sản phẩm',
      'Nhấn mạnh "từ file tài liệu → thành tiết dạy 45 phút"',
      'Cho biết demo sẽ chạy trên dữ liệu thật / bài mẫu',
      'Show dashboard để thấy tổng quan hệ thống',
    ],
    links: [
      { label: 'Mở Dashboard giáo viên', href: '/giao-vien' },
    ],
  },
  {
    id: 'upload',
    title: 'Upload & Xử lý Tài liệu',
    durationMinutes: 5,
    goal: 'Demo Document AI',
    icon: FileText,
    color: 'purple',
    script: `"Bây giờ, tôi sẽ cho AI đọc một file Word/PDF thật. Thầy/cô chỉ cần upload tài liệu đang dạy, AI sẽ tự động tóm tắt nội dung chính, rút ra khái niệm trọng tâm và gợi ý cấu trúc bài dạy. Quá trình này mất khoảng 30 giây."`,
    bullets: [
      'Vào trang upload tài liệu',
      'Upload file mẫu (Word/PDF)',
      'Chờ AI xử lý (nói chuyện trong lúc chờ)',
      'Chỉ vào phần tóm tắt / key concepts',
      'Giải thích AI đã "đọc" và "hiểu" nội dung',
    ],
    links: [
      { label: 'Mở trang upload tài liệu', href: '/giao-vien/tai-lieu/upload' },
    ],
  },
  {
    id: 'lesson-builder',
    title: 'Tạo Bài giảng 45 phút',
    durationMinutes: 8,
    goal: 'Demo Lesson Builder - Điểm nhấn chính!',
    icon: BookOpen,
    color: 'indigo',
    script: `"Từ tài liệu vừa xử lý, tôi sẽ tạo một bài giảng 45 phút hoàn chỉnh: gồm phần mở bài, slide giảng dạy, flashcards ôn tập và worksheet bài tập. Tất cả đều do AI gợi ý, giáo viên chỉ cần chỉnh nhẹ. Đây là tính năng cốt lõi của hệ thống."`,
    bullets: [
      'Vào /giao-vien/bai-giang → Tạo bài giảng mới',
      'Nhập tiêu đề, môn học, lớp, mục tiêu',
      'Nhấn "Tạo với AI" và chờ (~30s)',
      'Cho xem 6 bước: Intro → Slides → Flashcards → Worksheet → Discussion → Summary',
      'Demo kéo thả đổi thứ tự bước',
      'Chỉnh thời lượng từng bước (tổng vẫn = 45 phút)',
    ],
    links: [
      { label: 'Mở danh sách bài giảng', href: '/giao-vien/bai-giang' },
    ],
  },
  {
    id: 'lesson-player',
    title: 'Dạy thử với LessonPlayer',
    durationMinutes: 10,
    goal: 'Demo Live Teaching - Wow factor!',
    icon: Monitor,
    color: 'green',
    script: `"Giờ tôi sẽ dạy thử một đoạn như khi đứng lớp. Thầy/cô nhìn vào LessonPlayer: bên phải là các bước của bài dạy, ở giữa là nội dung slide/flashcards/worksheet, phía trên là đồng hồ và tiến độ. Giáo viên chỉ cần bấm Next/Back, mọi thứ còn lại hệ thống lo."`,
    bullets: [
      'Nhấn "Dạy" trên một bài giảng → vào LessonPlayer',
      'Cho chạy timer, chỉ vào progress bar',
      'Demo 2-3 bước: Intro, Slide, Flashcard',
      'Dùng phím tắt: Space (pause), → (next), ← (back)',
      'Nhấn "Hoàn thành" để hiện Lesson Summary',
      'Show: thống kê thời gian, AI gợi ý, ghi chú giáo viên',
    ],
    links: [
      { label: 'Mở bài giảng mẫu', href: '/giao-vien/bai-giang' },
    ],
  },
  {
    id: 'student-view',
    title: 'Học sinh làm bài',
    durationMinutes: 3,
    goal: 'Show Student View',
    icon: Users,
    color: 'orange',
    script: `"Đây là màn hình học sinh. Các em sẽ thấy bài học được giao, làm bài tập ngay trên hệ thống: trắc nghiệm, điền vào chỗ trống, kéo thả. Kết quả được gửi lại cho giáo viên để xem ngay sau tiết học. Không cần in đề, không cần thu bài."`,
    bullets: [
      'Mở /hoc-sinh/demo-lesson trong tab mới',
      'Cho xem giao diện học sinh',
      'Demo làm worksheet: MCQ, điền vào chỗ trống',
      'Nộp bài → xem kết quả ngay lập tức',
    ],
    links: [
      { label: 'Mở demo bài học học sinh', href: '/hoc-sinh/demo-lesson' },
    ],
  },
  {
    id: 'closing',
    title: 'Tổng kết & Q&A',
    durationMinutes: 2,
    goal: 'Kết thúc & gợi ý discussion',
    icon: MessageSquare,
    color: 'amber',
    script: `"Tóm lại, với Classroom AI, giáo viên tiết kiệm được 3-5 giờ mỗi tuần cho việc soạn giáo án và làm bài tập. Quan trọng hơn, thầy/cô có một khung bài giảng rõ ràng, dễ dạy, dễ điều chỉnh. Nếu triển khai cho cả tổ/bộ môn, mọi người có thể chia sẻ chung một kho bài giảng chuẩn. Thầy/cô có câu hỏi gì không?"`,
    bullets: [
      'Nhấn mạnh tiết kiệm 3-5 giờ/tuần',
      'Hỗ trợ tiếng Việt 100%, mọi môn, nhiều cấp',
      'Có thể xuất slide sang PowerPoint, in đề',
      'Cá nhân hoá bài tập theo trình độ học sinh',
      'Chia sẻ bài giảng trong tổ bộ môn',
    ],
    links: [],
  },
];

const totalDuration = demoSections.reduce((sum, s) => sum + s.durationMinutes, 0);

export default function DemoScriptPage() {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setCompletedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const completedCount = completedSections.size;
  const progress = (completedCount / demoSections.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  Kịch bản Demo 30 phút
                </h1>
              </div>
              <p className="text-[var(--text-secondary)] max-w-xl">
                Dùng khi bạn giới thiệu GiaovienAI cho giáo viên hoặc nhà trường.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                  <Clock className="h-4 w-4" strokeWidth={1.75} />
                  <span>Tổng thời gian</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">~{totalDuration} phút</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                  <Target className="h-4 w-4" strokeWidth={1.75} />
                  <span>Tiến độ</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{completedCount}/{demoSections.length}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-mono-200 dark:bg-mono-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tip */}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Gợi ý:</strong> Mở song song 2 cửa sổ - 1 để đọc script này, 1 để thao tác sản phẩm.
            </p>
          </div>
        </div>
      </header>

      {/* Quick Links Bar */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-soft)]">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-sm text-[var(--text-tertiary)] flex-shrink-0">Mở nhanh:</span>
            <Link href="/giao-vien">
              <Button variant="secondary" size="sm">
                Dashboard GV
              </Button>
            </Link>
            <Link href="/giao-vien/bai-giang">
              <Button variant="secondary" size="sm">
                Bài giảng
              </Button>
            </Link>
            <Link href="/giao-vien/tai-lieu/upload">
              <Button variant="secondary" size="sm">
                Upload tài liệu
              </Button>
            </Link>
            <Link href="/hoc-sinh/demo-lesson" target="_blank">
              <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="h-3 w-3" />}>
                Demo học sinh
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {demoSections.map((section, index) => {
            const isCompleted = completedSections.has(section.id);
            const Icon = section.icon;

            return (
              <Card
                key={section.id}
                className={cn(
                  'transition-all duration-300',
                  isCompleted && 'opacity-60'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" strokeWidth={1.75} />
                        ) : (
                          <Circle className="h-6 w-6 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                        )}
                      </button>

                      {/* Section Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="default">Phần {index + 1}</Badge>
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            `bg-${section.color}-100 dark:bg-${section.color}-900/30`
                          )}>
                            <Icon className={`h-4 w-4 text-${section.color}-600 dark:text-${section.color}-400`} strokeWidth={1.75} />
                          </div>
                          <CardTitle className={cn(
                            'text-lg',
                            isCompleted && 'line-through'
                          )}>
                            {section.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-[var(--text-tertiary)]">
                            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                            ~{section.durationMinutes} phút
                          </span>
                          <span className="text-[var(--text-tertiary)]">|</span>
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Target className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {section.goal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Script */}
                  <div className="p-4 bg-[var(--bg-soft)] rounded-xl border border-[var(--border-default)]">
                    <p className="text-[var(--text-primary)] italic leading-relaxed">
                      {section.script}
                    </p>
                  </div>

                  {/* Bullets */}
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Điểm cần nhấn mạnh:
                    </h4>
                    <ul className="space-y-1.5">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Links */}
                  {section.links.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-default)]">
                      {section.links.map((link, i) => (
                        <Link key={i} href={link.href} target={link.href.startsWith('/hoc-sinh') ? '_blank' : '_self'}>
                          <Button
                            variant="secondary"
                            size="sm"
                            rightIcon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />}
                          >
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedCount === demoSections.length && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 text-center">
            <Award className="h-12 w-12 mx-auto text-green-500 mb-3" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
              Hoàn thành Demo!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Bạn đã đi qua tất cả các phần. Chúc buổi demo thành công!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

/**
 * Student Demo Flashcard Page
 *
 * A demonstration page showing how students can study with flashcards.
 * Includes a mock flashcard deck for Vietnamese Literature.
 */

import { useState } from 'react';
import { ArrowLeft, Brain, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { FlashcardDeck } from '@/types/domain';

// Mock flashcard deck for demonstration - Vietnamese Literature
const mockFlashcardDeck: FlashcardDeck = {
  id: 'demo-deck-1',
  title: 'Truyện Kiều - Nguyễn Du',
  description: 'Flashcards ôn tập tác phẩm Truyện Kiều',
  subject: 'Ngữ văn',
  gradeLevel: 'Lớp 10',
  createdAt: new Date().toISOString(),
  cards: [
    {
      id: 'card-1',
      front: 'Nguyễn Du sinh năm nào?',
      back: 'Năm 1765 (Ất Dậu), tại làng Tiên Điền, huyện Nghi Xuân, tỉnh Hà Tĩnh',
      difficulty: 'easy',
      category: 'Tác giả',
    },
    {
      id: 'card-2',
      front: 'Truyện Kiều được viết dựa trên tác phẩm nào của Trung Quốc?',
      back: '"Kim Vân Kiều truyện" của Thanh Tâm Tài Nhân (Trung Quốc)',
      hint: 'Tác phẩm của một tác giả đời Minh-Thanh',
      difficulty: 'medium',
      category: 'Nguồn gốc',
    },
    {
      id: 'card-3',
      front: 'Truyện Kiều có bao nhiêu câu thơ?',
      back: '3254 câu thơ lục bát',
      difficulty: 'easy',
      category: 'Tác phẩm',
    },
    {
      id: 'card-4',
      front: 'Thúy Kiều có tài gì nổi bật?',
      back: 'Cầm - Kỳ - Thi - Họa (đặc biệt là tài đánh đàn và làm thơ)',
      hint: 'Bốn nghệ thuật cổ điển',
      difficulty: 'easy',
      category: 'Nhân vật',
    },
    {
      id: 'card-5',
      front: 'Kim Trọng là ai trong Truyện Kiều?',
      back: 'Người yêu đầu tiên của Thúy Kiều, một văn nhân tài tử họ Kim',
      difficulty: 'easy',
      category: 'Nhân vật',
    },
    {
      id: 'card-6',
      front: '"Trăm năm trong cõi người ta, Chữ tài chữ mệnh khéo là ghét nhau" - Ý nghĩa?',
      back: 'Thể hiện quan niệm "tài mệnh tương đố" - người có tài thường gặp nhiều bất hạnh, số phận nghiệt ngã',
      hint: 'Đây là hai câu mở đầu tác phẩm',
      difficulty: 'hard',
      category: 'Ý nghĩa',
    },
    {
      id: 'card-7',
      front: 'Vì sao Thúy Kiều phải bán mình chuộc cha?',
      back: 'Gia đình Kiều bị vu oan, cha và em bị bắt. Kiều bán mình cho Mã Giám Sinh để lấy tiền chuộc cha.',
      difficulty: 'medium',
      category: 'Nội dung',
    },
    {
      id: 'card-8',
      front: 'Từ Hải là nhân vật như thế nào?',
      back: 'Một anh hùng "đội trời đạp đất", thủ lĩnh nghĩa quân, người đã cứu Kiều thoát khỏi lầu xanh',
      hint: 'Nhân vật được coi là hiện thân của lý tưởng anh hùng',
      difficulty: 'medium',
      category: 'Nhân vật',
    },
    {
      id: 'card-9',
      front: 'Giá trị hiện thực của Truyện Kiều là gì?',
      back: 'Phản ánh xã hội phong kiến thối nát, đồng cảm với số phận người phụ nữ, lên án bọn buôn người',
      difficulty: 'hard',
      category: 'Giá trị',
    },
    {
      id: 'card-10',
      front: 'Giá trị nhân đạo của Truyện Kiều thể hiện qua điều gì?',
      back: 'Đề cao vẻ đẹp và phẩm chất của con người, đặc biệt là người phụ nữ; thể hiện ước mơ về tự do, tình yêu chân chính',
      difficulty: 'hard',
      category: 'Giá trị',
    },
    {
      id: 'card-11',
      front: 'Thể thơ của Truyện Kiều là gì?',
      back: 'Thơ lục bát - thể thơ dân tộc Việt Nam (câu 6 chữ xen câu 8 chữ)',
      difficulty: 'easy',
      category: 'Nghệ thuật',
    },
    {
      id: 'card-12',
      front: '"Ép dầu, ép mỡ ai ép duyên" xuất hiện trong đoạn nào?',
      back: 'Trong lời của Thúy Kiều khi Mã Giám Sinh ép cưới, thể hiện sự phản kháng của Kiều',
      hint: 'Liên quan đến việc Kiều bị ép gả',
      difficulty: 'medium',
      category: 'Nội dung',
    },
  ],
};

export default function DemoFlashcardPage() {
  const [mode, setMode] = useState<'preview' | 'study'>('preview');

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
                  Demo Flashcards
                </h1>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Ôn tập với thẻ ghi nhớ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={mode === 'preview' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMode('preview')}
                leftIcon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
              >
                Xem lướt
              </Button>
              <Button
                variant={mode === 'study' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setMode('study')}
                leftIcon={<Brain className="h-4 w-4" strokeWidth={1.75} />}
              >
                Chế độ học
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-soft)] border border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">
                {mockFlashcardDeck.title}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {mockFlashcardDeck.subject} - {mockFlashcardDeck.gradeLevel} - {mockFlashcardDeck.cards.length} thẻ
              </p>
            </div>
          </div>
        </div>

        {/* Flashcard Viewer */}
        <div className="h-[600px] rounded-2xl border border-[var(--border-default)] overflow-hidden">
          <FlashcardViewer
            deck={mockFlashcardDeck}
            mode={mode}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl bg-mono-100 dark:bg-mono-800">
          <h3 className="font-medium text-[var(--text-primary)] mb-2">
            Hướng dẫn sử dụng
          </h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>- Nhấn Space hoặc Enter để lật thẻ</li>
            <li>- Nhấn mũi tên trái/phải để chuyển thẻ</li>
            <li>- Nhấn H để xem gợi ý (nếu có)</li>
            <li>- Ở chế độ học, đánh giá mức độ nhớ sau khi lật thẻ</li>
            <li>- Màu viền thẻ cho biết độ khó: Xanh (Dễ), Vàng (Trung bình), Đỏ (Khó)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
